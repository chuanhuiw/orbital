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
const deleteCategory = require("./routes/deleteCategory");
const addCategory = require("./routes/addCategory");
const getCategories = require("./routes/getCategories");
const getCompletedList = require("./routes/getCompletedList");
const getStudyTimes = require("./routes/getStudyTimes");
const unlockBadge = require("./routes/unlockBadge");
const getUser = require("./routes/getUser");
const deleteAllDoneTasks = require("./routes/deleteDoneTasks");
const saveDurations = require("./routes/saveDurations");
const getDurations = require("./routes/getDurations");

//db connection
connection();

app.use(cors());

// {
//     origin: ["https://focusfish.vercel.app", "https://focusfishorbital.vercel.app", "https://focusfishorbital-8etz9leke-nandhananm7s-projects.vercel.app"],
//     methods: ["POST", "GET"],
//     credentials: true
// }

app.options('*', cors()); // handle preflight requests

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
app.use("/api/deleteCategory", deleteCategory);
app.use("/api/addCategory", addCategory);
app.use("/api/getCategories", getCategories);
app.use("/api/getCompletedList", getCompletedList);
app.use("/api/getStudyTimes", getStudyTimes);
app.use("/api/unlockBadge", unlockBadge);
app.use("/api/getUser", getUser);
app.use("/api/deleteAllDoneTasks", deleteAllDoneTasks);
app.use("/api/saveDurations", saveDurations);
app.use("/api/getDurations", getDurations);


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`))
