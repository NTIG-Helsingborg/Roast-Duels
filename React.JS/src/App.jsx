import React from 'react'
import './App.css'
import GamePanel from './components/GamePanel'
import Leaderboard from './components/Leaderboard'

function App() {
  return (
    <div>
      <h1>Roast Battle Game</h1>
      <GamePanel />
      <Leaderboard />
    </div>
  )
}

export default App
