const router = require('express').Router();
const TodoModel = require('../models/todoList');

// Get saved tasks from the database
router.get('/', async (req, res) => {
    const { userEmail } = req.query;
    try {
        const todoList = await TodoModel.find({ userEmail });
        res.json(todoList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
