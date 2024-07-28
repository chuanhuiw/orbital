import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './styles.module.css';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import axios from 'axios';
import { Helmet } from 'react-helmet';

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
  const [autostartBreaks, setAutostartBreaks] = useState(false);

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
  const [categories, setCategories] = useState(["Miscellaneous"]);
  const [selectedCategory, setSelectedCategory] = useState("Miscellaneous");
  const [newCategory, setNewCategory] = useState('');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      // Initialize coin balance
      if (!localStorage.getItem(`${username}_coins`)) {
        localStorage.setItem(`${username}_coins`, JSON.stringify(0));
      }
    }
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
       //const response = await axios.get(`http://127.0.0.1:8080/api/getCategories/${username}`);
       const response = await axios.get(`https://focusfish-backend-orbital.onrender.com/api/getCategories/${username}`);

       if (response.data.length === 0) {
        setCategories(["Miscellaneous"]);
        setSelectedCategory("Miscellaneous");
       } else {
        setCategories(response.data);
        setSelectedCategory(response.data[0] || "Miscellaneous");
       }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(["Miscellaneous"]);
        setSelectedCategory("Miscellaneous");
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
    setIsActive(autostartBreaks);
    setProgress(0);
    setSessionStartTime(null);
  }, [newDurations, autostartBreaks]);

  useEffect(() => {
    let interval = null;
    const totalDuration = modeDurations[mode];

    const handleMessage = () => {
      setCongratsMessage(messages[mode]);
      setShowMessage(true);
      alert(messages[mode]);
      setTimeout(() => {
        setShowMessage(false);
      }, 6000);
    };

    const handleTimerEnd = () => {
      if (mode === 'pomodoro') {
        const workSeconds = newDurations.pomodoro * 60;
        const username = localStorage.getItem('username');
        const todayData = JSON.parse(localStorage.getItem(`${username}_studyTime`)) || {};
        todayData[currentDate] = (todayData[currentDate] || 0) + workSeconds;
        localStorage.setItem(`${username}_studyTime`, JSON.stringify(todayData));
        
        const totalMinutes = (newDurations.pomodoro * 60 - (minutes*60 + seconds)) / 60;
        const coinsEarned = Math.floor(totalMinutes);

        const currentCoins = JSON.parse(localStorage.getItem(`${username}_coins`)) || 0;
        localStorage.setItem(`${username}_coins`, JSON.stringify(currentCoins + coinsEarned));

       // axios.put('http://127.0.0.1:8080/api/updatepomotime', {
        axios.put('https://focusfish-backend-orbital.onrender.com/api/updatepomotime', {
          date: currentDate,
          seconds: workSeconds,
          category: selectedCategory,
          username: username,
          coins: coinsEarned
        })
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error('Error updating pomodoro time:', error);
          });

          setCompletedPomodoros((prev) => prev + 1);

          setTimeout(() => {
            if (completedPomodoros + 1 >= newDurations.cyclesBeforeLongBreak){
              handleModeChange('longBreak');
              setCompletedPomodoros(0);
            } else {
              handleModeChange('shortBreak');
            }
          }, 6000); // 6-second delay before starting the break
        } else if (mode === 'shortBreak'){
          setTimeout(() => {
            handleModeChange('pomodoro');
          }, 6000); // 6-second delay before starting the pomodoro
        } else if (mode === 'longBreak'){
          setTimeout(() => {
            handleModeChange('pomodoro');
          }, 6000); // 6-second delay before starting the pomodoro
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

  const handleSaveDurations = async () => {
    const username = localStorage.getItem('username');
    try {
     // await axios.post('http://127.0.0.1:8080/api/saveDurations', {
      await axios.post('https://focusfish-backend-orbital.onrender.com/api/saveDurations', {
        username: username,
        durations: newDurations
      });
      handleModeChange(mode);
      setShowPopup(false);
    } catch (error) {
      console.error('Error savinf durations:', error);
    }
  };

  useEffect(() => {
    const fetchDurations = async () => {
      const username = localStorage.getItem('username');
      if (!username){
        return;
      }
      try {
       // const response = await axios.get(`http://127.0.0.1:8080/api/getDurations/${username}`);
        const response = await axios.get(`https://focusfish-backend-orbital.onrender.com/api/getDurations/${username}`);
        if (response.data) {
          setNewDurations(response.data.durations);
          setMinutes(response.data.durations[mode]);
        }
      } catch (error) {
        console.error('Error fetching durations:', error);
      }
    };
    fetchDurations();
  }, [mode]);

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
        //const response = await axios.post('http://127.0.0.1:8080/api/addCategory', {
        const response = await axios.post('https://focusfish-backend-orbital.onrender.com/api/addCategory', {
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

  const handleDeleteCategory = async (category) => {
    if (category === "Miscellaneous") {
      alert("The 'Miscellaneous' category cannot be deleted.");
      return;
    }

    const username = localStorage.getItem('username');
    const updatedCategories = categories.filter((cat) => cat !== category);
    setCategories(updatedCategories);

    if (selectedCategory === category) {
      setSelectedCategory(updatedCategories[0] || 'Miscellaneous');
    }

    try {
      //await axios.delete(`http://127.0.0.1:8080/api/deleteCategory/${username}/${category}`);
      await axios.delete(`https://focusfish-backend-orbital.onrender.com/api/deleteCategory/${username}/${category}`);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const toggleAutostartBreaks = () => {
    setAutostartBreaks(!autostartBreaks);
  };

  return (
    <main className={styles.app}>
      <Helmet>
            <title>Pomodoro | FocusFish</title>
        </Helmet>
      <header>
                    <div className="header-container">
                        <div className="left-container">
                            <h1>FocusFish</h1>
                            <Link to="/main"><button className="back-btn">🏠 Back to Dashboard</button></Link>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>Log out</button>
                    </div>
      </header>
      
      {showMessage && (
        <div className={styles.congratsMessage}>
          {congratsMessage}
          <Confetti />
        </div>
      )}
      <center>
      <div className={styles.checkbox_container}>
          <input
            type="checkbox"
            checked={autostartBreaks}
            onChange={toggleAutostartBreaks}
            className={styles.checkbox}
          />
          <span className={styles.checkbox_label}>Autostart Breaks & Pomodoro</span>
      </div>
      </center>
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
        
      </div>
      <center>
      {showPopup && (
        <div className={styles.popupContainer}>
          <button className={styles.closeButton} onClick={handleClosePopup}>X</button>
          <div className={styles.popup}>
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
      
      <div className={styles.actionButtons}>
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

      </center>
          </main>
  );
};

export default Pomodoro;