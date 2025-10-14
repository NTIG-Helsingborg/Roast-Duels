import React from 'react';
import './Components.css';
import { useButtonSounds } from './useButtonSounds';

function ConfirmUsernameModal({ isOpen, currentUsername, newUsername, onConfirm, onCancel }) {
  const { playReload, playGunshot } = useButtonSounds();

  if (!isOpen) return null;

  const handleConfirm = () => {
    playGunshot();
    onConfirm();
  };

  const handleCancel = () => {
    playReload();
    onCancel();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Confirm Change</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            Are you sure you want to change your username?
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--spray-cyan)' }}>
            {currentUsername}
          </p>
          <p style={{ fontSize: '3rem', margin: '0.5rem 0' }}>↓</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--spray-magenta)' }}>
            {newUsername}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="modal-submit-btn"
            onClick={handleConfirm}
            onMouseEnter={playReload}
            style={{ flex: 1, marginTop: '0' }}
          >
            Yes, Change Username
          </button>
          <button 
            className="mode-toggle-btn"
            onClick={handleCancel}
            onMouseEnter={playReload}
            style={{ flex: 1, marginTop: '0'}}
          >
            Cancel
          </button>
        </div>

        <button 
          className="modal-close-btn"
          onClick={handleCancel}
          onMouseEnter={playReload}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default ConfirmUsernameModal;

