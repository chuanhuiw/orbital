import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { Link } from 'react-router-dom';

// need to make a collapsible sidebar for this page (and all other nested pages)

const Main = () => {
    const [firstName, setFirstName] = useState('');
    useEffect(() => {
        const storedFirstName = localStorage.getItem('firstName');
        if(storedFirstName){
            setFirstName(storedFirstName);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("firstName");
        window.location.href = '/login';
    };

    return (
        <div>
         <header>
            <h1 className={styles.logo}>FocusFish <button className={styles.white_btn} onClick={handleLogout}>Log out</button></h1> 
        </header>   
        <h2 className={styles.welcome_msg}>Welcome {firstName}!</h2>
        <p className={styles.tagline}>Keep your Focus, Fish for Success</p>
        <div className={styles.main_container}>
        <Link to="/Todo"><button className={styles.button1}>ToDo</button></Link> 
        <Link to="/Pomodoro"><button className={styles.button2}>Pomodoro</button></Link> 
        <Link to="/Calendar"><button className={styles.button3}>Calendar</button></Link> 
        <Link to="/DataVis"><button className={styles.button4}>My Stats</button></Link>
        <button className={styles.button5}>Aquarium</button> 
        <button className={styles.button6}>Help</button>
        </div>
        </div>
    )
}

export default Main;