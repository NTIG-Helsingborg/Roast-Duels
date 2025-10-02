import React from 'react';
import './Components.css';

// Minimal GamePanel component
function GamePanel() {
  return (
    <div className="component-container game-panel">
      <h2>Game Panel</h2>
      
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