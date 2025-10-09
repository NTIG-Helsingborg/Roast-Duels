import React, { useState, useEffect, useRef } from "react";
import song1 from '../assets/music/song_1.mp3';
import song2 from '../assets/music/song_2.mp3';
import song3 from '../assets/music/song_3.mp3';
import song4 from '../assets/music/song_4.mp3';
import song5 from '../assets/music/song_5.mp3';
import song6 from '../assets/music/song_6.mp3';

const songs = [song6, song3];

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const gainNodeRef = useRef(null); // For volume control
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

    // Setup Web Audio API for frequency analysis
    if (!audioContextRef.current) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        
        // Optimized settings for bass/kick detection
        analyser.fftSize = 512; // 256 frequency bins (higher resolution for bass)
        analyser.smoothingTimeConstant = 0.7; // Less smoothing for more responsive detection
        analyser.minDecibels = -90; // Capture quieter sounds
        analyser.maxDecibels = -10; // Better dynamic range
        
        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = muted ? 0 : 1;
        
        const source = audioContext.createMediaElementSource(audio);
        
        // Connect: source -> analyser -> gainNode -> destination
        // This way the analyser always receives audio data even when muted
        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
        gainNodeRef.current = gainNode;
        
        // Dispatch event so other components can access the analyzer
        window.dispatchEvent(new CustomEvent('audio-analyzer-ready', {
          detail: { analyser }
        }));
        
        console.log('✅ Audio analyzer initialized with optimized settings for song 6');
      } catch (error) {
        console.error('❌ Failed to initialize audio analyzer:', error);
      }
    } else if (gainNodeRef.current) {
      // Update gain node if audio context already exists
      gainNodeRef.current.gain.value = muted ? 0 : 1;
    }

    console.log('Attempting to play audio, muted:', muted);
    
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
      
      // Update gain node instead of audio element muted property
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = isMuted ? 0 : 1;
        console.log('🔊 Gain node updated:', isMuted ? 'muted' : 'unmuted');
      }
    };

    window.addEventListener("audio-mute", handleMute);
    return () => window.removeEventListener("audio-mute", handleMute);
  }, []);

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
