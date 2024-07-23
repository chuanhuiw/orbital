const router = require('express').Router();
const { User } = require('../models/user');

router.get('/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // Find user in the database based on email
        const user = await User.findOne({ email: username });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Send the studyTimes array to the frontend
        res.status(200).send(user.studyTimes);
    } catch (error) {
        console.error('Error fetching study times:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;
