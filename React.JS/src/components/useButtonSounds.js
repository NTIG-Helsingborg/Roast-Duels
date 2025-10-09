import { useEffect, useRef, useState } from 'react';
import reloadSound from '../assets/reload.mp3';
import gunshotSound from '../assets/gunshot.mp3';

export function useButtonSounds() {
  const reloadAudioRef = useRef(null);
  const gunshotAudioRef = useRef(null);
  const [muted, setMuted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appMuted')) || false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Create audio elements
    reloadAudioRef.current = new Audio(reloadSound);
    gunshotAudioRef.current = new Audio(gunshotSound);
    
    // Set volumes
    reloadAudioRef.current.volume = 0.3;
    gunshotAudioRef.current.volume = 0.4;
    
    // Preload
    reloadAudioRef.current.load();
    gunshotAudioRef.current.load();

    return () => {
      // Cleanup
      if (reloadAudioRef.current) {
        reloadAudioRef.current.pause();
        reloadAudioRef.current = null;
      }
      if (gunshotAudioRef.current) {
        gunshotAudioRef.current.pause();
        gunshotAudioRef.current = null;
      }
    };
  }, []);

  // Listen for mute button events
  useEffect(() => {
    const handleMute = (e) => {
      setMuted(e.detail.muted);
    };

    window.addEventListener('audio-mute', handleMute);
    return () => window.removeEventListener('audio-mute', handleMute);
  }, []);

  const playReload = () => {
    if (!muted && reloadAudioRef.current) {
      reloadAudioRef.current.currentTime = 0;
      reloadAudioRef.current.play().catch(err => console.log('Reload sound play failed:', err));
    }
  };

  const playGunshot = () => {
    if (!muted && gunshotAudioRef.current) {
      gunshotAudioRef.current.currentTime = 0;
      gunshotAudioRef.current.play().catch(err => console.log('Gunshot sound play failed:', err));
    }
  };

  return { playReload, playGunshot };
}
