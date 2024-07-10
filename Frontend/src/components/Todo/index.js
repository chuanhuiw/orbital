import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './index.css';

const DraggableTask = ({ task, index, moveTask, editableId, setEditableId, editedTask, setEditedTask, editedStatus, setEditedStatus, editedDeadline, setEditedDeadline, saveEditedTask, deleteTask, toggleEditable, statusOptions, toggleFlagged, markAsComplete }) => {
    const ref = useRef(null);

    const [, drop] = useDrop({
        accept: 'task',
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) {
                return;
            }
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            moveTask(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'task',
        item: { type: 'task', id: task._id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <tr ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <td>
                {editableId === task._id ? (
                    <input
                        type="text"
                        className="form-control"
                        value={editedTask}
                        onChange={(e) => setEditedTask(e.target.value)}
                    />
                ) : (
                    task.task
                )}
            </td>
            <td>
                {editableId === task._id ? (
                    <select
                        className="form-control"
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value)}
                    >
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                ) : (
                    task.status
                )}
            </td>
            <td>
                {editableId === task._id ? (
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={editedDeadline}
                        onChange={(e) => setEditedDeadline(e.target.value)}
                    />
                ) : (
                    task.deadline ? new Date(task.deadline).toLocaleString() : ''
                )}
            </td>
            <td>
                {editableId === task._id ? (
                    <button className="btn btn-success btn-sm" onClick={() => saveEditedTask(task._id)}>
                        Save
                    </button>
                ) : (
                    <>
                        <button className="edit_btn" onClick={() => toggleEditable(task._id)}>
                            ✏️
                        </button>
                        <button className="delete_btn" onClick={() => deleteTask(task._id)}>
                            🗑️
                        </button>
                        <button className={`flag_btn ${task.flagged ? 'flagged' : ''}`} onClick={() => toggleFlagged(task._id, task.flagged)}>
                            {task.flagged ? '📌' : 'Flag'}
                        </button>
                        <button className="complete_btn" onClick={() => markAsComplete(task._id)}>
                            ✅
                        </button>
                    </>
                )}
            </td>
        </tr>
    );
};

function Todo() {
    // Handle user logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/login";
    };

    // State variables
    const statusOptions = ["done", "doing", "not started"];
    const filterOptions = ["All Tasks", "Today", "Tomorrow", "This Week", "Later"];

    const [todoList, setTodoList] = useState([]);
    const [filteredTodoList, setFilteredToDoList]= useState([]);
    const [editableId, setEditableId] = useState(null);
    const [editedTask, setEditedTask] = useState("");
    const [editedStatus, setEditedStatus] = useState("");
    const [newTask, setNewTask] = useState("");
    const [newStatus, setNewStatus] = useState(statusOptions[0]); // Default to the first option
    const [newDeadline, setNewDeadline] = useState("");
    const [editedDeadline, setEditedDeadline] = useState("");
    const [collapsed, setCollapsed] = useState(true); // State for sidebar collapse
    const [selectedFilter, setSelectedFilter] = useState("All Tasks"); //sets the default filter as "All Tasks"

    // Fetch tasks from database
    useEffect(() => {
        const userEmail = localStorage.getItem('username');
        axios.get('http://127.0.0.1:8080/api/getTodoList', {params: { userEmail } })
       // axios.get('https://focusfish-backend-orbital.onrender.com/api/getTodoList', {params: { userEmail } })
            .then(result => {
                const incompleteTasks = result.data.filter(task => task.status !== "done");
                setTodoList(incompleteTasks);
                setFilteredToDoList(incompleteTasks);
            })
            .catch(err => console.log(err));
    }, []);

    // Function to toggle the editable state for a specific row
    const toggleEditable = (id) => {
        const rowData = todoList.find((data) => data._id === id);
        if (rowData) {
            setEditableId(id);
            setEditedTask(rowData.task);
            setEditedStatus(rowData.status);
            setEditedDeadline(rowData.deadline || "");
        } else {
            setEditableId(null);
            setEditedTask("");
            setEditedStatus("");
            setEditedDeadline("");
        }
    };

    // Function to add task to the database
    const addTask = (e) => {
        e.preventDefault();
        const userEmail = localStorage.getItem('username');
        if (!newTask || !newStatus || !newDeadline || !userEmail) {
            alert("All fields must be filled out.");
            return;
        }

        axios.post('http://127.0.0.1:8080/api/addTodoList', { task: newTask, status: newStatus, deadline: newDeadline, userEmail })
      //  axios.post('https://focusfish-backend-orbital.onrender.com/api/addTodoList', { task: newTask, status: newStatus, deadline: newDeadline, userEmail })
            .then(res => {
                console.log(res);
                window.location.reload();
            })
            .catch(err => console.log(err));
    };

    // Function to save edited data to the database
    const saveEditedTask = (id) => {
        const userEmail = localStorage.getItem('username');
        const editedData = {
            task: editedTask,
            status: editedStatus,
            deadline: editedDeadline,
            userEmail,
        };

        if (!editedTask || !editedStatus || !editedDeadline) {
            alert("All fields must be filled out.");
            return;
        }

        // Updating edited data to the database through updateById API
        axios.post('http://127.0.0.1:8080/api/updateTodoList/' + id, editedData)
   //     axios.post('https://focusfish-backend-orbital.onrender.com/api/updateTodoList/' + id, editedData)
            .then(result => {
                console.log(result);
                setEditableId(null);
                setEditedTask("");
                setEditedStatus("");
                setEditedDeadline("");
                window.location.reload();
            })
            .catch(err => console.log(err));
    };

    // Function to delete task from database
    const deleteTask = (id) => {
        axios.delete('http://127.0.0.1:8080/api/deleteTodoList/' + id)
    //    axios.delete('https://focusfish-backend-orbital.onrender.com/api/deleteTodoList/' + id)
            .then(result => {
                console.log(result);
                window.location.reload();
            })
            .catch(err => console.log(err));
    };

    // Function to toggle task flag status
    const toggleFlagged = (id, currentFlagged) => {
        const updatedFlagged = !currentFlagged;
        axios.post(`http://127.0.0.1:8080/api/toggleFlaggedTodo/${id}`, { flagged: updatedFlagged })
   //     axios.post(`https://focusfish-backend-orbital.onrender.com/api/toggleFlaggedTodo/${id}`, { flagged: updatedFlagged })
            .then(result => {
                console.log(result.data); // Log the response from the server
                // Update todoList to reflect the change
                const updatedTodoList = todoList.map(item => {
                    if (item._id === id) {
                        return { ...item, flagged: updatedFlagged };
                    }
                    return item;
                });
                setTodoList(updatedTodoList);
                window.location.reload();
            })
            .catch(err => {
                console.error('Error toggling flagged status:', err);
            });
    };

    // Function to toggle the sidebar's collapsed state
    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const filterTasks = (option) => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Adjust start to previous Sunday if today is Sunday
        startOfWeek.setHours(0, 0, 0, 0);
    
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999);
    
        let filtered = [];
        switch(option) {
            case "Today":
                filtered = todoList.filter(task => {
                    const deadline = new Date(task.deadline);
                    return deadline.toDateString() === today.toDateString() && task.status !== "done";
                });
                break;
            case "Tomorrow":
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                filtered = todoList.filter(task => {
                    const deadline = new Date(task.deadline);
                    return deadline.toDateString() === tomorrow.toDateString() && task.status !== "done";
                });
                break;
            case "This Week":
                filtered = todoList.filter(task => {
                    const deadline = new Date(task.deadline);
                    return deadline >= startOfWeek && deadline <= endOfWeek && task.status !== "done";
                });
                break;
            case "Later":
                filtered = todoList.filter(task => {
                    const deadline = new Date(task.deadline);
                    return deadline > endOfWeek && task.status !== "done";
                });
                break;
            default:
                filtered = todoList.filter(task => task.status !== "done");
                break;
        }
        setFilteredToDoList(filtered);
        setSelectedFilter(option);
    };
    
    
    const moveTask = (fromIndex, toIndex) => {
        const updatedList = [...todoList];
        const [movedTask] = updatedList.splice(fromIndex, 1);
        updatedList.splice(toIndex, 0, movedTask);
        setTodoList(updatedList);
        setFilteredToDoList(updatedList);
    };

    const markAsComplete = (id) => {
        const userEmail = localStorage.getItem('username');
        const updatedData = { status: 'done', userEmail };

        axios.post('http://127.0.0.1:8080/api/updateTodoList/' + id, updatedData)
        // axios.post('https://focusfish-backend-orbital.onrender.com/api/updateTodoList/' + id, updatedData)
            .then(result => {
                console.log(result);
                // Update the task status in the todoList
                const updatedTodoList = todoList.map(task => {
                    if (task._id === id) {
                        return { ...task, status: 'done' };
                    }
                    return task;
                });
                setTodoList(updatedTodoList);
                setFilteredToDoList(updatedTodoList);
            })
            .catch(err => console.log(err));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="container">
                <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                    <button className="toggle-btn" onClick={toggleSidebar}>
                        ☰
                    </button>
                    {!collapsed ? (
                        <div>
                            <Link to="/main">
                                <button className="sidebar_button1">
                                    🏠 Back to Dashboard
                                </button>
                            </Link>
                            <Link to="/todo">
                                <button className="sidebar_button4">
                                    📝 All Tasks
                                </button>
                            </Link>
                            <Link to="/importantTodo">
                                <button className="sidebar_button2">
                                    📌 Important
                                </button>
                            </Link>
                            <Link to="/completedTodo">
                                <button className="sidebar_button3">
                                    ✅ Completed
                                </button>
                            </Link>
                        
                        </div>
                    ) : (
                        <div>
                            <Link to="/main">
                                <button className="smallsidebar_button1">
                                    🏠
                                </button>
                            </Link>
                            <Link to="/todo">
                                <button className="smallsidebar_button4">
                                    📝
                                </button>
                            </Link>
                            <Link to="/importantTodo">
                                <button className="smallsidebar_button2">
                                    📌
                                </button>
                            </Link>
                            <Link to="/completedTodo">
                            <button className="smallsidebar_button3">
                                ✅
                            </button>
                            </Link>
                        </div>
                    )}
                </div>
                <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
                    <h1> FocusFish <button className="logout_btn" onClick={handleLogout}>Log out</button> </h1>
                    <div className="row">
                        <div>
                            <h2 className="text-left">All Tasks</h2>
                            <div className="filterContainer">
                                <label className="filter" htmlFor="filter">Filter by: </label>
                                <select className="filterDropdown" value={selectedFilter} onChange={(e) => filterTasks(e.target.value)}>
                                    {filterOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-primary">
                                        <tr>
                                            <th>Task</th>
                                            <th>Status</th>
                                            <th>Deadline</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    {Array.isArray(filteredTodoList) ? (
                                        <tbody>
                                            {filteredTodoList.map((data, index) => (
                                                <DraggableTask
                                                    key={data._id}
                                                    task={data}
                                                    index={index}
                                                    moveTask={moveTask}
                                                    editableId={editableId}
                                                    setEditableId={setEditableId}
                                                    editedTask={editedTask}
                                                    setEditedTask={setEditedTask}
                                                    editedStatus={editedStatus}
                                                    setEditedStatus={setEditedStatus}
                                                    editedDeadline={editedDeadline}
                                                    setEditedDeadline={setEditedDeadline}
                                                    saveEditedTask={saveEditedTask}
                                                    deleteTask={deleteTask}
                                                    toggleEditable={toggleEditable}
                                                    statusOptions={statusOptions}
                                                    toggleFlagged={toggleFlagged}
                                                    markAsComplete={markAsComplete}
                                                />
                                            ))}
                                        </tbody>
                                    ) : (
                                        <tbody>
                                            <tr>
                                                <td colSpan="4">Loading tasks...</td>
                                            </tr>
                                        </tbody>
                                    )}
                                </table>
                            </div>
                        </div>
                        <center>
                            <div className="col-md-5">
                                <h2 className="text-center">Add a new task</h2>
                                <form className="bg-light">
                                    <div className="mb-3">
                                        <label id="task_label">Task</label>
                                        <input
                                            className="input"
                                            type="text"
                                            id="task_input"
                                            placeholder="What next!?"
                                            onChange={(e) => setNewTask(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label id="status_label">Status</label>
                                        <select
                                            className="input"
                                            id="status_input"
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label id="deadline_label">Deadline</label>
                                        <input
                                            className="input"
                                            id="deadline_input"
                                            type="datetime-local"
                                            onChange={(e) => setNewDeadline(e.target.value)}
                                        />
                                    </div>
                                    <button onClick={addTask} className="btn btn-success btn-sm">
                                        Add Task
                                    </button>
                                </form>
                            </div>
                        </center>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}

export default Todo;
