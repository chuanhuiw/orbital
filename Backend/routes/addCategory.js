const express = require('express');
const router = express.Router();
const { User } = require('../models/user');

router.post('/', async (req, res) => {
    const { username, category } = req.body;
  
    try {
        const user = await User.findOne({ email: username });
  
        if (user) {
            if (!user.categories) {
                user.categories = [];
            }
      
            if (!user.categories.includes(category)) {
                user.categories.push(category);
                await user.save();
                res.json({ success: true, categories: user.categories });
            } else {
                res.status(400).json({ success: false, message: 'Category already exists' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
