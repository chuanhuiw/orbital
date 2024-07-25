import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './index.css';

// CalendarDays Component
function CalendarDays({ day, tasks, openPopup }) {
    let firstDayOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
    let weekdayOfFirstDay = firstDayOfMonth.getDay();
    let currentDays = [];

    for (let dayOffset = 0; dayOffset < 42; dayOffset++) {
        if (dayOffset === 0 && weekdayOfFirstDay === 0) {
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
        } else if (dayOffset === 0) {
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() + (dayOffset - weekdayOfFirstDay));
        } else {
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
        }

        let calendarDay = {
            currentMonth: (firstDayOfMonth.getMonth() === day.getMonth()),
            date: (new Date(firstDayOfMonth)),
            month: firstDayOfMonth.getMonth(),
            number: firstDayOfMonth.getDate(),
            selected: (firstDayOfMonth.toDateString() === day.toDateString()),
            year: firstDayOfMonth.getFullYear(),
            tasksForDay: tasks.filter(task => new Date(task.deadline).toDateString() === firstDayOfMonth.toDateString())
        }

        currentDays.push(calendarDay);
    }

    const handleDayClick = (day) => {
        openPopup(day.tasksForDay);
    };

    return (
        <div className="table-content">
            {currentDays.map((day) => (
                <div
                    key={day.date}
                    className={"calendar-day" + (day.currentMonth ? " current" : "") + (day.selected ? " selected" : "")}
                    onClick={() => handleDayClick(day)}>
                    <p>{day.number}</p>
                    <div className="tasks">
                        {day.tasksForDay.map(task => (
                            <div key={task._id} className="task-item">
                                {task.task}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// TaskPopup Component
function TaskPopup({ tasks, onClose }) {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="popup-close" onClick={onClose}>×</button>
                {tasks.length > 0 ? (
                    <div>
                        {tasks.map(task => (
                            <div key={task._id} className="popup-task">
                                <h3>{task.task}</h3>
                                <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
                                <p>Status: {task.status}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No tasks scheduled</p>
                )}
            </div>
        </div>
    );
}

// Calendar Component
export default class Calendar extends Component {
    constructor() {
        super();
        this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
        this.state = {
            currentDay: new Date(),
            tasks: [],
            popupTasks: [],
            popupVisible: false
        };
    }

    componentDidMount() {
        const userEmail = localStorage.getItem('username');
        axios.get('http://127.0.0.1:8080/api/getTodoList', { params: { userEmail } })
        //     axios.get('https://focusfish-backend-orbital.onrender.com/api/getTodoList', {params: { userEmail } })
            .then(result => {
                this.setState({ tasks: result.data });
            })
            .catch(err => console.log(err));
    }

    handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/login";
    };

    changeCurrentDay = (day) => {
        this.setState({ currentDay: new Date(day.year, day.month, day.number) });
    };

    nextDay = () => {
        this.setState({ currentDay: new Date(this.state.currentDay.setDate(this.state.currentDay.getDate() + 1)) });
    };

    previousDay = () => {
        this.setState({ currentDay: new Date(this.state.currentDay.setDate(this.state.currentDay.getDate() - 1)) });
    };

    nextMonth = () => {
        const { currentDay } = this.state;
        const nextMonth = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1, 1);
        this.setState({ currentDay: nextMonth });
    };

    previousMonth = () => {
        const { currentDay } = this.state;
        const prevMonth = new Date(currentDay.getFullYear(), currentDay.getMonth() - 1, 1);
        this.setState({ currentDay: prevMonth });
    };

    goToToday = () => {
        this.setState({ currentDay: new Date() });
    };

    openPopup = (tasks) => {
        this.setState({ popupTasks: tasks, popupVisible: true });
    };

    closePopup = () => {
        this.setState({ popupVisible: false });
    };

    render() {
        const { currentDay, tasks, popupVisible, popupTasks } = this.state;

        return (
          <div>
          <header>
          <div class="header-container">
            <div class="left-container">
              <h1>FocusFish</h1>
                <Link to="/main"><button class="back-btn">🏠 Back to Dashboard</button></Link>
            </div>
            <button class="logout-btn">Log out</button>
          </div>
          </header>
            <div className="calendar">
            <div className="calendar-header">
  <button className="month-nav prev" onClick={this.previousMonth}>
    <span className="material-icons">prev</span>
  </button>
  <div className="title">
    <h2>{this.months[currentDay.getMonth()]} {currentDay.getFullYear()}</h2>
  </div>
  <button className="month-nav next" onClick={this.nextMonth}>
    <span className="material-icons">next</span>
  </button>
  <div className="current-date">
    <button className="day-nav-prev" onClick={this.previousDay}>
      <span className="material-icons">prev</span>
    </button>
    <p>{this.months[currentDay.getMonth()].substring(0, 3)} {currentDay.getDate()}</p>
    <button className="day-nav-next" onClick={this.nextDay}>
      <span className="material-icons">next</span>
    </button>
  </div>
  <button className="today-btn" onClick={this.goToToday}>
    Today
  </button>
</div>

                <div className="calendar-body">
                    <div className="table-header">
                        {this.weekdays.map((weekday) => (
                            <div className="weekday" key={weekday}><p>{weekday}</p></div>
                        ))}
                    </div>
                    <CalendarDays 
                        day={currentDay} 
                        tasks={tasks} 
                        openPopup={this.openPopup} 
                    />
                </div>
                {popupVisible && (
                    <TaskPopup
                        tasks={popupTasks}
                        onClose={this.closePopup}
                    />
                )}
            </div>
            </div>
        );
    }
}

