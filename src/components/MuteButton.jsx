import React, { useEffect, useState } from 'react';

export default function MuteButton() {
  const [muted, setMuted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appMuted')) || false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Persist state
    localStorage.setItem('appMuted', JSON.stringify(muted));
    // Notify any audio players in the app to mute/unmute
    window.dispatchEvent(new CustomEvent('audio-mute', { detail: { muted } }));
  }, [muted]);

  return (
    <button
      className={`mute-btn ${muted ? 'muted' : ''}`}
      aria-pressed={muted}
      title={muted ? 'Unmute' : 'Mute'}
      onClick={() => setMuted((m) => !m)}
    >
      <div className="volume-icon">
        {/* Volume speaker icon */}
        <svg viewBox="0 0 24 24" width="80" height="80" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        {/* Red slash overlay when muted */}
        {muted && <div className="mute-slash"></div>}
      </div>
    </button>
  );
}