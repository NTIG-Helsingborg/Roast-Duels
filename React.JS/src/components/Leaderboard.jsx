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
              <div className="score">{roast.score}</div>
              <div className="roast-content">
                <p className="author">
                  {activeTab !== 'recent' && index === 0 && '👑 '}
                  {roast.username}
                </p>
                <p className="text">{roast.roast}</p>
                <p className="time-stamp">{formatDateTime(roast.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
