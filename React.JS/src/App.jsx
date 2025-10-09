import React, { useState } from 'react'
import './App.css'
import GamePanel from './components/GamePanel'
import DualGamePanel from './components/DualGamePanel'
import Leaderboard from './components/Leaderboard'
import LandingPage from './components/LandingPage'
import MuteButton from './components/MuteButton'
import MusicPlayer from './components/MusicPlayer'
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

  if (!showGame) {
    return (
      <>
        <LandingPage onStartGame={handleStartGame} />
        <MusicPlayer />
      </>
    )
  }

  return (
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
      <MusicPlayer />
    </div>
  )
}

export default App;