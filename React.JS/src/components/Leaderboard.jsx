import React, { useState, useEffect } from 'react';
import './Components.css';

function Leaderboard({ roasts = [] }) {
  // Sort roasts by score (highest first) and take top 10
  const topRoasts = [...roasts]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div className="component-container leaderboard">
      <h2>Leaderboard</h2>
      
      <div className="leaderboard-entries">
        {topRoasts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            opacity: 0.6,
            fontStyle: 'italic'
          }}>
            No roasts yet. Be the first to submit!
          </div>
        ) : (
          topRoasts.map((roast, index) => (
            <div key={roast.timestamp || index} className="leaderboard-entry">
              <div className="score">{roast.score}</div>
              <div className="roast-content">
                <p className="author">
                  {index === 0 && '👑 '}
                  {roast.author}
                </p>
                <p className="text">{roast.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
