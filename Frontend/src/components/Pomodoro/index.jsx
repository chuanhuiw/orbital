import React, { useState, useEffect, useMemo } from 'react';
import styles from './styles.module.css';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import axios from 'axios';

const Pomodoro = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
    window.location.href = "/login";
  };

  function formatCurrentDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);

    return `${dd}/${mm}/${yy}`;
  };

  const [mode, setMode] = useState('pomodoro');
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [newDurations, setNewDurations] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  });
  const [showMessage, setShowMessage] = useState(false);
  const [congratsMessage, setCongratsMessage] = useState('');

  const messages = useMemo(() => ({
    pomodoro: "Well Done! You have completed the Pomodoro session!",
    shortBreak: "You have completed your short break!",
    longBreak: "Long break has ended!"
  }), []);

  const modeDurations = useMemo(() => ({
    pomodoro: newDurations.pomodoro * 60,
    shortBreak: newDurations.shortBreak * 60,
    longBreak: newDurations.longBreak * 60
  }), [newDurations]);

  const [totalWorkSeconds, setTotalWorkSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSessionSeconds, setElapsedSessionSeconds] = useState(0);
  const [currentDate, setCurrentDate] = useState(formatCurrentDate());
  const [categories, setCategories] = useState(["Orbital"]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const username = localStorage.getItem('username');
    const todayData = JSON.parse(localStorage.getItem(`${username}_studyTime`)) || {};
    const savedSeconds = todayData[currentDate] || 0;

    setTotalWorkSeconds(savedSeconds);

    const dateInterval = setInterval(() => {
      const newDate = formatCurrentDate();
      if (newDate !== currentDate) {
        setCurrentDate(newDate);
        setTotalWorkSeconds(0);
        localStorage.setItem(`${username}_studyTime`, JSON.stringify({ [newDate]: 0 }));
      }
    }, 60000);

    return () => clearInterval(dateInterval);
  }, [currentDate]);

  useEffect(() => {
    const fetchCategories = async () => {
      const username = localStorage.getItem('username');
      try {
        const response = await axios.get(`http://127.0.0.1:8080/api/getCategories/${username}`);
        setCategories(response.data);
        setSelectedCategory(response.data[0] || '');
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    let interval = null;
    const totalDuration = modeDurations[mode];

    const handleMessage = () => {
      setCongratsMessage(messages[mode]);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        window.location.reload();
      }, 10000);
    };

    const handleTimerEnd = () => {
      if (mode === 'pomodoro') {
        const workSeconds = newDurations.pomodoro * 60;
        const username = localStorage.getItem('username');
        const todayData = JSON.parse(localStorage.getItem(`${username}_studyTime`)) || {};
        todayData[currentDate] = (todayData[currentDate] || 0) + workSeconds;
        localStorage.setItem(`${username}_studyTime`, JSON.stringify(todayData));

        axios.put('http://127.0.0.1:8080/api/updatepomotime', {
          date: currentDate,
          seconds: todayData[currentDate],
          category: selectedCategory,
          username: username
        })
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error('Error updating pomodoro time:', error);
          });
      }
    };

    if (isActive) {
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            handleMessage();
            handleTimerEnd();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
        const elapsedTime = totalDuration - (minutes * 60 + seconds);
        setProgress((elapsedTime / totalDuration) * 100);
        setElapsedSessionSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, sessionStartTime, mode, modeDurations, newDurations, currentDate, messages, selectedCategory]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    switch (newMode) {
      case 'pomodoro':
        setMinutes(newDurations.pomodoro);
        break;
      case 'shortBreak':
        setMinutes(newDurations.shortBreak);
        break;
      case 'longBreak':
        setMinutes(newDurations.longBreak);
        break;
      default:
        break;
    }
    setSeconds(0);
    setIsActive(false);
    setProgress(0);
    setElapsedSessionSeconds(0);
    setSessionStartTime(null);
  };

  const toggleStartStop = () => {
    if (isActive) {
      updateTotalWorkSeconds();
      setIsActive(false);
    } else {
      setIsActive(true);
      setSessionStartTime(Date.now());
    }
  };

  const resetTimer = () => {
    if (isActive) {
      updateTotalWorkSeconds();
    }
    setIsActive(false);
    switch (mode) {
      case 'pomodoro':
        setMinutes(newDurations.pomodoro);
        break;
      case 'shortBreak':
        setMinutes(newDurations.shortBreak);
        break;
      case 'longBreak':
        setMinutes(newDurations.longBreak);
        break;
      default:
        break;
    }
    setSeconds(0);
    setProgress(0);
    setElapsedSessionSeconds(0);
    setSessionStartTime(null);
  };

  const updateTotalWorkSeconds = () => {
    if (mode === 'pomodoro') {
      setTotalWorkSeconds(prevTotal => prevTotal + elapsedSessionSeconds);
      const username = localStorage.getItem('username');
      const todayData = JSON.parse(localStorage.getItem(`${username}_studyTime`)) || {};
      todayData[currentDate] = (todayData[currentDate] || 0) + elapsedSessionSeconds;
      localStorage.setItem(`${username}_studyTime`, JSON.stringify(todayData));

      axios.put('http://127.0.0.1:8080/api/updatepomotime', {
        date: currentDate,
        seconds: todayData[currentDate],
        category: selectedCategory,
        username: username
      })
        .then(response => {
          console.log(response.data);
        })
        .catch(error => {
          console.error('Error updating pomodoro time:', error);
        });
      setElapsedSessionSeconds(0);
    }
  };

  const handleChangeDurations = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleDurationChange = (e) => {
    const { name, value } = e.target;
    const newValue = Math.max(5, Number(value));
    setNewDurations({
      ...newDurations,
      [name]: newValue
    });
  };

  const handleSaveDurations = () => {
    handleModeChange(mode);
    setShowPopup(false);
  };

  const displayStudyTime = () => {
    const hours = Math.floor(totalWorkSeconds / 3600);
    const minutes = Math.floor((totalWorkSeconds % 3600) / 60);
    const seconds = totalWorkSeconds % 60;
    return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleNewCategoryChange = (e) => {
    setNewCategory(e.target.value);
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() !== '') {
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      setSelectedCategory(newCategory);
  
      const username = localStorage.getItem('username');
      try {
        const response = await axios.post('http://127.0.0.1:8080/api/addCategory', {
          username: username,
          category: newCategory
        });
        console.log('New category added successfully', response.data);
      } catch (error) {
        console.error('Error adding new category:', error);
      }
  
      setNewCategory('');
    }
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    const username = localStorage.getItem('username');
    try {
      await axios.delete(`http://127.0.0.1:8080/api/deleteCategory/${username}/${encodeURIComponent(categoryToDelete)}`);
      const updatedCategories = categories.filter(category => category !== categoryToDelete);
      setCategories(updatedCategories);
      if (updatedCategories.length > 0) {
        setSelectedCategory(updatedCategories[0]);
      } else {
        setSelectedCategory('');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };


  return (
    <main className={styles.app}>
      <header>
        <h1 className={styles.logo}>
          FocusFish <Link to="/main"><button className={styles.backButton}>🏠 Back to Dashboard</button></Link> <button className={styles.logout_btn} onClick={handleLogout}>Log out</button>
        </h1>
      </header>
      {showMessage && (
        <div className={styles.congratsMessage}>
          {congratsMessage}
          <Confetti />
        </div>
      )}

      <progress id="js-progress" value={progress} max="100"></progress>
      <div className={styles.progressBar}></div>
      <div className={styles.timer}>
        <div className={styles.buttonGroup} id="js-mode-buttons">
          <button
            data-mode="pomodoro"
            className={`${styles.button} ${styles.modeButton} ${mode === 'pomodoro' ? styles.active : ''}`}
            onClick={() => handleModeChange('pomodoro')}
            id="js-pomodoro"
          >
            Pomodoro
          </button>
          <button
            data-mode="shortBreak"
            className={`${styles.button} ${styles.modeButton} ${mode === 'shortBreak' ? styles.active : ''}`}
            onClick={() => handleModeChange('shortBreak')}
            id="js-short-break"
          >
            Short break
          </button>
          <button
            data-mode="longBreak"
            className={`${styles.button} ${styles.modeButton} ${mode === 'longBreak' ? styles.active : ''}`}
            onClick={() => handleModeChange('longBreak')}
            id="js-long-break"
          >
            Long break
          </button>
        </div>
        <div className={styles.clock} id="js-clock">
          <span id="js-minutes">{String(minutes).padStart(2, '0')}</span>
          <span className={styles.separator}>:</span>
          <span id="js-seconds">{String(seconds).padStart(2, '0')}</span>
        </div>
        <div className={styles.buttonGroup}>
          <div>
            <button className={styles.editButton} data-action="edit" onClick={handleChangeDurations}>
              Edit
            </button>
          </div>
          <button className={styles.mainButton} data-action="start" id="js-btn" onClick={toggleStartStop}>
            {isActive ? 'Stop' : 'Start'}
          </button>
          <button className={styles.resetButton} data-action="reset" onClick={resetTimer}>
            Reset
          </button>
        </div>
      </div>
      {showPopup && (
        <div className={styles.popupContainer}>
          <div className={styles.popup}>
            <button className={styles.closeButton} onClick={handleClosePopup}>X</button>
            <h1 className={styles.popupHeading}>Edit Durations</h1>

            <h3 className={styles.popupHeading}>Pomodoro Duration (minutes):</h3>
            <div>
              <input className={styles.inputs} type="number" name="pomodoro" value={newDurations.pomodoro} onChange={handleDurationChange} min="5" />
            </div>
            <h3 className={styles.popupHeading}>Short Break Duration (minutes):</h3>
            <div>
              <input className={styles.inputs} type="number" name="shortBreak" value={newDurations.shortBreak} onChange={handleDurationChange} min="5" />
            </div>
            <h3 className={styles.popupHeading}>Long Break Duration (minutes):</h3>
            <div>
              <input className={styles.inputs} type="number" name="longBreak" value={newDurations.longBreak} onChange={handleDurationChange} min="5" />
            </div>
            <button className={styles.saveButton} onClick={handleSaveDurations}>Save</button>
          </div>
        </div>
      )}
      <div className={styles.categoryDropdown} placeholder="No category selected">
        <select className={styles.categorySelect} value={selectedCategory} onChange={handleCategoryChange}>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="text"
          className={styles.newCategoryInput}
          value={newCategory}
          onChange={handleNewCategoryChange}
          placeholder="Create New Category"
        />
        <button className={styles.addButton} onClick={handleAddCategory}>Add</button>
        <button className={styles.deleteButton} onClick={() => handleDeleteCategory(selectedCategory)}>Delete</button>
      </div>
      <div className={styles.dailySummary}>
        <p>{currentDate}</p>
        <p>Today's total Pomodoro time: {displayStudyTime()}</p>
      </div>
    </main>
  );
};

export default Pomodoro;