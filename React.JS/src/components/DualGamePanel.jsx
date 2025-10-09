import React, { useState } from 'react';
import './Components.css';
import Leaderboard from './Leaderboard';
import { useButtonSounds } from './useButtonSounds';

const MAX_CHARACTERS = 200;

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

function PlayerPanel({ 
  playerName, 
  playerNumber, 
  roastText,
  onRoastChange,
  onNameChange,
  isReady,
  onReadyToggle,
  score,
  isJudging,
  error,
  playReload,
  playGunshot
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const remainingChars = MAX_CHARACTERS - roastText.length;
  const isOverLimit = remainingChars < 0;

  const handleNameClick = () => {
    if (!isJudging && !isReady) {
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
      onNameChange(tempName.trim());
    } else {
      setTempName(playerName);
    }
  };

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const handleReadyClick = () => {
    onReadyToggle();
  };

  return (
    <div className="component-container dual-player-panel">
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
          className="player-title" 
          onClick={handleNameClick}
          style={{ cursor: (!isJudging && !isReady) ? 'pointer' : 'default' }}
          title="Click to edit name"
        >
          {playerName}
        </h2>
      )}
      
      <div className="input-group">
        <label htmlFor={`roast-input-${playerNumber}`}>Enter your roast:</label>
        <input
          id={`roast-input-${playerNumber}`}
          type="text"
          placeholder="Your mama so big..."
          value={roastText}
          onChange={(e) => onRoastChange(e.target.value)}
          disabled={isJudging || isReady}
          maxLength={MAX_CHARACTERS}
        />
        <div className="char-counter" style={{ 
          color: isOverLimit ? '#ff4444' : remainingChars < 20 ? '#ffaa00' : '#888'
        }}>
          {remainingChars} characters remaining
        </div>
      </div>
      
      <button 
        className="dual-submit-btn"
        onMouseEnter={playReload}
        onClick={handleReadyClick}
        disabled={isJudging || (!roastText.trim() && !isReady) || isOverLimit}
      >
        {isJudging ? 'Judging...' : isReady ? '✓ Ready!' : 'Ready to Battle'}
      </button>

      {score !== null && (
        <div className="score-display">
          <div className="score-number" style={{ color: '#4CAF50' }}>
            {score}
          </div>
          <div className="score-emoji">
            {score >= 90 ? '🔥 Legendary!' : 
             score >= 75 ? '😎 Solid roast!' :
             score >= 50 ? '👍 Not bad!' :
             score >= 25 ? '😬 Keep practicing...' :
             '💀 Oof...'}
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}

function DualGamePanel() {
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [player1Roast, setPlayer1Roast] = useState('');
  const [player2Roast, setPlayer2Roast] = useState('');
  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [player1Score, setPlayer1Score] = useState(null);
  const [player2Score, setPlayer2Score] = useState(null);
  const [isJudging, setIsJudging] = useState(false);
  const [player1Error, setPlayer1Error] = useState(null);
  const [player2Error, setPlayer2Error] = useState(null);
  const { playReload, playGunshot } = useButtonSounds();

  const handlePlayer1ReadyToggle = () => {
    if (player1Ready) {
      setPlayer1Ready(false);
    } else {
      setPlayer1Ready(true);
      checkAndJudge(true, player2Ready);
    }
  };

  const handlePlayer2ReadyToggle = () => {
    if (player2Ready) {
      setPlayer2Ready(false);
    } else {
      setPlayer2Ready(true);
      checkAndJudge(player1Ready, true);
    }
  };

  const checkAndJudge = async (p1Ready, p2Ready) => {
    if (p1Ready && p2Ready && !isJudging) {
      setIsJudging(true);
      setPlayer1Error(null);
      setPlayer2Error(null);
      setPlayer1Score(null);
      setPlayer2Score(null);

      try {
        // Judge both roasts simultaneously
        const [score1, score2] = await Promise.all([
          judgeRoast(player1Roast, player1Name),
          judgeRoast(player2Roast, player2Name)
        ]);

        setPlayer1Score(score1);
        setPlayer2Score(score2);

        // Play gunshot sound when scores are revealed
        playGunshot();

        // Reset after 3 seconds
        setTimeout(() => {
          setPlayer1Roast('');
          setPlayer2Roast('');
          setPlayer1Ready(false);
          setPlayer2Ready(false);
          setPlayer1Score(null);
          setPlayer2Score(null);
        }, 3000);

      } catch (err) {
        const errorMessage = err.message.includes('rate limit') 
          ? 'Rate limit reached. Wait a moment and try again.'
          : err.message.includes('Failed to fetch')
          ? 'Backend server not running. Start it with: cd backend && npm start'
          : `Failed to judge: ${err.message}`;
        
        setPlayer1Error(errorMessage);
        setPlayer2Error(errorMessage);
        setPlayer1Ready(false);
        setPlayer2Ready(false);
      } finally {
        setIsJudging(false);
      }
    }
  };

  return (
    <div className="dual-game-layout">
      <div className="dual-game-container">
        <PlayerPanel 
          playerName={player1Name}
          playerNumber={1}
          roastText={player1Roast}
          onRoastChange={setPlayer1Roast}
          onNameChange={setPlayer1Name}
          isReady={player1Ready}
          onReadyToggle={handlePlayer1ReadyToggle}
          score={player1Score}
          isJudging={isJudging}
          error={player1Error}
          playReload={playReload}
          playGunshot={playGunshot}
        />
        <PlayerPanel 
          playerName={player2Name}
          playerNumber={2}
          roastText={player2Roast}
          onRoastChange={setPlayer2Roast}
          onNameChange={setPlayer2Name}
          isReady={player2Ready}
          onReadyToggle={handlePlayer2ReadyToggle}
          score={player2Score}
          isJudging={isJudging}
          error={player2Error}
          playReload={playReload}
          playGunshot={playGunshot}
        />
      </div>
      <Leaderboard />
    </div>
  );
}

export default DualGamePanel;

