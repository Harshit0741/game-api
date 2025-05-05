const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

router.get('/wallet/:playerId', async (req, res) => {
  const player = await Player.findById(req.params.playerId);
  if (!player) return res.status(404).send('Player not found');

  const prices = require('../utils/priceCache');
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
