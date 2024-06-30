require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const updatepopotimeRoutes = require("./routes/updatepomotime");
const getTodoListRoutes = require("./routes/getTodoList");
const addTodoListRoutes = require("./routes/addTodoList");
const updateTodoListRoutes = require("./routes/updateTodoList");
const deleteTodoListRoutes = require("./routes/deleteTodoList");
const toggleFlaggedTodo = require("./routes/toggleFlaggedTodo");
const getImportantListRoutes = require("./routes/getImportantList");
//const todoRoutes = require("./routes/todoserver");

//db connection
connection();

app.use(cors(
    {
        origin: ["https://focusfish.vercel.app"],
        methods: ["POST", "GET"],
        credentials: true
    }
));
app.use(express.json())

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/updatepomotime", updatepopotimeRoutes);
app.use("/api/getTodoList", getTodoListRoutes);
app.use("/api/addTodoList", addTodoListRoutes);
app.use("/api/updateTodoList", updateTodoListRoutes);
app.use("/api/deleteTodoList", deleteTodoListRoutes);
app.use("/api/toggleFlaggedTodo", toggleFlaggedTodo);
app.use("/api/getImportantList", getImportantListRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`))
