const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const playerRoutes = require('./routes/playerRoutes');
const Player = require('./models/Player');
const GameRound = require('./models/GameRound');
const { fetchPrices } = require('./services/priceService');
const { getCrashPoint } = require('./utils/cryptoUtils');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api', playerRoutes);

let currentRound = null;
let multiplier = 1.0;
let roundInterval;

async function startRound() {
  const prices = await fetchPrices();
  multiplier = 1.0;

  const crashPoint = getCrashPoint();
  const roundId = Date.now().toString();
  const round = new GameRound({ roundId, crashPoint, startTime: new Date(), bets: [] });
  await round.save();

  currentRound = round;

  io.emit('round_start', { roundId });

  roundInterval = setInterval(async () => {
    multiplier += 0.01;
    if (multiplier >= crashPoint) {
      clearInterval(roundInterval);
      io.emit('round_crash', { crashPoint });
      currentRound = null;
      setTimeout(startRound, 10000);
    } else {
      io.emit('multiplier_update', { multiplier: multiplier.toFixed(2) });
    }
  }, 100);
}

io.on('connection', (socket) => {
  console.log('Player connected');

  socket.on('cashout', async ({ playerId }) => {
    if (!currentRound) return;
    const bet = currentRound.bets.find(b => b.playerId === playerId && !b.cashedOut);
    if (!bet) return;

    const prices = await fetchPrices();
    const player = await Player.findById(playerId);
    const payout = bet.cryptoAmount * multiplier;

    bet.cashedOut = true;
    bet.cashoutMultiplier = multiplier;

    player.wallet[bet.currency] += payout;
    await player.save();
    await currentRound.save();

    io.emit('player_cashout', {
      playerId,
      payout: payout.toFixed(8),
      multiplier: multiplier.toFixed(2)
    });
  });
});

app.post('/api/place-bet', async (req, res) => {
  const { playerId, usdAmount, currency } = req.body;
  const player = await Player.findById(playerId);
  if (!player) return res.status(404).send('Player not found');

  const prices = await fetchPrices();
  const price = prices[currency];
  if (!price || price <= 0) {
    return res.status(400).send('Invalid cryptocurrency price');
  }
  
  const cryptoAmount = usdAmount / prices[currency];

  if (isNaN(usdAmount) || usdAmount <= 0) {
    return res.status(400).send('Invalid USD amount');
  }
  if (player.wallet[currency] < cryptoAmount) {
    return res.status(400).send('Insufficient balance');
  }

  player.wallet[currency] -= cryptoAmount;
  await player.save();

  currentRound.bets.push({ playerId, usdAmount, cryptoAmount, currency, cashedOut: false });
  await currentRound.save();

  res.send({ success: true });
});

app.post('/api/cashout', async (req, res) => {
  const { playerId } = req.body;

  if (!currentRound) {
    return res.status(400).send('No active game round');
  }

  const bet = currentRound.bets.find(b => b.playerId === playerId && !b.cashedOut);
  if (!bet) {
    return res.status(404).send('No active bet for this player');
  }

  const prices = await fetchPrices();
  const player = await Player.findById(playerId);
  const payout = bet.cryptoAmount * multiplier;

  bet.cashedOut = true;
  bet.cashoutMultiplier = multiplier;

  player.wallet[bet.currency] += payout;
  await player.save();
  await currentRound.save();

  res.send({
    success: true,
    payout: payout.toFixed(8),
    multiplier: multiplier.toFixed(2)
  });

  io.emit('player_cashout', {
    playerId,
    payout: payout.toFixed(8),
    multiplier: multiplier.toFixed(2)
  });
});

startRound();

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
