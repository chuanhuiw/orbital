const router = require('express').Router();
const { User } = require('../models/user');
const { parseISO, isValid, formatISO } = require('date-fns');

router.put('/', async (req, res) => {
    const { date, seconds, category, username } = req.body;
    console.log('Request body:', req.body);


    // Validate the request body
    if (!date || !seconds || !category || !username) {
        return res.status(400).send({ message: 'All fields are required: date, seconds, category, username' });
    }

    // Validate the date format (assuming ISO 8601 format)
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
        return res.status(400).send({ message: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD).' });
    }

    // Convert to ISO format string (YYYY-MM-DD)
    const isoDate = formatISO(parsedDate, { representation: 'date' });

    try {
        // Find user in the database based on email
        const user = await User.findOne({ email: username });

        if (!user) {
            console.log('User not found for email:', username);
            return res.status(404).send({ message: 'User not found' });
        }

        console.log('Before update:', user.studyTimes);

        // // Ensure user.studyTimes is initialized
        // if (!user.studyTimes) {
        //     user.studyTimes = [];
        // }

        // Convert existing entry dates to ISO string for comparison
        const existingEntry = user.studyTimes.find(entry => {
            const entryDate = formatISO(new Date(entry.date), { representation: 'date' });
            console.log(`Comparing stored date: ${entryDate} with incoming date: ${isoDate}`);
            return entryDate === isoDate && entry.category === category;
        });

        console.log('Existing Entry:', existingEntry);

        if (existingEntry) {
            // If an entry exists, update the seconds
            existingEntry.seconds += seconds;
            console.log(`Updated existing entry with date: ${isoDate} and category: ${category}. New seconds: ${existingEntry.seconds}`);
        } else {
            // If no entry exists, add a new one with the correct seconds
            user.studyTimes.push({ date: isoDate, seconds, category });
            console.log(`Added new entry with date: ${isoDate} and category: ${category}. Seconds: ${seconds}`);
        }

        console.log('After update:', user.studyTimes);

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
