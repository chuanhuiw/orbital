import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toastify
import Confetti from 'react-confetti';

const badges = [
  { id: 1, price: 10, image: 'b1.png', label: 'Level 1' },
  { id: 2, price: 10, image: 'b2.png', label: 'Level 2' },
  { id: 3, price: 60, image: 'b3.png', label: 'Level 3' },
  { id: 4, price: 120, image: 'b4.png', label: 'Level 4' },
  { id: 5, price: 200, image: 'b5.png', label: 'Level 5' },
  { id: 6, price: 250, image: 'b6.png', label: 'Level 6' },
  { id: 7, price: 350, image: 'b7.png', label: 'Level 7' },
  { id: 8, price: 500, image: 'b8.png', label: 'Level 8' },
  { id: 9, price: 600, image: 'b9.png', label: 'Level 9' },
  { id: 10, price: 750, image: 'b10.png', label: 'Level 10' },
  { id: 11, price: 800, image: 'b11.png', label: 'Level 11' },
  { id: 12, price: 850, image: 'b12.png', label: 'Level 12' },
  { id: 13, price: 900, image: 'b13.png', label: 'Level 13' },
  { id: 14, price: 1000, image: 'b14.png', label: 'Level 14' },
  { id: 15, price: 1200, image: 'b15.png', label: 'Level 15' },
  { id: 16, price: 1400, image: 'b16.png', label: 'Level 16' },
  { id: 17, price: 1600, image: 'b17.png', label: 'Level 17' },
  { id: 18, price: 2000, image: 'b18.png', label: 'Level 18' },
  { id: 19, price: 2200, image: 'b19.png', label: 'Level 19' },
  { id: 20, price: 2500, image: 'b20.png', label: 'Level 20' },
];

const Shop = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
    window.location.href = "/login";
  };

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('username');
    if (!email) {
      setError('User email not found in local storage');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8080/api/getUser/${email}`);
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleUnlock = async (badgeId, badgePrice) => {
    const email = localStorage.getItem('username');
    if (!email) {
      setError('User email not found in local storage');
      return;
    }
  
    const previousBadgeId = badgeId - 1;
    const canUnlock = previousBadgeId === 0 || user.unlockedBadges.includes(previousBadgeId);
  
    if (!canUnlock) {
      toast.error('Unlock the previous badge before unlocking this one');
      return;
    }
  
    if (user.coins >= badgePrice) {
      try {
        const response = await axios.post('http://127.0.0.1:8080/api/unlockBadge', {
          username: email,
          badgeId,
          badgePrice
        });
        setUser(response.data);
        setConfettiActive(true); // Activate confetti
        setTimeout(() => setConfettiActive(false), 6000);
      } catch (err) {
        toast.error('Failed to unlock badge');
      }
    } else {
      toast.error('Not enough coins');
    }
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
      <h1>Shop</h1>
      <div className='coin'>Coins 🪙 {user.coins}</div>
      <div className="badges">
        {badges.map((badge) => {
          const isUnlocked = user.unlockedBadges.includes(badge.id);
          const previousBadgeId = badge.id - 1;
          const canUnlock = previousBadgeId === 0 || user.unlockedBadges.includes(previousBadgeId);
          const buttonClass = !canUnlock ? 'disabled' : '';

          return (
            <div key={badge.id} className='details'>
              <div className="badge">
                <div className={`badge-image ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <img src={badge.image} alt={badge.label} />
                </div>
                <div>{badge.label}</div>
                <div>Price: {badge.price}</div>
                <button
                  className={buttonClass}
                  disabled={isUnlocked || !canUnlock}
                  onClick={() => {
                    if (!canUnlock) {
                      toast.error('Unlock the previous badge before unlocking this one');
                    } else if (user.coins < badge.price) {
                      toast.error('Not enough coins');
                    } else {
                      handleUnlock(badge.id, badge.price);
                    }
                  }}
                >
                  {isUnlocked ? 'Unlocked' : 'Unlock'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {confettiActive && <Confetti />}
      <ToastContainer />
    </div>
  );
};

export default Shop;
