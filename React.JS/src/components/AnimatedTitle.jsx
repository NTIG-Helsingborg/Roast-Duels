import React, { useEffect, useRef, useState } from 'react'
import opentype from 'opentype.js'
import sprayPaintSound from '../assets/spraypaintsound.mp3'
import { useAudioReactive } from './useAudioReactive'
import './Components.css'

function AnimatedTitle({ 
  title = "Roast Battles", 
  className = "",
  // Sound customization props
  soundVolume = 0.3,
  soundPlaybackRate = 1.0,
  soundEnabled = true,
  soundStartTime = 1,
  soundEndTime = 5
}) {
  const canvasRef = useRef(null)
  const titleRef = useRef(null)
  const stageRef = useRef(null)
  const animationRef = useRef(null)
  const [textTraced, setTextTraced] = useState(false)
  const [font, setFont] = useState(null)
  const animationStarted = useRef(false)
  const [shouldPlaySound, setShouldPlaySound] = useState(false)
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const soundTimeoutRef = useRef(null)
  const audioRef = useRef(null)
  const [audioKey] = useState(() => Date.now() + Math.random())
  
  // Initialize audio delay based on whether we've animated before
  const [shouldDelayAudio, setShouldDelayAudio] = useState(() => {
    try {
      // If we've animated before, no delay needed
      return sessionStorage.getItem('titleAnimated') !== 'true'
    } catch {
      return true // Default to delay on first visit
    }
  })
  
  // Keep audio-reactive hook always active, but with delay only on first animation
  const audioData = useAudioReactive(true, shouldDelayAudio ? 1000 : 0)
  
  // Debug: Log when audioData changes
  useEffect(() => {
    if (audioData.scale !== 1) {
      console.log('[AnimatedTitle] 🎵 Audio pulse:', audioData.scale.toFixed(3))
    }
  }, [audioData.scale])
  
  // Debug: Log delay changes
  useEffect(() => {
    console.log('[AnimatedTitle] Audio delay setting:', shouldDelayAudio ? '1000ms (waiting for animation)' : '0ms (instant sync)')
  }, [shouldDelayAudio])
  
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
    // Check if we've animated before in this session
    const hasAnimated = sessionStorage.getItem('titleAnimated') === 'true'
    
    if (hasAnimated) {
      console.log('[AnimatedTitle] ⚡ Returning - run animation but with instant audio sync')
      setShouldDelayAudio(false) // No audio delay on return visits
    } else {
      console.log('[AnimatedTitle] 🎨 First visit - starting animation with delayed audio')
    }
    
    // Always reset these for the animation to run
    setTextTraced(false)
    animationStarted.current = false
    
    const loadFont = async () => {
      try {
        const fontPath = '/src/assets/fonts/snakehead-graffiti.regular.otf'
        const loadedFont = await opentype.load(fontPath)
        setFont(loadedFont)
        console.log('[AnimatedTitle] Font loaded:', loadedFont)
      } catch (error) {
        console.warn('[AnimatedTitle] Could not load custom font, using fallback:', error)
      }
    }
    loadFont()
  }, [])



  // Audio timing control
  useEffect(() => {
    setShouldPlaySound(true)
    
    const timeout = setTimeout(() => {
      setShouldPlaySound(false)
    }, 3300) // Sound duration in milliseconds

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

    if (shouldPlaySound && userHasInteracted) {
      audio.currentTime = 12; // Start at 12 seconds
      
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
  }, [shouldPlaySound, userHasInteracted, soundVolume, soundPlaybackRate]);

  useEffect(() => {
    let didRun = false
    const startAnimation = () => {
      if (didRun || animationStarted.current) return
      didRun = true
      animationStarted.current = true

      if (typeof window === 'undefined' || !canvasRef.current || !titleRef.current) {
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

      let actualFontSize = window.innerWidth * 0.15

      const canvas = canvasRef.current
      const titleElement = titleRef.current
      const titleRect = titleElement.getBoundingClientRect()
      
      // Add extra space around canvas to prevent clipping spray particles
      const extraSpace = 60 // Extra pixels on each side
      canvas.width = titleRect.width + (extraSpace * 2)
      canvas.height = titleRect.height + (extraSpace * 2)

      // Adjust stage position to account for extra space
      if (stage) {
        stage.x = extraSpace
        stage.y = extraSpace
      }

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
        if (!font) {
          return createFallbackPoints()
        }
        try {
          const testCanvas = document.createElement('canvas')
          const testCtx = testCanvas.getContext('2d')
          testCtx.font = `${actualFontSize}px "Snakehead Graffiti", sans-serif`
          const fontSize = actualFontSize
          const metrics = testCtx.measureText(title)
          const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
          const widthRatio = window.innerWidth / 1200
          const adjustment = metrics.actualBoundingBoxAscent * (widthRatio - 1) * 0.1
          const baselineOffset = (titleRect.height - textHeight) / 2 + metrics.actualBoundingBoxAscent + adjustment
          const path = font.getPath(title, 0, baselineOffset, fontSize)
          const tempCanvas = document.createElement('canvas')
          const ctx = tempCanvas.getContext('2d')
          tempCanvas.width = titleRect.width
          tempCanvas.height = titleRect.height
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          path.commands.forEach((cmd) => {
            switch (cmd.type) {
              case 'M': ctx.moveTo(cmd.x, cmd.y); break
              case 'L': ctx.lineTo(cmd.x, cmd.y); break
              case 'C': ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y); break
              case 'Q': ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y); break
              case 'Z': ctx.closePath(); break
            }
          })
          ctx.fill()
          const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
          const data = imageData.data
          const points = []
          let sampleRate
          if (fontSize <= 60) {
            sampleRate = 3
          } else if (fontSize <= 120) {
            sampleRate = 6
          } else {
            sampleRate = 12
          }
          
          for (let y = 0; y < tempCanvas.height; y += sampleRate) {
            for (let x = 0; x < tempCanvas.width; x += sampleRate) {
              const index = (y * tempCanvas.width + x) * 4
              const alpha = data[index + 3]
              if (alpha > 100) {
                let sprayCount
                if (fontSize <= 60) {
                  sprayCount = Math.floor(Math.random() * 3) + 2
                } else if (fontSize <= 120) {
                  sprayCount = Math.floor(Math.random() * 2) + 2
                } else {
                  sprayCount = Math.floor(Math.random() * 2) + 1
                }
                
                for (let i = 0; i < sprayCount; i++) {
                  const baseSprayRadius = Math.max(1, fontSize / 40)
                  const sprayRadius = Math.random() * baseSprayRadius + baseSprayRadius * 0.5
                  const angle = Math.random() * Math.PI * 2
                  points.push({
                    x: x + Math.cos(angle) * sprayRadius,
                    y: y + Math.sin(angle) * sprayRadius,
                    delay: (x / tempCanvas.width) * 2500 + Math.random() * 300
                  })
                }
              }
            }
          }
          tempCanvas.remove()
          return points
        } catch (error) {
          console.warn('[AnimatedTitle] Error processing font path:', error)
          return createFallbackPoints()
        }
      }

      const createFallbackPoints = () => {
        const points = []
        const textWidth = titleRect.width
        const textHeight = titleRect.height
        const baseSprayRadius = Math.max(1, actualFontSize / 40)
        
        let stepSize
        if (actualFontSize <= 60) {
          stepSize = 4
        } else if (actualFontSize <= 120) {
          stepSize = 8
        } else {
          stepSize = 15
        }
        
        for (let x = 0; x < textWidth; x += stepSize) {
          const testCanvas = document.createElement('canvas')
          const testCtx = testCanvas.getContext('2d')
          testCtx.font = `${actualFontSize}px "Snakehead Graffiti", sans-serif`
          const metrics = testCtx.measureText(title)
          const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
          const widthRatio = window.innerWidth / 1200
          const adjustment = metrics.actualBoundingBoxAscent * (widthRatio - 1) * 0.1
          const baseY = (titleRect.height - textHeight) / 2 + metrics.actualBoundingBoxAscent + adjustment
          const waveY = baseY + Math.sin(x / textWidth * Math.PI * 6) * (actualFontSize * 0.1)
          
          let sprayCount
          if (actualFontSize <= 60) {
            sprayCount = Math.floor(Math.random() * 3) + 3
          } else if (actualFontSize <= 120) {
            sprayCount = Math.floor(Math.random() * 2) + 3
          } else {
            sprayCount = Math.floor(Math.random() * 2) + 2
          }
          for (let i = 0; i < sprayCount; i++) {
            const sprayRadius = Math.random() * baseSprayRadius * 2 + baseSprayRadius
            const angle = Math.random() * Math.PI * 2
            points.push({
              x: x + Math.cos(angle) * sprayRadius,
              y: waveY + Math.sin(angle) * sprayRadius,
              delay: (x / textWidth) * 2500 + Math.random() * 200
            })
          }
        }
        return points
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

      setTimeout(() => {
        createTextTrace()
      }, 500)

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

    if (font) {
      startAnimation()
    } else {
      let fontCheckCount = 0
      const fontCheck = setInterval(() => {
        fontCheckCount++
        if (font || fontCheckCount > 30) {
          clearInterval(fontCheck)
          startAnimation()
        }
      }, 50)
      return () => clearInterval(fontCheck)
    }
  }, [font])



  return (
    <div className={`animated-title-container ${className}`} style={{ 
      position: 'relative', 
      display: 'inline-block',
      overflow: 'visible' // Allow effects to extend beyond container
    }}>
      <h1 
        ref={titleRef}
        className="game-title" 
        style={{ 
          position: 'relative',
          zIndex: 3,
          opacity: textTraced ? 1 : 0,
          transition: 'opacity 1s ease, transform 0.15s ease-out, filter 0.2s ease-out',
          visibility: textTraced ? 'visible' : 'hidden',
          transform: `scale(${audioData.scale})`,
          filter: `drop-shadow(0 0 ${6 + audioData.glow * 10}px rgba(0, 217, 255, ${audioData.glow * 0.4}))`,
          transformOrigin: 'center center',
          willChange: 'transform, filter'
        }}
      >
        {title}
      </h1>
      
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)', // Center the canvas
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />
      
      {!textTraced && (
        <h1 
          className="game-title" 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 1
          }}
          aria-hidden="true"
        >
          {title}
        </h1>
      )}
      
      <audio
        key={audioKey}
        ref={audioRef}
        src={sprayPaintSound}
        preload="auto"
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
