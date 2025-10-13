import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Components.css';

const API_BASE = 'http://localhost:3001/api';

const getScoreGradient = (score) => {
  if (score >= 80) {
    return 'linear-gradient(135deg, #22ff88 0%, #00aa44 100%)';
  } else if (score >= 60) {
    return 'linear-gradient(135deg, #ffff00 0%, #88dd00 100%)';
  } else if (score >= 40) {
    return 'linear-gradient(135deg, #ffdd00 0%,rgb(255, 168, 28) 100%)';
  } else if (score >= 20) {
    return 'linear-gradient(135deg,rgb(255, 149, 0) 0%,rgb(221, 55, 0) 100%)';
  } else {
    return 'linear-gradient(135deg,rgb(255, 37, 37) 0%,rgb(177, 1, 1) 100%)';
  }
};

function Leaderboard() {
  const [activeTab, setActiveTab] = useState('all-time');
  const [roasts, setRoasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeaderboard = useCallback(async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
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
  }, []);

  const searchDatabase = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/leaderboard/search?q=${encodeURIComponent(query)}&limit=100`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed: ${response.status}`);
      }
      const data = await response.json();
      setRoasts(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setRoasts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchDatabase(searchQuery);
    } else {
      fetchLeaderboard(activeTab);
    }
  }, [searchQuery, activeTab, fetchLeaderboard, searchDatabase]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      const interval = setInterval(() => {
        fetchLeaderboard(activeTab);
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [activeTab, searchQuery, fetchLeaderboard]);

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

      <div className="leaderboard-search">
        <input
          type="text"
          placeholder="Search players or roasts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="leaderboard-search-input" 
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="search-clear-btn"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className={`leaderboard-entries ${activeTab === 'recent' ? 'recent-tab' : ''}`}>
        {loading ? (
          <div className="leaderboard-message">Loading...</div>
        ) : error ? (
          <div className="leaderboard-message">Error: {error}</div>
        ) : roasts.length === 0 ? (
          <div className="leaderboard-message">
            {searchQuery ? `No results found for "${searchQuery}"` : 'No roasts yet. Be the first to submit!'}
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
