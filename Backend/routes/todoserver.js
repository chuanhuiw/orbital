const router = require('express').Router();
const TodoModel = require('../models/todoList');

// Get saved tasks from the database
router.get('/getTodoList', async (req, res) => {
    try {
        const todoList = await TodoModel.find({});
        res.json(todoList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new task to the database
router.post('/addTodoList', async (req, res) => {
    const { task, status, deadline } = req.body;
    try {
        const newTodo = await TodoModel.create({ task, status, deadline });
        res.json(newTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update task fields (including deadline)
router.post('/updateTodoList/:id', async (req, res) => {
    const { id } = req.params;
    const { task, status, deadline } = req.body;
    try {
        const updatedTodo = await TodoModel.findByIdAndUpdate(id, { task, status, deadline }, { new: true });
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete task from the database
router.delete('/deleteTodoList/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTodo = await TodoModel.findByIdAndDelete(id);
        res.json(deletedTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Toggle flagged status of a task
router.post('/toggleFlaggedTodo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const todo = await TodoModel.findById(id);
        if (!todo) {
            return res.status(404).json({ error: 'Task not found' });
        }
        todo.flagged = !todo.flagged; // Toggle flagged status
        await todo.save();
        res.json(todo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
