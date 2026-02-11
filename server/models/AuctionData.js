const mongoose = require('mongoose');

const auctionDataSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  players: { type: Array, default: [] },
  teams: { type: Array, default: [] },
  sport: { type: String, default: 'Cricket' },
  history: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuctionData', auctionDataSchema);
