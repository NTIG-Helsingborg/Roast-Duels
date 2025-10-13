import React from 'react'
import './Components.css'
import MuteButton from './MuteButton'
import AnimatedTitle from './AnimatedTitle'
import { useButtonSounds } from './useButtonSounds'

function LandingPage({ onStartGame }) {
  // Remove the unique key to prevent forced remounts
  const { playReload } = useButtonSounds()

  const handleButtonClick = (mode) => {
    onStartGame(mode)
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <AnimatedTitle />
        <div className="simple-container">
          <div style={{gap: '8rem'}} className="button-container">
            <button 
              className="wave-btn" 
              style={{
                fontSize: '1.8rem', 
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontFamily: "'Inter', sans-serif"
              }}
              onMouseEnter={playReload}
              onClick={() => handleButtonClick('multiplayer')}>
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
              onMouseEnter={playReload}
              onClick={() => handleButtonClick('single')}>
              Solo
              <span style={{display: 'block', fontSize: '0.9rem', opacity: 0.8, marginTop: '5px', fontWeight: 'normal'}}>
                Set highscores
              </span>
            </button>
          </div>
        </div>
      </div>
      <MuteButton />
      <footer>
        <p>Made by Mykyta, Carl & Viktor</p>
      </footer>
    </div>
  )
}

export default LandingPage
