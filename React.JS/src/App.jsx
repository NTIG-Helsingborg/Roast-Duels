import React, { useState } from 'react'
import './App.css'
import GamePanel from './components/GamePanel'
import Leaderboard from './components/Leaderboard'
import LandingPage from './components/LandingPage'
import MuteButton from './components/MuteButton'
import MusicPlayer from './components/MusicPlayer'
import DrawingCanvas from './components/DrawingCanvas'
import { useButtonSounds } from './components/useButtonSounds'

function App() {
  const [showGame, setShowGame] = useState(false)
  const [gameMode, setGameMode] = useState('single')
  const { playReload, playGunshot } = useButtonSounds()

  const handleStartGame = (mode) => {
    setGameMode(mode)
    setShowGame(true)
  }

  const handleBackToLanding = () => {
    playGunshot()
    setShowGame(false)
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
            <MuteButton />
          </div>
          {gameMode === 'multiplayer' ? (
            <DualGamePanel />
          ) : (
            <div className="game-container">
              <GamePanel />
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