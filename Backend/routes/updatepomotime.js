const router = require('express').Router();
const { User } = require('../models/user');
const { parseISO, isValid, formatISO } = require('date-fns');

router.put('/', async (req, res) => {
    const { date, seconds, category, username } = req.body;

    // Validate the request body
    if (!date || !seconds || !category || !username) {
        return res.status(400).send({ message: 'All fields are required: date, seconds, category, username' });
    }

    // Validate the date format (assuming ISO 8601 format)
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
        return res.status(400).send({ message: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD).' });
    }

    // Convert to ISO format string
    const isoDate = formatISO(parsedDate, { representation: 'date' });

    try {
        // Find user in the database based on email
        const user = await User.findOne({ email: username });

        if (!user) {
            console.log('User not found for email:', username);
            return res.status(404).send({ message: 'User not found' });
        }

        // Find if there is an existing study time entry for the given date and category
        const existingEntry = user.studyTimes.find(entry => entry.date === isoDate && entry.category === category);

        if (existingEntry) {
            // If an entry exists, update the seconds
            existingEntry.seconds += seconds;
        } else {
            // If no entry exists, add a new one
            user.studyTimes.push({ date: isoDate, seconds, category });
        }

        // Save the updated user object
        await user.save();

        console.log('Study time updated successfully for user:', username);
        res.status(200).send({ message: 'Study time updated successfully' });
    } catch (error) {
        console.error('Error updating study time:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;
