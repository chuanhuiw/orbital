import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label
} from 'recharts';
import styles from './styles.module.css';
import { Link } from 'react-router-dom';

const DataVis = () => {
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.reload();
        window.location.href = "/login";
      };

    const [studyData, setStudyData] = useState([]);
    const [selectedView, setSelectedView] = useState('daily');

    useEffect(() => {
        const fetchStudyData = async () => {
            const username = localStorage.getItem('username');
            try {
                const response = await axios.get(`http://127.0.0.1:8080/api/getStudyTimes/${username}`);
                const studyTimes = response.data;

                const formattedData = studyTimes.map(entry => ({
                    date: new Date(entry.date),
                    studyTime: entry.seconds / 60, // Convert seconds to minutes
                }));

                setStudyData(formattedData);
            } catch (error) {
                console.error('Error fetching study data:', error);
            }
        };

        fetchStudyData();
    }, []);

    const aggregateData = (data, period) => {
        const aggregated = {};

        data.forEach(({ date, studyTime }) => {
            let key;
            if (period === 'weekly') {
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                key = `${startOfWeek.getDate().toString().padStart(2, '0')}-${(startOfWeek.getMonth() + 1).toString().padStart(2, '0')} to ${endOfWeek.getDate().toString().padStart(2, '0')}-${(endOfWeek.getMonth() + 1).toString().padStart(2, '0')}`;
            } else if (period === 'monthly') {
                key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            } else {
                key = date.toLocaleDateString('en-GB');
            }

            if (!aggregated[key]) {
                aggregated[key] = 0;
            }
            aggregated[key] += studyTime;
        });

        return Object.keys(aggregated).map(key => ({
            date: key,
            studyTime: aggregated[key],
        }));
    };

    const getChartData = () => {
        if (selectedView === 'weekly') {
            return aggregateData(studyData, 'weekly');
        } else if (selectedView === 'monthly') {
            return aggregateData(studyData, 'monthly');
        }
        return aggregateData(studyData, 'daily');
    };

    return (    
        <div>
        <div>
        <h1 className={styles.logo}>
          FocusFish <Link to="/main"><button className={styles.backButton}>🏠 Back to Dashboard</button></Link> <button className={styles.logout_btn} onClick={handleLogout}>Log out</button>
        </h1>
        </div>
            <h2 className={styles.heading}>Study Visualization</h2>
            <p className={styles.tagline}> Vizualize and Analyze your Pomodoro sessions </p>
            <div className={styles.selectView}>
                <label htmlFor="viewSelect">Selected View: </label>
                <select
                    className={styles.viewSelect}
                    id = "viewSelect"
                    value={selectedView}
                    onChange={(e) => setSelectedView(e.target.value)}
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" height={50}>
                            <Label value="Date" position="insideBottom" dx={-25} style={{ fontWeight: 'bold' }} />
                        </XAxis>
                        <YAxis>
                            <Label value="Study Time (minutes)" angle={-90} position="insideLeft" style={{ fontWeight: 'bold' }} />
                        </YAxis>
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="studyTime" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DataVis;
