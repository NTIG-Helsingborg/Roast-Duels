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
    
    // Check auth status periodically to catch login changes (every 30 seconds)
    const interval = setInterval(checkAuth, 30000);
    
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
                <button
                  className="back-button"
                  onClick={handleLogout}
                  onMouseEnter={playReload}
                >
                  Logout
                </button>
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