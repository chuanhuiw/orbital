import React, { Component } from 'react';
import CalendarDays from './calendar-days';
import './index.css';
import { Link } from 'react-router-dom';

export default class Calendar extends Component {
    // Handle user logout
    handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/login";
    };
    
    constructor() {
        super();
    
        this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
        this.state = {
          currentDay: new Date()
        }
    }
      
    changeCurrentDay = (day) => {
        this.setState({ currentDay: new Date(day.year, day.month, day.number) });
    }
    
    nextDay = () => {
        this.setState({ currentDay: new Date(this.state.currentDay.setDate(this.state.currentDay.getDate() + 1)) });
    }
    
    previousDay = () => {
        this.setState({ currentDay: new Date(this.state.currentDay.setDate(this.state.currentDay.getDate() - 1)) });
    }

    render() {
      return (
        <div className="calendar">
        <header>
          <h1 className="header">
            FocusFish 
            <Link to="/main">
            <button className='dashboard_btn'>🏠 Back to Dashboard</button>
            </Link>
            <button className="logout_btn" onClick={this.handleLogout}>Log out</button>
          </h1>
        </header>
        <div className="calendar-header">
          <div className="title">
            <h2>{this.months[this.state.currentDay.getMonth()]} {this.state.currentDay.getFullYear()}</h2>
          </div>
          <div className="current-date">
            <button onClick={this.previousDay}>
              <span className="material-icons">
                Yesterday
                </span>
            </button>
            <p>{this.months[this.state.currentDay.getMonth()].substring(0, 3)} {this.state.currentDay.getDate()}</p>
            <button onClick={this.nextDay}>
              <span className="material-icons">
                Tomorrow
                </span>
            </button>
          </div>
        </div>
        <div className="calendar-body">
          <div className="table-header">
            {
              this.weekdays.map((weekday) => {
                return <div className="weekday"><p>{weekday}</p></div>
              })
            }
          </div>
          <CalendarDays day={this.state.currentDay} changeCurrentDay={this.changeCurrentDay} />
         </div>
        </div>
      )
    }
}