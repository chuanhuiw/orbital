const express = require('express');
const router = express.Router();
const { User } = require('../models/user');

router.delete('/', async (req, res) => {
    const { username, category } = req.body;
  
    try {
      const user = await User.findOne({ username });
  
      if (user) {
        user.categories = user.categories.filter(cat => cat !== category);
        await user.save();
        res.json({ success: true, categories: user.categories });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  module.exports = router;