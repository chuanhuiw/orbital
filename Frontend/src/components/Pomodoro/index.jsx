import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
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
    longBreak: 15,
    cyclesBeforeLongBreak: 3 //default values
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
  const [currentDate, setCurrentDate] = useState(formatCurrentDate());
  const [categories, setCategories] = useState(["Orbital"]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [newCategory, setNewCategory] = useState('');
  const[completedPomodoros, setCompletedPomodoros] = useState(0);

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
      //  const response = await axios.get(`https://focusfish-backend-orbital.onrender.com/api/getCategories/${username}`);
        setCategories(response.data);
        setSelectedCategory(response.data[0] || '');
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleModeChange = useCallback((newMode) => {
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
    setSessionStartTime(null);
  }, [newDurations]);

  useEffect(() => {
    let interval = null;
    const totalDuration = modeDurations[mode];

    const handleMessage = () => {
      setCongratsMessage(messages[mode]);
      setShowMessage(true);
      alert(messages[mode]);
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
       // axios.put('https://focusfish-backend-orbital.onrender.com/api/updatepomotime', {
          date: currentDate,
          seconds: workSeconds,
          category: selectedCategory,
          username: username
        })
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error('Error updating pomodoro time:', error);
          });

          setCompletedPomodoros((prev) => prev + 1);

          if (completedPomodoros + 1 >= newDurations.cyclesBeforeLongBreak){
            handleModeChange('longBreak');
            setCompletedPomodoros(0);
          } else {
            handleModeChange('shortBreak');
          }
        } else if (mode === 'shortBreak'){
          handleModeChange('pomodoro');
        } else if (mode === 'longBreak'){
          handleModeChange('pomodoro');
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
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, sessionStartTime, mode, modeDurations, newDurations, currentDate, messages, selectedCategory, completedPomodoros, handleModeChange]);

  const toggleStartStop = () => {
    if (isActive) {
      setIsActive(false);
    } else {
      setIsActive(true);
      setSessionStartTime(Date.now());
    }
  };

  const resetTimer = () => {
    if (isActive) {
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
    setSessionStartTime(null);
  };

  const handleChangeDurations = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleDurationChange = (e) => {
    const { name, value } = e.target;
    let newValue = Number(value);
  
    // Apply min/max constraints for specific fields
    switch (name) {
      case 'pomodoro':
      case 'shortBreak':
      case 'longBreak':
        newValue = Math.max(5, newValue);
        break;
      case 'cyclesBeforeLongBreak':
        newValue = Math.max(2, Math.min(10, newValue));
        break;
      default:
        break;
    }
  
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
        //const response = await axios.post('https://focusfish-backend-orbital.onrender.com/api/addCategory', {
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
      //await axios.delete(`https://focusfish-backend-orbital.onrender.com/api/deleteCategory/${username}/${encodeURIComponent(categoryToDelete)}`);
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
            <h3 className={styles.popupHeading}>Cycles before Long Break:</h3>
            <div>
              <input className={styles.inputs} type="number" name="cyclesBeforeLongBreak" value={newDurations.cyclesBeforeLongBreak} onChange={handleDurationChange} min={2} max = {10} />
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