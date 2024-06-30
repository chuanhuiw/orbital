const router = require('express').Router();
const TodoModel = require('../models/todoList');

// Add new task to the database
router.post('/', async (req, res) => {
    const { task, status, deadline, userEmail } = req.body;
    try {
        const newTodo = await TodoModel.create({ task, status, deadline, userEmail });
        res.json(newTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
