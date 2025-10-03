import React from 'react'
import './Components.css'

function LandingPage({ onStartGame }) {
  return (
    <div className="landing-page">
      <div className="simple-container">
        <div style={{gap: '8rem'}} className="button-container">
          <button 
            className="wave-btn" 
            style={{
              fontSize: '1.8rem', 
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontFamily: "'Inter', sans-serif"
            }} 
            onClick={onStartGame}>
            Multiplayer
            <span style={{display: 'block', fontSize: '0.9rem', opacity: 0.8, marginTop: '5px', fontWeight: 'normal'}}>
              Battle online
            </span>
          </button>
          <button 
            className="wave-btn" 
            style={{
              fontSize: '1.8rem', 
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontFamily: "'Inter', sans-serif"
            }} 
            onClick={onStartGame}>
            Single Player
            <span style={{display: 'block', fontSize: '0.9rem', opacity: 0.8, marginTop: '5px', fontWeight: 'normal'}}>
              Practice mode
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
