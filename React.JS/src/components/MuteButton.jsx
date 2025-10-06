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
      className="mute-btn"
      aria-pressed={muted}
      title={muted ? 'Unmute' : 'Mute'}
      onClick={() => setMuted((m) => !m)}
    >
      {muted ? '🔇' : '🔈'}
    </button>
  );
}