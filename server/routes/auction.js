const express = require('express');
const AuctionData = require('../models/AuctionData');
const router = express.Router();

// Middleware to verify user (you might need to adjust based on your auth setup)
const verifyUser = (req, res, next) => {
  // For now, assuming userId is sent in headers or body
  // In production, you'd verify JWT or use Clerk's verification
  const userId = req.headers['user-id'] || req.body.userId;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  req.userId = userId;
  next();
};

// Get auction data for user
router.get('/data', verifyUser, async (req, res) => {
  try {
    const auctionData = await AuctionData.findOne({ userId: req.userId });
    if (!auctionData) {
      return res.json({
        players: [],
        teams: [],
        sport: 'Cricket',
        history: []
      });
    }
    res.json({
      players: auctionData.players,
      teams: auctionData.teams,
      sport: auctionData.sport,
      history: auctionData.history
    });
  } catch (error) {
    console.error('Error fetching auction data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Save auction data for user
router.post('/data', verifyUser, async (req, res) => {
  try {
    const { players, teams, sport, history } = req.body;
    await AuctionData.findOneAndUpdate(
      { userId: req.userId },
      { players, teams, sport, history, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving auction data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

module.exports = router;
