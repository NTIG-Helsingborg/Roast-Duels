import React, { useState, useEffect } from 'react';
import './Components.css';

const API_BASE = 'http://localhost:3001/api';

function Leaderboard() {
  const [activeTab, setActiveTab] = useState('all-time');
  const [roasts, setRoasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      // Use limit of 6 for recent tab, 10 for others
      const limit = endpoint === 'recent' ? 6 : 10;
      const response = await fetch(`${API_BASE}/leaderboard/${endpoint}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      setRoasts(data);
    } catch (err) {
      setError(err.message);
      setRoasts([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to get gradient colors based on score
  const getScoreGradient = (score) => {
    if (score >= 80) {
      // Green for high scores (80-100)
      return 'linear-gradient(135deg, #22ff88 0%, #00aa44 100%)';
    } else if (score >= 60) {
      // Yellow-green for good scores (60-79)
      return 'linear-gradient(135deg, #ffff00 0%, #88dd00 100%)';
    } else if (score >= 40) {
      // Yellow-orange for decent scores (40-59)
      return 'linear-gradient(135deg, #ffdd00 0%,rgb(255, 168, 28) 100%)';
    } else if (score >= 20) {
      // Orange-red for low scores (20-39)
      return 'linear-gradient(135deg,rgb(255, 149, 0) 0%,rgb(221, 55, 0) 100%)';
    } else {
      // Deep red for very low scores (0-19)
      return 'linear-gradient(135deg,rgb(255, 37, 37) 0%,rgb(177, 1, 1) 100%)';
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
    
    //Auto-refresh 
    const interval = setInterval(() => {
      fetchLeaderboard(activeTab);
    }, 20000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="component-container leaderboard">
      <h2>Leaderboard</h2>
      
      <div className="leaderboard-tabs">
        <button
          className={`leaderboard-tab ${activeTab === 'all-time' ? 'active' : ''}`}
          onClick={() => handleTabChange('all-time')}
        >
          All-time
        </button>
        <button
          className={`leaderboard-tab ${activeTab === 'past-7-days' ? 'active' : ''}`}
          onClick={() => handleTabChange('past-7-days')}
        >
          Past 7 days
        </button>
        <button
          className={`leaderboard-tab ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => handleTabChange('recent')}
        >
          Recent
        </button>
      </div>

      <div className={`leaderboard-entries ${activeTab === 'recent' ? 'recent-tab' : ''}`}>
        {loading ? (
          <div className="leaderboard-message">Loading...</div>
        ) : error ? (
          <div className="leaderboard-message">Error: {error}</div>
        ) : roasts.length === 0 ? (
          <div className="leaderboard-message">
            No roasts yet. Be the first to submit!
          </div>
        ) : (
          roasts.map((roast, index) => (
            <div key={roast.id} className="leaderboard-entry">
              <div 
                className="score" 
                style={{ 
                  background: getScoreGradient(roast.score),
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
                {roast.score}
              </div>
              <div className="roast-content">
                <p className="author">
                  {activeTab !== 'recent' && index === 0 && '👑 '}
                  {roast.username}
                </p>
                <p className="text">{roast.roast}</p>
                <p className="time-stamp">{formatDateTime(roast.date)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
