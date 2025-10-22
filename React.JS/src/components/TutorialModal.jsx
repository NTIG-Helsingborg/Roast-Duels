import React, { useState, useEffect } from 'react';
import './Components.css';
import { useButtonSounds } from './useButtonSounds';

const TUTORIAL_STEPS = [
  {
    id: 'player-name',
    title: 'Step 1: Your Player Name',
    description: 'Click on your name to edit it. This is your battle tag that other players will see!',
    selector: '.solo-player, .player-title',
    position: 'top'
  },
  {
    id: 'roast-input',
    title: 'Step 2: Enter Your Roast',
    description: 'Type your roast here! Be creative, witty, and keep it under 200 characters. The AI will judge your roast.',
    selector: '#roast-input, input[type="text"]',
    position: 'bottom'
  },
  {
    id: 'submit-button',
    title: 'Step 3: Submit Your Roast',
    description: 'Click this button to submit your roast and get it judged! You\'ll get a score from 0-100.',
    selector: '.btn-primary, .dual-submit-btn',
    position: 'top'
  },
  {
    id: 'leaderboard',
    title: 'Step 4: Check the Leaderboard',
    description: 'See your scores and recent roasts here. The leaderboard shows the best roasts from all players!',
    selector: '.leaderboard',
    position: 'left'
  },
  {
    id: 'navigation',
    title: 'Step 5: Navigation',
    description: 'Use the back button to return to the home screen, or logout to switch accounts.',
    selector: '.back-button',
    position: 'bottom'
  }
];

function TutorialModal({ isOpen, onClose, gameMode = 'single' }) {
  const [currentStep, setCurrentStep] = useState(0);
  const { playReload, playGunshot } = useButtonSounds();

  useEffect(() => {
    if (isOpen) {
      highlightCurrentElement();
      document.body.classList.add('tutorial-active');
    } else {
      document.body.classList.remove('tutorial-active');
    }

    return () => {
      document.body.classList.remove('tutorial-active');
    };
  }, [isOpen, currentStep]);

  const highlightCurrentElement = () => {
    const step = TUTORIAL_STEPS[currentStep];
    if (!step) return;

    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    const elements = document.querySelectorAll(step.selector);
    if (elements.length > 0) {
      const element = elements[0];
      element.classList.add('tutorial-highlight');
    }
  };

  const handleNext = () => {
    playReload();
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    playReload();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    playGunshot();
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
    localStorage.setItem('tutorialCompleted', 'true');
    onClose();
  };

  const handleSkip = () => {
    playReload();
    handleFinish();
  };

  if (!isOpen) return null;

  const currentStepData = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="modal-overlay tutorial-overlay">
      <div className="modal-content tutorial-modal">
        <div className="tutorial-header">
          <h2 className="modal-title tutorial-title">
            Welcome to Roast Duels! <span className="custom-fire">🔥</span>
          </h2>
          <div className="tutorial-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
              />
            </div>
            <span className="progress-text">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>
          </div>
        </div>

        <div className="tutorial-content">
          <div className="tutorial-step">
            <h3 className="step-title">{currentStepData.title}</h3>
            <p className="step-description">{currentStepData.description}</p>
          </div>
        </div>

        <div className="tutorial-actions">
          <div className="tutorial-buttons">
            {!isFirstStep && (
              <button 
                className="tutorial-btn tutorial-btn-secondary"
                onClick={handlePrevious}
                onMouseEnter={playReload}
              >
                ← Previous
              </button>
            )}
            
            <button 
              className="tutorial-btn tutorial-btn-skip"
              onClick={handleSkip}
              onMouseEnter={playReload}
            >
              Skip Tutorial
            </button>
            
            <button 
              className="tutorial-btn tutorial-btn-primary"
              onClick={handleNext}
              onMouseEnter={playReload}
            >
              {isLastStep ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;
