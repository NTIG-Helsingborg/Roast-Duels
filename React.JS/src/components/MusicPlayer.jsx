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
  const gainNodeRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appMuted')) || false;
    } catch {
      return false;
    }
  });
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * songs.length);
    setCurrentIndex(randomIndex);
  }, []);

  useEffect(() => {
    const enableAudio = () => {
      setCanPlay(true);
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !canPlay) {
      return;
    }

    if (!audioContextRef.current) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.7;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = muted ? 0 : 0.5;
        
        const source = audioContext.createMediaElementSource(audio);
        
        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
        gainNodeRef.current = gainNode;
        
        window.dispatchEvent(new CustomEvent('audio-analyzer-ready', {
          detail: { analyser }
        }));
      } catch (error) {
        console.error('Failed to initialize audio analyzer:', error);
      }
    } else if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = muted ? 0 : 0.5;
    }
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  }, [currentIndex, muted, canPlay]);

  useEffect(() => {
    const handleMute = (e) => {
      const isMuted = e.detail.muted;
      setMuted(isMuted);
      
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = isMuted ? 0 : 0.5;
      }
    };

    window.addEventListener("audio-mute", handleMute);
    return () => window.removeEventListener("audio-mute", handleMute);
  }, []);

  const handleEnded = () => {
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
