import React from 'react';
import './index.css'; // Import your CSS for styling
import { Link } from 'react-router-dom';

function App() {
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("firstName");
        window.location.href = '/login';
    };

  const videos = [
    { src: 'Calendar_walkthrough_CC.mp4', label: 'Calendar Walkthrough' },
    { src: 'Datavis_walkthrough_CC.mp4', label: 'Data Visualization Walkthrough' },
    { src: 'Pomodoro_walkthrough_CC.mp4', label: 'Pomodoro Walkthrough' },
    { src: 'ToDo_walkthrough_CC.mp4', label: 'To-Do Walkthrough' },
  ];

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
    <div className="App">
      <h1>Help</h1>
      <p className='taglinee'>Click on any video below to see how the features work or clarify any queries</p>
      <div className="video-grid">
        {videos.map((video, index) => (
          <div className="video-tile" key={index}>
            <video width="400" height="200" controls>
              <source src={video.src} type="video/mp4" />
            </video>
            <div className="video-label">{video.label}</div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default App;
