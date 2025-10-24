import React, { useState, useEffect } from 'react';
import './Components.css';
import { useButtonSounds } from './useButtonSounds';
import LoginModal from './LoginModal';
import ConfirmUsernameModal from './ConfirmUsernameModal';
import TutorialModal from './TutorialModal';
import { auth } from '../utils/auth';
import { tutorialUtils } from '../utils/tutorial';

const MAX_CHARACTERS = 200;

async function judgeRoast(roastText, userId) {
  try {
    const response = await fetch('https://roastbattles-backend.azurewebsites.net/api/judge-roast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roastText, userId }),
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
  const [playerName, setPlayerName] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [pendingUsername, setPendingUsername] = useState('');
  const [roastText, setRoastText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const { playReload, playGunshot } = useButtonSounds();

  useEffect(() => {
    const checkAuth = async () => {
      const data = await auth.verify();
      if (data) {
        setPlayerName(data.username);
        setTempName(data.username);
        setShowLoginModal(false);
        
        console.log('Checking tutorial for user:', data.username);
        if (tutorialUtils.isFirstTimeUser()) {
          console.log('Showing tutorial for first-time user');
          setShowTutorial(true);
          tutorialUtils.markVisited();
        } else {
          console.log('User has already seen tutorial, skipping');
        }
      }
    };
    checkAuth();

    const handleReplayTutorial = () => {
      console.log('Replaying tutorial');
      setShowTutorial(true);
    };

    window.addEventListener('replayTutorial', handleReplayTutorial);
    
    return () => {
      window.removeEventListener('replayTutorial', handleReplayTutorial);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownRemaining]);

  const handleLogin = (username) => {
    setPlayerName(username);
    setTempName(username);
    setShowLoginModal(false);
    
    if (tutorialUtils.isFirstTimeUser()) {
      setShowTutorial(true);
      tutorialUtils.markVisited();
    }
  };

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
    const newName = tempName.trim();
    
    if (!newName || newName === playerName) {
      setTempName(playerName);
      return;
    }

    setPendingUsername(newName);
    setShowConfirmModal(true);
  };

  const handleConfirmUsernameChange = async () => {
    setShowConfirmModal(false);
    
    try {
      const data = await auth.updateUsername(pendingUsername);
      setPlayerName(data.username);
      setTempName(data.username);
    } catch (err) {
      setError(err.message);
      setTempName(playerName);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCancelUsernameChange = () => {
    setShowConfirmModal(false);
    setTempName(playerName);
    setPendingUsername('');
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

    if (cooldownRemaining > 0) {
      setError(`Please wait ${cooldownRemaining} seconds before submitting another roast.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setScore(null);

    try {
      const userId = auth.getUserId();
      const judgedScore = await judgeRoast(roastText, userId);
      setScore(judgedScore);
      
      // Set cooldown after successful submission
      setLastSubmissionTime(Date.now());
      setCooldownRemaining(10);
      
      setTimeout(() => {
        playGunshot();
      }, 100);
      
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
    if (e.key === 'Enter' && !isSubmitting && cooldownRemaining === 0) {
      handleSubmit();
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
  };

  const remainingChars = MAX_CHARACTERS - roastText.length;
  const isOverLimit = remainingChars < 0;

  return (
    <>
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
      
      <ConfirmUsernameModal
        isOpen={showConfirmModal}
        currentUsername={playerName}
        newUsername={pendingUsername}
        onConfirm={handleConfirmUsernameChange}
        onCancel={handleCancelUsernameChange}
      />

      <TutorialModal
        isOpen={showTutorial}
        onClose={handleTutorialClose}
        gameMode="single"
      />
      
      <div className="component-container game-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
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
              style={{ cursor: !isSubmitting ? 'pointer' : 'default', margin: 0 }}
              title="Click to edit name"
            >
              {playerName}
            </h2>
          )}
        </div>
      
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
        disabled={isSubmitting || !roastText.trim() || isOverLimit || cooldownRemaining > 0}
      >
        {isSubmitting ? 'Judging...' : cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : 'Submit Roast'}
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
            {score >= 90 ? (
              <>
                <span className="custom-fire">🔥</span> Legendary!
              </>
            ) : score >= 75 ? '😎 Solid roast!' :
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
    </>
  );
}

export default GamePanel;