// durations.js
const express = require('express');
const router = express.Router();
const { User } = require('../models/user');

// Route to save durations
router.post('/', async (req, res) => {
  const { username, durations } = req.body;
  try {
    // Save durations in the database
    await User.updateOne({ email: username }, { $set: { durations } }, { upsert: true });
    res.status(200).json({ message: 'Durations saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving durations' });
  }
});

module.exports = router;