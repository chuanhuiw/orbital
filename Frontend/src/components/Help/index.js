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
    { src: 'Pomodoro_walkthroug_CC.mp4', label: 'Pomodoro Walkthrough' },
    { src: 'ToDo_walkthrough_CC.mp4', label: 'To-Do Walkthrough' },
  ];

  return (
    <div>
    <header>
        <h1 className="logo">FocusFish  <button className="logout_btn" onClick={handleLogout}>Log out</button> </h1>
        <Link to="/main"><button className='backButton'>🏠 Back to Dashboard</button></Link>
    </header>
    <div className="App">
      <h1 className='title'>Help</h1>
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
