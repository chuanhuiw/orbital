const router = require('express').Router();
const TodoModel = require('../models/todoList');

// Update task fields (including deadline)
router.post('/:id', async (req, res) => {
    const { id } = req.params;
    const { task, status, deadline, userEmail } = req.body;
    try {
        const updatedTodo = await TodoModel.findByIdAndUpdate(id, { task, status, deadline, userEmail }, { new: true });
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
