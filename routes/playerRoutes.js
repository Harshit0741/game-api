const express = require('express');
const Player = require('../models/Player');
const { fetchPrices } = require('../services/priceService');
const router = express.Router();

router.post('/create-player', async (req, res) => {
  const { username } = req.body;
  const player = await Player.create({ username });
  res.send(player);
});

router.get('/wallet/:playerId', async (req, res) => {
  const player = await Player.findById(req.params.playerId);
  if (!player) return res.status(404).send('Not found');

  const prices = await fetchPrices();
  const balance = Object.entries(player.wallet).reduce((acc, [cur, val]) => {
    acc[cur] = {
      crypto: val.toFixed(8),
      usd: (val * prices[cur]).toFixed(2)
    };
    return acc;
  }, {});

  res.send(balance);
});

module.exports = router;
