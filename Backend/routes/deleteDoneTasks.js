const express = require('express');
const router = express.Router();
const Task = require('../models/todoList'); // Assuming you have a Task model

// Delete all tasks with status "done" for a user
router.post('/', async (req, res) => {
    const { userEmail } = req.body;

    try {
        await Task.deleteMany({ userEmail, status: 'done' });
        res.status(200).send({ message: 'All done tasks deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting done tasks', error });
    }
});

module.exports = router;
