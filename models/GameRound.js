const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
  playerId: String,
  usdAmount: Number,
  cryptoAmount: Number,
  currency: String,
  cashedOut: Boolean,
  cashoutMultiplier: Number
});

const GameRoundSchema = new mongoose.Schema({
  roundId: String,
  crashPoint: Number,
  startTime: Date,
  bets: [BetSchema]
});

module.exports = mongoose.model('GameRound', GameRoundSchema);
