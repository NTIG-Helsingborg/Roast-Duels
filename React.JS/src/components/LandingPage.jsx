import React from 'react'
import './Components.css'
import MuteButton from './MuteButton'

function LandingPage({ onStartGame }) {
  return (
    <div className="landing-page">
      <h1 className="game-title">Roast Battles</h1>
      <div className="simple-container">
        <div style={{gap: '8rem'}} className="button-container">
          <button 
            className="wave-btn" 
            style={{
              fontSize: '1.8rem', 
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontFamily: "'Inter', sans-serif"
            }} 
            onClick={() => onStartGame('multiplayer')}>
            Duel
            <span style={{display: 'block', fontSize: '0.9rem', opacity: 0.8, marginTop: '5px', fontWeight: 'normal'}}>
              Roast a friend
            </span>
          </button>
          <button 
            className="wave-btn" 
            style={{
              fontSize: '1.8rem', 
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontFamily: "'Inter', sans-serif"
            }} 
            onClick={() => onStartGame('single')}>
            Solo
            <span style={{display: 'block', fontSize: '0.9rem', opacity: 0.8, marginTop: '5px', fontWeight: 'normal'}}>
              Set highscores
            </span>
          </button>
        </div>
      </div>
      <MuteButton />
      <footer><p>By Mykyta (Mykyta-G), Carl (C4RL-06), Damian (Ghost-With-A-Shoe), Viktor (ViktorAlkbrand)</p></footer>
    </div>
  )
}

export default LandingPage
