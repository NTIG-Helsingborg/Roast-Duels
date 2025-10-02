import React from 'react';
import './GamePanel.css';

// Minimal GamePanel component
function GamePanel() {
  return (
    <div className="game-panel">
      <h2>Game Panel</h2>
      
      <div className="input-group">
        <label htmlFor="roast-input">Enter your roast:</label>
        <input
          id="roast-input"
          type="text"
          placeholder="Your mama so big..."
        />
      </div>
      
      <button>Submit Roast</button>
    </div>
  );
}

export default GamePanel;