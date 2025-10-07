import React, { useState, useEffect, useRef } from "react";
import song1 from '../assets/music/song_1.mp3';
import song2 from '../assets/music/song_2.mp3';
import song3 from '../assets/music/song_3.mp3';
import song4 from '../assets/music/song_4.mp3';
import song5 from '../assets/music/song_5.mp3';
import song6 from '../assets/music/song_6.mp3';

const songs = [song1, song2, song3, song4, song5, song6];

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appMuted')) || false;
    } catch {
      return false;
    }
  });
  const [canPlay, setCanPlay] = useState(false); // Track if user has interacted

  console.log('MusicPlayer rendered, currentIndex:', currentIndex, 'muted:', muted);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * songs.length);
    console.log('Setting random starting song:', randomIndex);
    setCurrentIndex(randomIndex);
  }, []);

  // Listen for first user interaction anywhere on the page
  useEffect(() => {
    const enableAudio = () => {
      console.log('User interacted, enabling audio');
      setCanPlay(true);
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };

    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);

    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
  }, []);

  // Try to play audio when user has interacted and song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !canPlay) {
      console.log('Audio not ready:', { audio: !!audio, canPlay });
      return;
    }

    console.log('Attempting to play audio, muted:', muted);
    audio.muted = muted;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Audio started playing successfully');
        })
        .catch(error => {
          console.log('Audio play failed:', error);
        });
    }
  }, [currentIndex, muted, canPlay]);

  // Listen for mute button events
  useEffect(() => {
    const handleMute = (e) => {
      const isMuted = e.detail.muted;
      setMuted(isMuted);
      if (audioRef.current && canPlay) {
        audioRef.current.muted = isMuted;
      }
    };

    window.addEventListener("audio-mute", handleMute);
    return () => window.removeEventListener("audio-mute", handleMute);
  }, [canPlay]);

  const handleEnded = () => {
    console.log('Song ended, moving to next');
    setCurrentIndex((prev) => (prev + 1) % songs.length);
  };

  return (
    <audio
      ref={audioRef}
      src={songs[currentIndex]}
      muted={muted}
      onEnded={handleEnded}
      style={{ display: "none" }}
    />
  );
}
