import React, { useState, useEffect } from 'react'
import './App.css'
import GamePanel from './components/GamePanel'
import DualGamePanel from './components/DualGamePanel'
import Leaderboard from './components/Leaderboard'
import LandingPage from './components/LandingPage'
import MuteButton from './components/MuteButton'
import MusicPlayer from './components/MusicPlayer'
import DrawingCanvas from './components/DrawingCanvas'
import { useButtonSounds } from './components/useButtonSounds'
import { auth } from './utils/auth'
import { tutorialUtils } from './utils/tutorial'

function App() {
  const [showGame, setShowGame] = useState(false)
  const [gameMode, setGameMode] = useState('single')
  const [playerName, setPlayerName] = useState('')
  const { playReload, playGunshot } = useButtonSounds()

  useEffect(() => {
    const checkAuth = async () => {
      const data = await auth.verify();
      if (data) {
        setPlayerName(data.username);
      } else {
        setPlayerName('');
      }
    };
    
    checkAuth();
    
    // Check auth status periodically to catch login changes
    const interval = setInterval(checkAuth, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleStartGame = (mode) => {
    setGameMode(mode)
    setShowGame(true)
  }

  const handleBackToLanding = () => {
    playGunshot()
    setShowGame(false)
  }

  const handleLogout = () => {
    auth.logout();
    setPlayerName('');
    setShowGame(false);
  }

  const handleReplayTutorial = () => {
    // Force show tutorial by setting showTutorial state
    window.dispatchEvent(new CustomEvent('replayTutorial'));
  }

  return (
    <>
      {/* DrawingCanvas with delay only on landing page, muted on game pages */}
      <DrawingCanvas key={showGame ? 'game' : 'landing'} startDelay={!showGame ? 5000 : 0} muted={showGame} />
      {!showGame ? (
        <LandingPage onStartGame={handleStartGame} />
      ) : (
        <div className="app-wrapper">
          <div className="game-header">
            <button 
              className="back-button"
              onMouseEnter={playReload}
              onClick={handleBackToLanding}>
              ← Back to Home
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {playerName && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    className="back-button"
                    onClick={handleLogout}
                    onMouseEnter={playReload}
                  >
                    Logout
                  </button>
                  <button
                    className="back-button"
                    onClick={handleReplayTutorial}
                    onMouseEnter={playReload}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    Replay Tutorial
                  </button>
                </div>
              )}
              <MuteButton />
            </div>
          </div>
          {gameMode === 'multiplayer' ? (
            <DualGamePanel onBackToLanding={handleBackToLanding} />
          ) : (
            <div className="game-container">
              <GamePanel onBackToLanding={handleBackToLanding} />
              <Leaderboard />
            </div>
          )}
        </div>
      )}
      <MusicPlayer />
    </>
  )
}

export default App;