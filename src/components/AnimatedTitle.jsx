import React, { useEffect, useRef, useState } from 'react'
import sprayPaintSound from '../assets/spraypaintsound.mp3'
import { useAudioReactive } from './useAudioReactive'
import './Components.css'
import { motion } from 'framer-motion'

function AnimatedTitle({ 
  title = "Roast Battles", 
  className = "",
  soundVolume = 0.3,
  soundPlaybackRate = 1.0,
  soundEnabled = true
}) {
  const canvasRef = useRef(null)
  const titleRef = useRef(null)
  const measureRef = useRef(null)
  const stageRef = useRef(null)
  const animationRef = useRef(null)
  const [textTraced, setTextTraced] = useState(false)
  const animationStarted = useRef(false)
  const [shouldPlaySound, setShouldPlaySound] = useState(false)
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const soundTimeoutRef = useRef(null)
  const audioRef = useRef(null)
  const [audioKey] = useState(() => Date.now() + Math.random())
  const initialSizeRef = useRef(null)
  const [responsiveScale, setResponsiveScale] = useState(1)
  
  const [shouldDelayAudio, setShouldDelayAudio] = useState(() => {
    try {
      return sessionStorage.getItem('titleAnimated') !== 'true'
    } catch {
      return true
    }
  })
  
  const audioData = useAudioReactive(true, shouldDelayAudio ? 1000 : 0)
  
  useEffect(() => {
    if (audioData.scale !== 1) {
      console.log('[AnimatedTitle] 🎵 Audio pulse:', audioData.scale.toFixed(3))
    }
  }, [audioData.scale])
  
  useEffect(() => {
    console.log('[AnimatedTitle] Audio delay setting:', shouldDelayAudio ? '1000ms (waiting for animation)' : '0ms (instant sync)')
  }, [shouldDelayAudio])
  
  useEffect(() => {
    const updateResponsiveScale = () => {
      const scale = window.innerWidth / 1200
      setResponsiveScale(scale)
    }
    
    updateResponsiveScale()
    window.addEventListener('resize', updateResponsiveScale)
    
    return () => {
      window.removeEventListener('resize', updateResponsiveScale)
    }
  }, [])
  
  const traceColors = ["#00d9ff", "#0dc6e7", "#26c9e8", "#1fb5d1"]

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }
    if (!userHasInteracted) {
      document.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [userHasInteracted])

  useEffect(() => {
    const handleUserInteraction = () => {
      setUserHasInteracted(true)
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)
    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [])

  useEffect(() => {
    const hasAnimated = sessionStorage.getItem('titleAnimated') === 'true'
    
    if (hasAnimated) {
      console.log('[AnimatedTitle] ⚡ Returning - run animation but with instant audio sync')
      setShouldDelayAudio(false)
    } else {
      console.log('[AnimatedTitle] 🎨 First visit - starting animation with delayed audio')
    }
    
    setTextTraced(false)
    animationStarted.current = false
  }, [])

  useEffect(() => {
    setShouldPlaySound(true)
    const timeout = setTimeout(() => {
      setShouldPlaySound(false)
    }, 3300)
    return () => {
      clearTimeout(timeout)
      setShouldPlaySound(false)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = soundVolume;
    audio.playbackRate = soundPlaybackRate;
    audio.loop = false;
    if (shouldPlaySound && soundEnabled && userHasInteracted) {
      audio.currentTime = 12;
      audio.play()
        .then(() => {
          console.log('✅ Audio started successfully');
        })
        .catch((error) => {
          console.log('❌ Audio play failed:', error);
        });
    } else {
      audio.pause();
    }
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [shouldPlaySound, soundEnabled, userHasInteracted, soundVolume, soundPlaybackRate]);

  useEffect(() => {
    let didRun = false
    const startAnimation = () => {
      if (didRun || animationStarted.current) return
      didRun = true
      animationStarted.current = true

      if (typeof window === 'undefined' || !canvasRef.current || !measureRef.current) {
        setTextTraced(true)
        return
      }

      let stage = null
      if (window.createjs) {
        stage = new window.createjs.Stage(canvasRef.current)
        stageRef.current = stage
        window.createjs.Touch.enable(stage)
        window.createjs.Ticker.framerate = 60
        window.createjs.Ticker.addEventListener("tick", stage)
      }

      let actualFontSize = 176
      
      const canvas = canvasRef.current
      const titleElement = measureRef.current
      let titleRect = null
      
      requestAnimationFrame(() => {
        if (!titleElement || !canvas) return
        
        titleRect = titleElement.getBoundingClientRect()
        
        const testCanvas = document.createElement('canvas')
        const testCtx = testCanvas.getContext('2d')
        testCtx.font = `${actualFontSize}px "Snakehead Graffiti", sans-serif`
        const metrics = testCtx.measureText(title)
  const letterSpacingAdjustment = title.length * actualFontSize * (-0.02)
  const canvasTextWidth = metrics.width + letterSpacingAdjustment
        
        console.log('[AnimatedTitle] Measured title:', {
          domWidth: titleRect.width,
          height: titleRect.height,
          text: title,
          scrollWidth: titleElement.scrollWidth,
          offsetWidth: titleElement.offsetWidth,
          canvasTextWidth: canvasTextWidth,
          metricsWidth: metrics.width
        })
        
        const extraSpace = 60
        const actualWidth = canvasTextWidth
        canvas.width = actualWidth + (extraSpace * 2)
        canvas.height = titleRect.height + (extraSpace * 2)

        if (stage) {
          stage.x = extraSpace
          stage.y = extraSpace
        }
        
        initialSizeRef.current = {
          width: actualWidth,
          height: titleRect.height
        }
        
        setTimeout(() => {
          createTextTrace()
        }, 500)
      })

      const createParticle = (x, y, rad, alpha, color) => {
        if (!stage) return
        const circle = new window.createjs.Shape()
        circle.graphics.beginFill(color).drawCircle(0, 0, rad)
        circle.x = x
        circle.y = y
        circle.alpha = alpha
        stage.addChild(circle)
      }

      const getTextPathPoints = () => {
        try {
          const tempCanvas = document.createElement('canvas')
          const ctx = tempCanvas.getContext('2d')
          const canvasContentWidth = canvas.width - (60 * 2)
          tempCanvas.width = canvasContentWidth
          tempCanvas.height = titleRect.height

          ctx.font = `${actualFontSize}px "Snakehead Graffiti", sans-serif`
          ctx.letterSpacing = `${actualFontSize * -0.02}px`
          ctx.fillStyle = '#ffffff'
          ctx.textBaseline = 'alphabetic';

          // Use metrics.top if available (Safari), otherwise fallback to visually centered position
          const metrics = ctx.measureText(title);
          let yPos;
          const verticalOffset = 28; // Increased offset for better alignment
          if (typeof metrics.top === 'number') {
            // Safari supports metrics.top
            yPos = -metrics.top + (titleRect.height - (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)) / 2 - verticalOffset;
          } else {
            // Fallback for Chrome and others
            yPos = (titleRect.height - (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)) / 2 + metrics.actualBoundingBoxAscent - verticalOffset;
          }

          ctx.fillText(title, 0, yPos);
          const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imageData.data;
          const points = [];
          const sampleRate = Math.max(4, Math.floor(actualFontSize / 20));

          for (let y = 0; y < tempCanvas.height; y += sampleRate) {
            for (let x = 0; x < tempCanvas.width; x += sampleRate) {
              const index = (y * tempCanvas.width + x) * 4;
              const alpha = data[index + 3];
              if (alpha > 100) {
                const sprayCount = Math.floor(Math.random() * 2) + 2;
                for (let i = 0; i < sprayCount; i++) {
                  const baseSprayRadius = Math.max(1, actualFontSize / 40);
                  const sprayRadius = Math.random() * baseSprayRadius + baseSprayRadius * 0.5;
                  const angle = Math.random() * Math.PI * 2;
                  points.push({
                    x: x + Math.cos(angle) * sprayRadius,
                    y: y + Math.sin(angle) * sprayRadius,
                    delay: (x / tempCanvas.width) * 2500 + Math.random() * 300
                  });
                }
              }
            }
          }
          tempCanvas.remove();
          return points;
        } catch (error) {
          console.warn('[AnimatedTitle] Error processing font path:', error);
          return createFallbackPoints();
        }
      }

      const createFallbackPoints = () => {
        const points = []
        const canvasContentWidth = canvas.width - (60 * 2)
        const textWidth = canvasContentWidth
        const textHeight = titleRect.height
        const baseSprayRadius = Math.max(1, actualFontSize / 40)
        
        const stepSize = Math.max(4, Math.floor(actualFontSize / 20))
        
        for (let x = 0; x < textWidth; x += stepSize) {
          // Use metrics.top if available, otherwise fallback
          const testCanvas = document.createElement('canvas');
          const testCtx = testCanvas.getContext('2d');
          testCtx.font = `${actualFontSize}px "Snakehead Graffiti", sans-serif`;
          testCtx.textBaseline = 'alphabetic';
          const metrics = testCtx.measureText(title);
          let baseY;
          const verticalOffset = 24; // Increased offset for better alignment
          if (typeof metrics.top === 'number') {
            baseY = -metrics.top + (textHeight - (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)) / 2 - verticalOffset;
          } else {
            baseY = (textHeight - (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)) / 2 + metrics.actualBoundingBoxAscent - verticalOffset;
          }
          const waveY = baseY + Math.sin(x / textWidth * Math.PI * 6) * (actualFontSize * 0.1);

          const sprayCount = Math.floor(Math.random() * 2) + 3;
          for (let i = 0; i < sprayCount; i++) {
            const sprayRadius = Math.random() * baseSprayRadius * 2 + baseSprayRadius;
            const angle = Math.random() * Math.PI * 2;
            points.push({
              x: x + Math.cos(angle) * sprayRadius,
              y: waveY + Math.sin(angle) * sprayRadius,
              delay: (x / textWidth) * 2500 + Math.random() * 200
            });
          }
        }
        return points;
      }

      const createTextTrace = () => {
        const points = getTextPathPoints()
        if (!stage) {
          setTimeout(() => {
            setTextTraced(true)
            setShouldDelayAudio(false)
            try {
              sessionStorage.setItem('titleAnimated', 'true')
            } catch (e) {}
          }, 1000)
          return
        }
        
        points.forEach((point) => {
          setTimeout(() => {
            const color = traceColors[Math.floor(Math.random() * traceColors.length)]
            const baseSize = Math.max(1, actualFontSize / 50)
            const size = Math.random() * baseSize + baseSize * 0.5
            const alpha = Math.random() * 0.4 + 0.6
            createParticle(point.x, point.y, size, alpha, color)
          }, point.delay)
        })
        
        const maxDelay = Math.max(...points.map(p => p.delay))
        
        setTimeout(() => {
          setTextTraced(true)
          setShouldDelayAudio(false)
          console.log('[AnimatedTitle] 🎵 Animation complete, audio sync active')
          
          try {
            sessionStorage.setItem('titleAnimated', 'true')
          } catch (e) {}
        }, maxDelay + 1000)
      }
      
      return () => {
        if (animationRef.current) clearTimeout(animationRef.current)
        if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current)
        setShouldPlaySound(false)
        if (stage) {
          window.createjs.Ticker.removeEventListener("tick", stage)
          stage.removeAllChildren()
          stage.removeAllEventListeners()
        }
      }
    }

    startAnimation()
  }, [])

  return (
    <div className={`animated-title-container ${className}`} style={{ 
      position: 'relative', 
      display: 'inline-block',
      overflow: 'visible',
      transform: `scale(${responsiveScale})`,
      transformOrigin: 'center center'
    }}>
      <motion.div
        initial={{ scale: 2 }}
        animate={
          textTraced
            ? {
                scale: [2, 1.02, 1],
                transition: {
                  duration: 1.8,
                  times: [0, 0.75, 1],
                  ease: [0.16, 1, 0.3, 1]
                }
              }
            : {}
        }
        style={{ 
          position: 'relative',
          zIndex: 3,
          opacity: textTraced ? 1 : 0,
          visibility: textTraced ? 'visible' : 'hidden',
          willChange: 'transform'
        }}
      >
        <h1 
          ref={titleRef}
          className="game-title" 
          style={{ 
            position: 'relative',
            zIndex: 3,
            opacity: 1,
            transform: `scale(${audioData.scale})`,
            filter: `drop-shadow(0 0 ${6 + audioData.glow * 10}px rgba(0, 217, 255, ${audioData.glow * 0.4}))`,
            transformOrigin: 'center center',
            willChange: 'transform, filter'
          }}
        >
          {title}
        </h1>
      </motion.div>
      
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, calc(-50% + 5.1rem))`,
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />
      
      <h1 
        ref={measureRef}
        className="game-title" 
        style={{ 
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
          visibility: textTraced ? 'hidden' : 'visible',
          whiteSpace: 'nowrap',
          width: 'max-content'
        }}
        aria-hidden="true"
      >
        {title}
      </h1>
      
      <audio
        key={audioKey}
        ref={audioRef}
        src={sprayPaintSound}
        preload="none"
      />
      
      {!userHasInteracted && (
        <div 
          style={{
            position: 'fixed',
            left: `${cursorPosition.x + 15}px`,
            top: `${cursorPosition.y - 40}px`,
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#00d9ff',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            zIndex: 9999,
            pointerEvents: 'none',
            transform: 'translate(0, 0)',
            transition: 'all 0.1s ease-out',
            boxShadow: '0 2px 8px rgba(0, 217, 255, 0.3)',
            border: '1px solid rgba(0, 217, 255, 0.5)',
            whiteSpace: 'nowrap'
          }}
        >
          🔊 Click for sound
        </div>
      )}
    </div>
  )
}

export default AnimatedTitle
