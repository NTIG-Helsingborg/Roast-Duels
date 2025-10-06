import React, { useState, useEffect } from 'react';
import './Components.css';

function Leaderboard() {
  const [roasts, setRoasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoasts();
  }, []);

  const fetchRoasts = async () => {
    try {
      const response = await fetch('/api/roasts');
      if (response.ok) {
        const data = await response.json();
        setRoasts(data);
      } else {
        console.error('Failed to fetch roasts');
      }
    } catch (error) {
      console.error('Error fetching roasts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="component-container leaderboard">
        <h2>Leaderboard</h2>
        <div className="leaderboard-entries">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="component-container leaderboard">
      <h2>Leaderboard</h2>
      
      <div className="leaderboard-entries">
        {roasts.length === 0 ? (
          <p>No roasts yet. Be the first to submit one!</p>
        ) : (
          roasts.map((roast) => (
            <div key={roast.id} className="leaderboard-entry">
              <div className="score">{roast.points}</div>
              <div className="roast-content">
                <p className="author">{roast.username}</p>
                <p className="text">{roast.roast}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
