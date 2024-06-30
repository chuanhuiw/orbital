const router = require('express').Router();
const TodoModel = require("../models/todoList");


// Backend route to fetch flagged tasks
router.get("/", async(req, res) => {
    const { userEmail } = req.query;
    try {
        const ImportantList = await TodoModel.find({ flagged: true, userEmail });
        res.json(ImportantList);
    } catch (err) {
        res.status(500).json({ error:err.message });
    }

});

module.exports = router;

