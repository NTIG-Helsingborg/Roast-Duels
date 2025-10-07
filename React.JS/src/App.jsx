import React, { useState } from 'react'
import './App.css'
import GamePanel from './components/GamePanel'
import DualGamePanel from './components/DualGamePanel'
import Leaderboard from './components/Leaderboard'
import LandingPage from './components/LandingPage'
import MuteButton from './components/MuteButton'
import MusicPlayer from './components/MusicPlayer'

function App() {
  const [showGame, setShowGame] = useState(false)
  const [gameMode, setGameMode] = useState('single')
  const [roasts, setRoasts] = useState([])

  const handleStartGame = (mode) => {
    setGameMode(mode)
    setShowGame(true)
  }

  const handleBackToLanding = () => {
    setShowGame(false)
  }

  const handleRoastSubmitted = (roastData) => {
    setRoasts(prevRoasts => [roastData, ...prevRoasts])
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
        <button className="back-button" onClick={handleBackToLanding}>
          ← Back to Home
        </button>
        <MuteButton />
      </div>
      {gameMode === 'multiplayer' ? (
        <DualGamePanel onRoastSubmitted={handleRoastSubmitted} />
      ) : (
        <div className="game-container">
          <GamePanel onRoastSubmitted={handleRoastSubmitted} />
          <Leaderboard roasts={roasts} />
        </div>
      )}
      <MusicPlayer />
    </div>
  )
}

export default App;