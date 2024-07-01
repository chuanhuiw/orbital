import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import './index.css';

function Important() {
    const [importantList, setImportantList] = useState([]);
    const [collapsed, setCollapsed] = useState(true); // State for sidebar collapse

    // Fetch flagged tasks from database
    useEffect(() => {
        const userEmail = localStorage.getItem('username');
        axios.get('https://focusfish-backend-orbital.onrender.com/api/getImportantList', { params: { userEmail} })
            .then(result => {
                setImportantList(result.data);
            })
            .catch(err => console.log(err));
    }, []);

    // Function to toggle the sidebar's collapsed state
    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
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

                        <button className="sidebar_button3">✅ Completed</button>
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
                        
                        <button className="smallsidebar_button3">✅</button>
                    </div>
                )}
            </div>
            <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
                <h1 className="heading">Important Tasks</h1>
                <h3 className="tagline"> Find all your Flagged Tasks here! </h3>
                <div className="row">
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
                                {Array.isArray(importantList) ? (
                                    <tbody>
                                        {importantList.map((data) => (
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
    );
}

export default Important;
