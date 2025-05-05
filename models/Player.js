const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  username: String,
  wallet: {
    BTC: { type: Number, default: 0.01 },
    ETH: { type: Number, default: 0.5 }
  }
});

module.exports = mongoose.model('Player', PlayerSchema);
