import React from 'react';
import './Leaderboard.css';

function Leaderboard() {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      
      <div className="leaderboard-entries">
        {/* Static example entry */}
        <div className="leaderboard-entry">
          <div className="score">95</div>
          <div className="roast-content">
            <p className="author">User1</p>
            <p className="text">Example roast text</p>
          </div>
        </div>
        
        {/* Another static example entry */}
        <div className="leaderboard-entry">
          <div className="score">82</div>
          <div className="roast-content">
            <p className="author">User2</p>
            <p className="text">Another example roast</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
