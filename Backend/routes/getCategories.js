const express = require('express');
const router = express.Router();
const { User } = require('../models/user');

router.get('/:username', async (req, res) => {
    const { username } = req.params;
  
    try {
      const user = await User.findOne({ email: username });
  
      if (user) {
        res.json(user.categories);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;