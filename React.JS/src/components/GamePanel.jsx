import React, { useState } from 'react';
import './Components.css';
import { useButtonSounds } from './useButtonSounds';

const MAX_CHARACTERS = 200; // Twitter-style character limit

async function judgeRoast(roastText, username) {
  try {
    const response = await fetch('http://localhost:3001/api/judge-roast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roastText, username }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to judge roast');
    }

    const { score } = await response.json();
    return score;
    
  } catch (error) {
    console.error('Error judging roast:', error);
    throw error;
  }
}

function GamePanel() {
  const [playerName, setPlayerName] = useState('Solo Player');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('Solo Player');
  const [roastText, setRoastText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const { playReload, playGunshot } = useButtonSounds();

  const handleNameClick = () => {
    if (!isSubmitting) {
      setIsEditingName(true);
      setTempName(playerName);
    }
  };

  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
    } else {
      setTempName(playerName);
    }
  };

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const handleSubmit = async () => {
    if (!roastText.trim()) {
      setError('Please enter a roast!');
      return;
    }

    playGunshot(); // Play gunshot on submit

    setIsSubmitting(true);
    setError(null);
    setScore(null);

    try {
      const judgedScore = await judgeRoast(roastText, playerName);
      setScore(judgedScore);
      
      // Clear the input after successful submission
      setTimeout(() => {
        setRoastText('');
        setScore(null);
      }, 3000);
    } catch (err) {
      if (err.message.includes('rate limit')) {
        setError('Rate limit reached. Wait a moment and try again.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Backend server not running. Start it with: cd backend && npm start');
      } else {
        setError(`Failed to judge: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  const remainingChars = MAX_CHARACTERS - roastText.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="component-container game-panel">
      {isEditingName ? (
        <input
          type="text"
          className="player-title-edit"
          value={tempName}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          onKeyPress={handleNameKeyPress}
          maxLength={20}
          autoFocus
        />
      ) : (
        <h2 
          className="solo-player" 
          onClick={handleNameClick}
          style={{ cursor: !isSubmitting ? 'pointer' : 'default' }}
          title="Click to edit name"
        >
          {playerName}
        </h2>
      )}
      
      <div className="input-group">
        <label htmlFor="roast-input">Enter your roast:</label>
        <input
          id="roast-input"
          type="text"
          placeholder="Your mama so big..."
          value={roastText}
          onChange={(e) => setRoastText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSubmitting}
          maxLength={MAX_CHARACTERS}
        />
        <div style={{ 
          fontSize: '0.85rem', 
          textAlign: 'right', 
          marginTop: '4px',
          color: isOverLimit ? '#ff4444' : remainingChars < 20 ? '#ffaa00' : '#888'
        }}>
          {remainingChars} characters remaining
        </div>
      </div>
      
      <button 
        className="btn-primary"
        onMouseEnter={playReload}
        onClick={handleSubmit}
        disabled={isSubmitting || !roastText.trim() || isOverLimit}
      >
        {isSubmitting ? 'Judging...' : 'Submit Roast'}
      </button>

      {score !== null && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#4CAF50' }}>
            {score}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.8 }}>
            {score >= 90 ? '🔥 Legendary!' : 
             score >= 75 ? '😎 Solid roast!' :
             score >= 50 ? '👍 Not bad!' :
             score >= 25 ? '😬 Keep practicing...' :
             '💀 Oof...'}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: 'rgba(255, 68, 68, 0.2)',
          border: '1px solid rgba(255, 68, 68, 0.5)',
          borderRadius: '6px',
          color: '#ff4444',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default GamePanel;