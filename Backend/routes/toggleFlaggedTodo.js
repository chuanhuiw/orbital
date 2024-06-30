// Example server-side code using Express and Mongoose
const express = require('express');
const router = express.Router();
const TodoModel = require('../models/todoList');

// POST endpoint to toggle flagged status
router.post('/:id', async (req, res) => {
    const { id } = req.params;
    const { flagged } = req.body;

    try {
        const todo = await TodoModel.findByIdAndUpdate(id, { flagged }, { new: true });

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json(todo);
    } catch (err) {
        console.error('Error toggling flagged status:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
