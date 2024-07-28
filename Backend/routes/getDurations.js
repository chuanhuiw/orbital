const express = require('express');
const router = express.Router();
const { User } = require('../models/user');

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ email: username });
    if (user && user.durations) {
      res.status(200).json({ durations: user.durations });
    } else {
      res.status(404).json({ error: 'No durations found for this user' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching durations' });
  }
});

module.exports = router;