import React, { useState, useEffect, useRef } from 'react';
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
    description: 'Type your roast here! Be creative, witty, and keep it under 200 characters, type in English for better score. The AI will judge your roast.',
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
  const [modalPosition, setModalPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  const [modalScale, setModalScale] = useState(1);
  const modalRef = useRef(null);
  const { playReload, playGunshot } = useButtonSounds();

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0); // Always start from first step
      document.body.classList.add('tutorial-active');
    } else {
      document.body.classList.remove('tutorial-active');
    }

    return () => {
      document.body.classList.remove('tutorial-active');
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      highlightCurrentElement();
    }
  }, [isOpen, currentStep]);

  const highlightCurrentElement = () => {
    const step = TUTORIAL_STEPS[currentStep];
    if (!step) return;

    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    // Only highlight elements on larger screens
    const isSmallScreen = window.innerWidth < 768;
    if (!isSmallScreen) {
      const elements = document.querySelectorAll(step.selector);
      if (elements.length > 0) {
        const element = elements[0];
        element.classList.add('tutorial-highlight');
        
        // Scale down modal for big components
        const elementRect = element.getBoundingClientRect();
        const isBigComponent = elementRect.width > 300 || elementRect.height > 100;
        setModalScale(isBigComponent ? 0.8 : 1);
        
        calculateModalPosition(element);
      } else {
        // If no element found, center the modal
        setModalScale(1);
        calculateModalPosition(null);
      }
    } else {
      // On mobile, always use normal scale and center modal
      setModalScale(1);
      calculateModalPosition(null);
    }
  };

  const calculateModalPosition = (highlightedElement) => {
    if (!modalRef.current) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // If no element provided or on mobile, center the modal
    if (!highlightedElement || viewportWidth < 768) {
      const newPosition = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
      setModalPosition(newPosition);
      return;
    }
    
    // For larger screens, we need the element rect
    const elementRect = highlightedElement.getBoundingClientRect();
    
    // Responsive modal sizing (only for larger screens now)
    const modalWidth = 600;
    const modalHeight = 400;
    const padding = 20;
    
    let newPosition = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    // Special positioning for submit button (step 3)
    if (currentStep === 2) { // Step 3 is index 2
      // On larger screens, position modal to the far right
      const rightPosition = viewportWidth - modalWidth - padding;
      newPosition = {
        top: `${elementRect.top + (elementRect.height / 2)}px`,
        left: `${rightPosition}px`,
        transform: 'translateY(-50%)'
      };
    } else {
      // Regular positioning logic for other steps
      // On larger screens, use smart positioning
      if (elementRect.top < viewportHeight / 2) {
        // Position modal below the element
        const topPosition = elementRect.bottom + padding;
        if (topPosition + modalHeight < viewportHeight) {
          newPosition = {
            top: `${topPosition}px`,
            left: '50%',
            transform: 'translateX(-50%)'
          };
        } else {
          // If not enough space below, position above
          const topPositionAbove = elementRect.top - modalHeight - padding;
          if (topPositionAbove > 0) {
            newPosition = {
              top: `${topPositionAbove}px`,
              left: '50%',
              transform: 'translateX(-50%)'
            };
          }
        }
      } else {
        // Position modal above the element
        const topPositionAbove = elementRect.top - modalHeight - padding;
        if (topPositionAbove > 0) {
          newPosition = {
            top: `${topPositionAbove}px`,
            left: '50%',
            transform: 'translateX(-50%)'
          };
        } else {
          // If not enough space above, position below
          const topPosition = elementRect.bottom + padding;
          if (topPosition + modalHeight < viewportHeight) {
            newPosition = {
              top: `${topPosition}px`,
              left: '50%',
              transform: 'translateX(-50%)'
            };
          }
        }
      }
    }
    
    setModalPosition(newPosition);
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
      <div 
        ref={modalRef}
        className="modal-content tutorial-modal"
        style={{
          ...modalPosition,
          transform: `${modalPosition.transform} scale(${modalScale})`
        }}
      >
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
