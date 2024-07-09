const express = require('express');
const router = express.Router();
const { User } = require('../models/user');

router.delete('/:username/:category', async (req, res) => {
    const { username, category } = req.params;
  
    try {
        const user = await User.findOne({ email: username });
  
        if (user) {
            if (user.categories && user.categories.includes(category)) {
                user.categories = user.categories.filter(cat => cat !== category);
                await user.save();
                res.json({ success: true, categories: user.categories, message: 'Category deleted successfully' });
            } else {
                res.status(400).json({ success: false, message: 'Category not found' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;


