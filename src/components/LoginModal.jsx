import React, { useState } from 'react';
import './Components.css';
import { useButtonSounds } from './useButtonSounds';
import { auth } from '../utils/auth';

function LoginModal({ isOpen, onClose, onLogin, isDualMode = false, onBackToLanding }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { playReload, playGunshot } = useButtonSounds();

  if (!isOpen) return null;

  const MAX_USERNAME_LENGTH = 15;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username!');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password!');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters!');
      return;
    }

    if (username.trim().length > MAX_USERNAME_LENGTH) {
      setError(`Username must be ${MAX_USERNAME_LENGTH} characters or less!`);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }

    if (isSignUp) {
      if (!confirmPassword.trim()) {
        setError('Please confirm your password!');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match!');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const data = isSignUp 
        ? await auth.register(username.trim(), password)
        : await auth.login(username.trim(), password);
      
      playGunshot();
      
      if (isDualMode) {
        onLogin(data.username, data.username + ' 2');
      } else {
        onLogin(data.username);
      }
      
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const toggleMode = () => {
    playReload();
    setIsSignUp(!isSignUp);
    setError('');
    setConfirmPassword(''); // Clear confirm password when switching modes
  };

  const modalTitle = isDualMode 
    ? (isSignUp ? 'Create Account' : 'Enter the Battle')
    : (isSignUp ? 'Join the Arena' : 'Enter the Arena');

  const submitButtonText = isDualMode
    ? (isSignUp ? 'Create Account & Battle!' : 'Log In!')
    : (isSignUp ? 'Create Account & Roast!' : 'Log In!');

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${isDualMode ? 'dual-modal' : ''}`}>
        <h2 className="modal-title">{modalTitle}</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          {isDualMode ? (
            // Dual mode layout
            <div className="dual-login-container">
              <div className="player-login-section">
                <div className="input-group">
                  <label htmlFor="username-input">
                    Player Name: 
                    <span className="char-counter"> ({username.length}/{MAX_USERNAME_LENGTH})</span>
                  </label>
                  <input
                    id="username-input"
                    type="text"
                    placeholder="Enter your name..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={MAX_USERNAME_LENGTH}
                    autoFocus
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="password-input">Password:</label>
                  <input
                    id="password-input"
                    type="password"
                    placeholder="Enter your password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={50}
                  />
                </div>
                {isSignUp && (
                  <div className="input-group">
                    <label htmlFor="confirm-password-input">Confirm Password:</label>
                    <input
                      id="confirm-password-input"
                      type="password"
                      placeholder="Re-enter your password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      maxLength={50}
                    />
                  </div>
                )}
              </div>

              {!isSignUp && (
                <>
                  <div className="vs-divider">VS</div>

                  <div className="player-login-section">
                    <div className="player2-preview">
                      <div className="preview-label">Player 2 will be:</div>
                      <div className="preview-name">{username ? username + ' 2' : ''}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Single mode layout
            <>
              <div className="input-group">
                <label htmlFor="username-input">
                  Choose Your Tag: 
                  <span className="char-counter"> ({username.length}/{MAX_USERNAME_LENGTH})</span>
                </label>
                <input
                  id="username-input"
                  type="text"
                  placeholder="Enter your name..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={MAX_USERNAME_LENGTH}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label htmlFor="password-input">Enter Password:</label>
                <input
                  id="password-input"
                  type="password"
                  placeholder="Enter your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={50}
                />
              </div>

              {isSignUp && (
                <div className="input-group">
                  <label htmlFor="confirm-password-input">Confirm Password:</label>
                  <input
                    id="confirm-password-input"
                    type="password"
                    placeholder="Re-enter your password..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={50}
                  />
                </div>
              )}
            </>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="modal-submit-btn"
            onMouseEnter={playReload}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : submitButtonText}
          </button>

          <button 
            type="button"
            className="mode-toggle-btn"
            onClick={toggleMode}
            onMouseEnter={playReload}
          >
            {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
          </button>
        </form>
      </div>
      
      {onBackToLanding && (
        <button 
          className="back-button modal-back-button"
          type="button"
          onMouseEnter={playReload}
          onClick={onBackToLanding}
        >
          ← Back to Home
        </button>
      )}
    </div>
  );
}

export default LoginModal;
