import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './index.css';

const DraggableTask = ({ task, index, moveTask, editableId, setEditableId, editedTask, setEditedTask, editedStatus, setEditedStatus, editedDeadline, setEditedDeadline, saveEditedTask, deleteTask, toggleEditable, statusOptions, toggleFlagged}) => {
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
            <td className="centered">
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
            <td className="centered">
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
            <td className="centered">
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
            <td className="centered">
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
                    </>
                )}
            </td>
        </tr>
    );
};

function Completed() {
    const [completedList, setCompletedList] = useState([]);
    const [editableId, setEditableId] = useState(null);
    const [editedTask, setEditedTask] = useState("");
    const [editedStatus, setEditedStatus] = useState("");
    const [editedDeadline, setEditedDeadline] = useState("");
    const [collapsed, setCollapsed] = useState(true); // State for sidebar collapse
    const statusOptions = ["done", "doing", "not started"];

    // Fetch completed tasks from database
    useEffect(() => {
        const userEmail = localStorage.getItem('username');
        axios.get('http://127.0.0.1:8080/api/getCompletedList', { params: { userEmail } })
        // axios.get('https://focusfish-backend-orbital.onrender.com/api/getCompletedList', { params: { userEmail } })
            .then(result => {
                setCompletedList(result.data);
            })
            .catch(err => console.log(err));
    }, []);

    const toggleEditable = (id) => {
        const rowData = completedList.find((data) => data._id === id);
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

        axios.post('http://127.0.0.1:8080/api/updateTodoList/' + id, editedData)
        // axios.post('https://focusfish-backend-orbital.onrender.com/api/updateTodoList/' + id, editedData)
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

    const deleteTask = (id) => {
        axios.delete('http://127.0.0.1:8080/api/deleteTodoList/' + id)
        // axios.delete('https://focusfish-backend-orbital.onrender.com/api/deleteTodoList/' + id)
            .then(result => {
                console.log(result);
                window.location.reload();
            })
            .catch(err => console.log(err));
    };

    const toggleFlagged = (id, currentFlagged) => {
        const updatedFlagged = !currentFlagged;
        axios.post(`http://127.0.0.1:8080/api/toggleFlaggedTodo/${id}`, { flagged: updatedFlagged })
        // axios.post(`https://focusfish-backend-orbital.onrender.com/api/toggleFlaggedTodo/${id}`, { flagged: updatedFlagged })
            .then(result => {
                console.log(result.data); // Log the response from the server
                const updatedCompletedList = completedList.map(item => {
                    if (item._id === id) {
                        return { ...item, flagged: updatedFlagged };
                    }
                    return item;
                });
                setCompletedList(updatedCompletedList);
                window.location.reload();
            })
            .catch(err => {
                console.error('Error toggling flagged status:', err);
            });
    };

    const moveTask = (fromIndex, toIndex) => {
        const updatedList = [...completedList];
        const [movedTask] = updatedList.splice(fromIndex, 1);
        updatedList.splice(toIndex, 0, movedTask);
        setCompletedList(updatedList);
    };


    // Function to toggle the sidebar's collapsed state
    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="container">
                <div className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
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

                <div className={`main-content ${collapsed ? 'collapsed' : 'expanded'}`}>
                    <center>
                    <h2 className="heading">Completed Tasks</h2>
                    <p className="tagline"> View all you Completed Tasks Below </p>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Status</th>
                                <th>Deadline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedList.map((task, index) => (
                                <DraggableTask
                                    key={task._id}
                                    task={task}
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
                                />
                            ))}
                        </tbody>
                    </table>
                    </center>
                </div>
            </div>
        </DndProvider>
    );
}

export default Completed;
