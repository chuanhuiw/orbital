const router = require('express').Router();
const TodoModel = require('../models/todoList');

// Delete task from the database
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTodo = await TodoModel.findByIdAndDelete(id);
        res.json(deletedTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;