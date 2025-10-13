import React, { useState } from 'react';
import './Components.css';
import { useButtonSounds } from './useButtonSounds';

function LoginModal({ isOpen, onClose, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { playReload, playGunshot } = useButtonSounds();

  if (!isOpen) return null;

  const MAX_USERNAME_LENGTH = 15;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username!');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password!');
      return;
    }

    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters!');
      return;
    }

    if (username.trim().length > MAX_USERNAME_LENGTH) {
      setError(`Username must be ${MAX_USERNAME_LENGTH} characters or less!`);
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters!');
      return;
    }

    // Check password confirmation only in sign-up mode
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

    playGunshot();
    onLogin(username.trim(), password);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{isSignUp ? 'Join the Arena' : 'Enter the Arena'}</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
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

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="modal-submit-btn"
            onMouseEnter={playReload}
          >
            {isSignUp ? 'Create Account & Roast! 🔥' : 'Let\'s Roast! 🔥'}
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

        <button 
          className="modal-close-btn"
          onClick={onClose}
          onMouseEnter={playReload}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default LoginModal;
