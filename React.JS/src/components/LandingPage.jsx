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
          <div className="button-container">
            <button 
              className="wave-btn" 
              onMouseEnter={playReload}
              onClick={() => handleButtonClick('multiplayer')}>
              Duel
              <span>Roast a friend</span>
            </button>
            <button 
              className="wave-btn" 
              onMouseEnter={playReload}
              onClick={() => handleButtonClick('single')}>
              Solo
              <span>Set highscores</span>
            </button>
          </div>
        </div>
      </div>
      <MuteButton />
      <footer>
        <p>Made by Mykyta, Carl, Damian & Viktor</p>
      </footer>
    </div>
  )
}

export default LandingPage
