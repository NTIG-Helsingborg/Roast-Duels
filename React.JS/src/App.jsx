import React, { useState } from 'react'
import './App.css'
import GamePanel from './components/GamePanel'
import Leaderboard from './components/Leaderboard'
import LandingPage from './components/LandingPage'

function App() {
  const [showGame, setShowGame] = useState(false)

  const handleStartGame = () => {
    setShowGame(true)
  }

  const handleBackToLanding = () => {
    setShowGame(false)
  }

  if (!showGame) {
    return <LandingPage onStartGame={handleStartGame} />
  }

  return (
    <div>
      <div className="game-header">
        <button className="back-button" onClick={handleBackToLanding}>
          ← Back to Home
        </button>
        <h1>Roast Battle Game</h1>
      </div>
      <div className="game-container">
        <GamePanel />
        <Leaderboard />
      </div>
    </div>
  )
}

export default App;