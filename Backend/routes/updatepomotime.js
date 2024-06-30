const router = require('express').Router();
const { User } = require('../models/user');

router.put('/', async (req, res) => {
    const { date, seconds, category, username } = req.body;

    try {
        // Find user in the database based on email
        const user = await User.findOne({ email: username });

        if (!user) {
            console.log('User not found for email:', username);
            return res.status(404).send({ message: 'User not found' });
        }

        // Update or create the studyTimes object
        user.studyTimes = {
            date,
            seconds,
            category
        };

        // Save updated user object
        await user.save();

        console.log('Study time updated successfully');
        res.status(200).send({ message: 'Study time updated successfully' });
    } catch (error) {
        console.error('Error updating study time:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;
