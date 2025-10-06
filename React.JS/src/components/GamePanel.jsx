import React from 'react';
import './Components.css';

// Minimal GamePanel component
function GamePanel({ gameMode = 'single' }) {
  if (gameMode === 'multiplayer') {
    return (
      <div className="component-container game-panel multiplayer">
        <div className="player-sections">
          <div className="player-section">
            <h3>Player 1</h3>
            <div className="input-group">
              <label htmlFor="roast-input-p1">Enter your roast:</label>
              <input
                id="roast-input-p1"
                type="text"
                placeholder="Your mama so big..."
              />
            </div>
          </div>
          
          <div className="player-section">
            <h3>Player 2</h3>
            <div className="input-group">
              <label htmlFor="roast-input-p2">Enter your roast:</label>
              <input
                id="roast-input-p2"
                type="text"
                placeholder="Your daddy so old..."
              />
            </div>
          </div>
        </div>
        <button className="btn-primary">Submit Roast</button>
      </div>
    );
  }

  return (
    <div className="component-container game-panel">
      <div className="input-group">
        <label htmlFor="roast-input">Enter your roast:</label>
        <input
          id="roast-input"
          type="text"
          placeholder="Your mama so big..."
        />
      </div>
      
      <button className="btn-primary">Submit Roast</button>
    </div>
  );
}

export default GamePanel;