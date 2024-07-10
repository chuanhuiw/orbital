const router = require('express').Router();
const TodoModel = require("../models/todoList");

// Backend route to fetch tasks with status "done"
router.get("/", async (req, res) => {
    const { userEmail } = req.query;
    try {
        const completedList = await TodoModel.find({ status: "done", userEmail });
        res.json(completedList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
