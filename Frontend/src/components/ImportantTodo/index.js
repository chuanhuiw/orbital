import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import './index.css';

function Important() {
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.reload();
        window.location.href = "/login";
    };


    const [importantList, setImportantList] = useState([]);
    const [collapsed, setCollapsed] = useState(true); // State for sidebar collapse
    const [filteredTodoList, setFilteredToDoList] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState("All Tasks");
    const filterOptions = ["All Tasks", "Today", "Tomorrow", "This Week", "Later"];

    // Fetch flagged tasks from database
    useEffect(() => {
        const userEmail = localStorage.getItem('username');
        //axios.get('http://127.0.0.1:8080/api/getImportantList', { params: { userEmail } })
        axios.get('https://focusfish-backend-orbital.onrender.com/api/getImportantList', { params: { userEmail} })
            .then(result => {
                setImportantList(result.data);
                setFilteredToDoList(result.data);
            })
            .catch(err => console.log(err));
    }, []);

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
        switch (option) {
            case "Today":
                filtered = importantList.filter(task => {
                    const deadline = new Date(task.deadline);
                    return deadline.toDateString() === today.toDateString();
                });
                break;
            case "Tomorrow":
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                filtered = importantList.filter(task => {
                    const deadline = new Date(task.deadline);
                    return deadline.toDateString() === tomorrow.toDateString();
                });
                break;
            case "This Week":
                filtered = importantList.filter(task => {
                    const deadline = new Date(task.deadline);
                    return deadline >= startOfWeek && deadline <= endOfWeek;
                });
                break;
            case "Later":
                filtered = importantList.filter(task => {
                    const deadline = new Date(task.deadline);
                    return deadline > endOfWeek;
                });
                break;
            default:
                filtered = importantList;
                break;
        }
        setFilteredToDoList(filtered);
        setSelectedFilter(option);
    };

    return (
        <div>
        <header>
                    <div className="header-container">
                        <div className="left-container">
                            <h1>FocusFish</h1>
                            <Link to="/main"><button className="back-btn">🏠 Back to Dashboard</button></Link>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>Log out</button>
                    </div>
                </header>
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
                <h1 className="heading">Important Tasks</h1>
                <h3 className="tagline"> Find all your Flagged Tasks here! </h3>
                <div className="row">
                <div className="filterContainer">
                <label className="filter" htmlFor="filter">Filter by: </label>
                <select className="filterDropdown" value={selectedFilter} onChange={(e) => filterTasks(e.target.value)}>
                    {filterOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
                    <div>
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="table-primary">
                                    <tr>
                                        <th>Task</th>
                                        <th>Status</th>
                                        <th>Deadline</th>
                                    </tr>
                                </thead>
                                {Array.isArray(filteredTodoList) ? (
                                    <tbody>
                                        {filteredTodoList.map((data) => (
                                            <tr key={data._id}>
                                                <td>{data.task}</td>
                                                <td>{data.status}</td>
                                                <td>{data.deadline ? new Date(data.deadline).toLocaleString() : ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                ) : (
                                    <tbody>
                                        <tr>
                                            <td colSpan="3">Loading tasks...</td>
                                        </tr>
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default Important;
