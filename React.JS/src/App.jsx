import React, { useState } from 'react'
import './App.css'
import GamePanel from './components/GamePanel'
import Leaderboard from './components/Leaderboard'
import LandingPage from './components/LandingPage'
import MuteButton from './components/MuteButton'

function App() {
  const [showGame, setShowGame] = useState(false)
  const [gameMode, setGameMode] = useState('single')

  const handleStartGame = (mode) => {
    setGameMode(mode)
    setShowGame(true)
  }

  const handleBackToLanding = () => {
    setShowGame(false)
  }

  if (!showGame) {
    return <LandingPage onStartGame={handleStartGame} />
  }

  return (
    <div className="app-wrapper">
      <div className="game-header">
        <button className="back-button" onClick={handleBackToLanding}>
          ← Back to Home
        </button>
        <MuteButton />
      </div>
      <div className="game-container">
        <GamePanel gameMode={gameMode} />
        <Leaderboard />
      </div>
    </div>
  )
}

export default App;