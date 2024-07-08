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

        // Find if there is an existing study time entry for the given date and category
        const existingEntry = user.studyTimes.find(entry => entry.date === date && entry.category === category);

        if (existingEntry) {
            // If an entry exists, update the seconds
            existingEntry.seconds += seconds;
        } else {
            // If no entry exists, add a new one
            user.studyTimes.push({ date, seconds, category });
        }

        // Save the updated user object
        await user.save();

        console.log('Study time updated successfully');
        res.status(200).send({ message: 'Study time updated successfully' });
    } catch (error) {
        console.error('Error updating study time:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;
