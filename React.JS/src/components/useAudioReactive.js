import { useEffect, useRef, useState } from 'react';

const PULSE_SIZE = 1.24; // How much the title scales (1.0 = no change, 1.25 = 25% bigger)
// Try values between 1.10 (subtle) to 1.40 (very dramatic)
// ============================================

export function useAudioReactive(isActive = false, delay = 250) {
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [audioData, setAudioData] = useState({
    scale: 1,
    rotation: 0,
    glow: 0
  });
  const smoothedBassRef = useRef(0);
  const smoothedMidRef = useRef(0);
  const lastBeatTimeRef = useRef(0);
  const previousBassRef = useRef(0);

  // Setup audio analyzer connection
  useEffect(() => {
    const handleAudioReady = (event) => {
      try {
        const { analyser } = event.detail;
        analyserRef.current = analyser;
        console.log('✅ Audio analyzer connected to hook');
      } catch (error) {
        console.error('❌ Error setting up audio analyzer:', error);
      }
    };

    window.addEventListener('audio-analyzer-ready', handleAudioReady);
    
    return () => {
      window.removeEventListener('audio-analyzer-ready', handleAudioReady);
    };
  }, []);

  // Start animation after delay when active
  useEffect(() => {
    if (!isActive || !analyserRef.current) return;

    const timer = setTimeout(() => {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const animate = () => {
        if (!analyserRef.current) return;

        try {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Optimized for song 6: Focus ONLY on kick drum frequencies
          // With 512 fftSize at 44100 Hz sample rate: each bin ≈ 86 Hz
          // Focus on bins 0-3 for pure kick drum (0-258 Hz)
          const kickRange = dataArray.slice(0, 3); // Narrower focus = cleaner detection
          
          // Calculate max value instead of average for better transient detection
          const kickPeak = Math.max(...kickRange);
          
          // SPIKE DETECTION: Look for sudden increases in bass energy
          const bassDelta = kickPeak - previousBassRef.current;
          previousBassRef.current = kickPeak;
          
          const currentTime = Date.now();
          const timeSinceLastBeat = currentTime - lastBeatTimeRef.current;
          const cooldownPeriod = 60; // MAXIMUM responsive - 60ms (up to 16 bps!)
          
          // Optimized thresholds using peak detection
          const minAmplitude = 25; // Balanced for peak detection
          const minSpike = 5; // Spike detection with peak values
          const isSpike = bassDelta > minSpike && 
                         kickPeak > minAmplitude && 
                         timeSinceLastBeat > cooldownPeriod;
          
          if (isSpike) {
            lastBeatTimeRef.current = currentTime;
            console.log('🥁 KICK!', kickPeak.toFixed(0), 'Δ' + bassDelta.toFixed(0));
          }
          
          // Target values - Use configurable pulse size
          const targetScale = isSpike ? PULSE_SIZE : 1.0;
          const targetGlow = isSpike ? 1.0 : 0.0;
          
          // Dual-speed smoothing: Fast attack, slower decay for punchy feel
          const attackFactor = 0.55;  // Very fast ramp up when beat hits
          const decayFactor = 0.75;   // Slightly slower return for natural feel
          
          const isGrowing = targetScale > smoothedBassRef.current;
          const currentSmoothing = isGrowing ? attackFactor : decayFactor;
          
          smoothedBassRef.current = (smoothedBassRef.current * currentSmoothing) + (targetScale * (1 - currentSmoothing));
          smoothedMidRef.current = (smoothedMidRef.current * 0.60) + (targetGlow * 0.40); // Fast glow response
          
          // Use the smoothed values
          const scale = smoothedBassRef.current;
          const glow = smoothedMidRef.current;
          
          // No rotation for clean, consistent effect
          const rotation = 0;
          
          setAudioData({ scale, rotation, glow });
        } catch (error) {
          console.error('Animation error:', error);
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();
    }, delay);

    return () => {
      clearTimeout(timer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, delay]);

  return audioData;
}
