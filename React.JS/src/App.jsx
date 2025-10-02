import React from 'react'
import './App.css'
import GamePanel from './components/GamePanel'
import Leaderboard from './components/Leaderboard'

function App() {
  return (
    <div style={{padding: '20px'}}>
      <h1>Roast Battle Game</h1>
      <div className='panelContainer'>
        <GamePanel />
        <Leaderboard />
      </div>
    </div>
  )
}

export default App
