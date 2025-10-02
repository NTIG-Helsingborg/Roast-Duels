import React from 'react'
import './LandingPage.css'

function LandingPage({ onStartGame }) {
  return (
    <div className="landing-page">
      <div className="simple-container">
        <h1 className="game-title">Roast Battle</h1>
        <div className="button-container">
          <button className="game-button" onClick={onStartGame}>
            Multiplayer
          </button>
          <button className="game-button" onClick={onStartGame}>
            Single Player
          </button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
