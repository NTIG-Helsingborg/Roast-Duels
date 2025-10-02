import React from 'react'
import './Components.css'

function LandingPage({ onStartGame }) {
  return (
    <div className="landing-page">
      <div className="simple-container">
        <h1 className="game-title">Roast Battle</h1>
        <div className="button-container">
          <button className="btn-primary game-button" onClick={onStartGame}>
            Multiplayer
          </button>
          <button className="btn-primary game-button" onClick={onStartGame}>
            Single Player
          </button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
