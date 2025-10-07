import React, { useEffect, useRef, useState } from 'react'
import opentype from 'opentype.js'
import './Components.css'

function AnimatedTitle({ title = "Roast Battles", className = "" }) {
  const canvasRef = useRef(null)
  const titleRef = useRef(null)
  const stageRef = useRef(null)
  const animationRef = useRef(null)
  const [textTraced, setTextTraced] = useState(false)
  const [font, setFont] = useState(null)
  const animationStarted = useRef(false)
  
  // Use the same gradient colors as the H1
  const traceColors = ["#00d9ff", "#0dc6e7", "#26c9e8", "#1fb5d1"]

  // Load the custom font
  useEffect(() => {
    // Reset state on mount
    setTextTraced(false)
    animationStarted.current = false

    // No failsafe: animation and H1 will always replay after restart
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

  useEffect(() => {
    // Only run once per mount
    let didRun = false
    const startAnimation = () => {
      console.log('[AnimatedTitle] Attempting to start animation...')
      if (didRun || animationStarted.current) {
        console.log('[AnimatedTitle] Animation already started, skipping.')
        return
      }
      didRun = true
      animationStarted.current = true

      // If CreateJS is missing, fallback to showing H1 only
      if (typeof window === 'undefined' || !canvasRef.current || !titleRef.current) {
        setTextTraced(true)
        console.log('[AnimatedTitle] Fallback: window/canvas/titleRef missing, showing H1 only.')
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

      const canvas = canvasRef.current
      const titleElement = titleRef.current
      const titleRect = titleElement.getBoundingClientRect()
      canvas.width = titleRect.width
      canvas.height = titleRect.height

      let actualFontSize = window.innerWidth * 0.15
      if (window.innerWidth <= 768) actualFontSize = 48
      if (window.innerWidth <= 480) actualFontSize = 40

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
          console.log('[AnimatedTitle] Using fallback points, font not loaded.')
          return createFallbackPoints()
        }
        try {
          const testCanvas = document.createElement('canvas')
          const testCtx = testCanvas.getContext('2d')
          testCtx.font = `${actualFontSize}px "Snakehead Graffiti", sans-serif`
          const fontSize = actualFontSize
          const baselineOffset = titleRect.height * 0.75 + 30
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
          const sampleRate = 8
          for (let y = 0; y < tempCanvas.height; y += sampleRate) {
            for (let x = 0; x < tempCanvas.width; x += sampleRate) {
              const index = (y * tempCanvas.width + x) * 4
              const alpha = data[index + 3]
              if (alpha > 100) {
                const sprayCount = Math.floor(Math.random() * 2) + 1
                for (let i = 0; i < sprayCount; i++) {
                  const sprayRadius = Math.random() * 4 + 1
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
          console.log('[AnimatedTitle] Sampled', points.length, 'spray points.')
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
        for (let x = 0; x < textWidth; x += 10) {
          const baseY = textHeight * 0.75 + 30
          const waveY = baseY + Math.sin(x / textWidth * Math.PI * 6) * 15
          const sprayCount = 4
          for (let i = 0; i < sprayCount; i++) {
            const sprayRadius = Math.random() * 6 + 2
            const angle = Math.random() * Math.PI * 2
            points.push({
              x: x + Math.cos(angle) * sprayRadius,
              y: waveY + Math.sin(angle) * sprayRadius,
              delay: (x / textWidth) * 2500 + Math.random() * 200
            })
          }
        }
        console.log('[AnimatedTitle] Fallback points:', points.length)
        return points
      }

      const createTextTrace = () => {
        const points = getTextPathPoints()
        if (!stage) {
          // If CreateJS is missing, skip spray, just show H1 after delay
          setTimeout(() => {
            setTextTraced(true)
            console.log('[AnimatedTitle] Fallback: No CreateJS, showing H1 only.')
          }, 1000)
          return
        }
        points.forEach((point) => {
          setTimeout(() => {
            const color = traceColors[Math.floor(Math.random() * traceColors.length)]
            const size = Math.random() * 4 + 3
            const alpha = Math.random() * 0.4 + 0.6
            createParticle(point.x, point.y, size, alpha, color)
          }, point.delay)
        })
        const maxDelay = Math.max(...points.map(p => p.delay))
        setTimeout(() => {
          setTextTraced(true)
          console.log('[AnimatedTitle] Animation complete, H1 should fade in.')
        }, maxDelay + 1000)
      }

      setTimeout(() => {
        createTextTrace()
      }, 500)

      // Cleanup
      return () => {
        if (animationRef.current) clearTimeout(animationRef.current)
        if (stage) {
          window.createjs.Ticker.removeEventListener("tick", stage)
          stage.removeAllChildren()
          stage.removeAllEventListeners()
        }
        // Do NOT reset animationStarted.current here
      }
    }

    // Wait for font to load, but start after max 1.5 seconds regardless
    if (font) {
      startAnimation()
    } else {
      let fontCheckCount = 0
      const fontCheck = setInterval(() => {
        fontCheckCount++
        if (font || fontCheckCount > 30) { // Max 1.5 seconds wait (30 * 50ms)
          clearInterval(fontCheck)
          startAnimation()
        }
      }, 50)
      // Cleanup polling
      return () => clearInterval(fontCheck)
    }
  }, [font]) // Add font as dependency so animation restarts when font loads



  return (
    <div className={`animated-title-container ${className}`} style={{ position: 'relative', display: 'block' }}>
      {/* Hidden title for positioning reference - completely invisible during tracing */}
      <h1 
        ref={titleRef}
        className="game-title" 
        style={{ 
          position: 'relative',
          zIndex: 3,
          opacity: textTraced ? 1 : 0, // Completely hidden until traced
          transition: 'opacity 1s ease',
          visibility: textTraced ? 'visible' : 'hidden' // Also hide from layout
        }}
      >
        {title}
      </h1>
      
      {/* Canvas for text tracing particles */}
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none' // Don't block clicks
        }}
      />
      
      {/* Invisible placeholder to maintain layout during tracing */}
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
    </div>
  )
}

export default AnimatedTitle
