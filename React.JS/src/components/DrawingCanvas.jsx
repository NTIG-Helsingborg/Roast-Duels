import React, { useEffect, useRef, useState } from 'react'
import sprayPaintSound from '../assets/spraypaintsound.mp3'

function DrawingCanvas({ startDelay = 0, muted = false }) {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const animationRef = useRef(null)
  const [shouldStartDrawing, setShouldStartDrawing] = useState(false)
  const audioRef = useRef(null)
  const audioTimerRef = useRef(null)
  
  const amount = 40

  const colors = [
    "#30b0cd", "#ff6b6b", "#ff006e", "#ffffff"
  ]

  const shapes = {
    star: [
      { x: 0.5, y: 0 },
      { x: 0.6, y: 0.35 },
      { x: 1, y: 0.4 },
      { x: 0.7, y: 0.65 },
      { x: 0.8, y: 1 },
      { x: 0.5, y: 0.8 },
      { x: 0.2, y: 1 },
      { x: 0.3, y: 0.65 },
      { x: 0, y: 0.4 },
      { x: 0.4, y: 0.35 },
    ],
    heart: [
      { x: 0.5, y: 0.2 },
      { x: 0.35, y: 0 },
      { x: 0.15, y: 0 },
      { x: 0, y: 0.15 },
      { x: 0, y: 0.35 },
      { x: 0.15, y: 0.5 },
      { x: 0.5, y: 1 },
      { x: 0.85, y: 0.5 },
      { x: 1, y: 0.35 },
      { x: 1, y: 0.15 },
      { x: 0.85, y: 0 },
      { x: 0.65, y: 0 },
    ],
  }

  useEffect(() => {
    if (startDelay > 0) {
      const timer = setTimeout(() => {
        setShouldStartDrawing(true)
      }, startDelay)

      return () => clearTimeout(timer)
    } else {
      setShouldStartDrawing(true)
    }
  }, [startDelay])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.createjs && canvasRef.current) {
      const canvas = canvasRef.current
      const stage = new window.createjs.Stage(canvas)
      stageRef.current = stage

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      window.createjs.Touch.enable(stage)

      window.createjs.Ticker.framerate = 150
      window.createjs.Ticker.addEventListener("tick", stage)

      const createParticle = (x, y, rad, alpha, color) => {
        const circle = new window.createjs.Shape()
        circle.graphics
          .beginFill(color)
          .drawCircle(0, 0, rad)
        circle.x = x
        circle.y = y
        circle.alpha = alpha
        
        stage.addChild(circle)
        
        setTimeout(() => {
          window.createjs.Tween.get(circle)
            .to({alpha: 0}, 5000)
            .call(() => {
              stage.removeChild(circle)
            })
        }, 1000)
      }

      // Create particles only when mouse is down
      const randomizeParticles = (stageX, stageY, color = colors[0]) => {
        if (!isMouseDown) return

        for (let i = 0; i < amount; i++) {
          const x = stageX + (Math.random() - 0.5) * Math.random() * 110
          const y = stageY + (Math.random() - 0.5) * Math.random() * 110
          const alpha = Math.random()

          let rad
          if (x > stageX + 30 || x < stageX - 30 || y > stageY + 30 || y < stageY - 30) {
            rad = Math.random() * 4
          } else if (x > stageX + 35 || x < stageX - 35 || y > stageY + 35 || y < stageY - 35) {
            rad = Math.random() * 2
          } else {
            rad = Math.random() * 10
          }

          createParticle(x, y, rad, alpha, color)
        }
      }

      const createAutonomousParticles = (stageX, stageY, color) => {
        for (let i = 0; i < amount; i++) {
          const x = stageX + (Math.random() - 0.5) * Math.random() * 110
          const y = stageY + (Math.random() - 0.5) * Math.random() * 110
          const alpha = Math.random()

          let rad
          if (x > stageX + 30 || x < stageX - 30 || y > stageY + 30 || y < stageY - 30) {
            rad = Math.random() * 4
          } else if (x > stageX + 35 || x < stageX - 35 || y > stageY + 35 || y < stageY - 35) {
            rad = Math.random() * 2
          } else {
            rad = Math.random() * 10
          }

          createParticle(x, y, rad, alpha, color)
        }
      }

      const lerp = (start, end, t) => start + (end - start) * t

      const drawShape = async (shapeName, centerX, centerY, size, rotation, color) => {
        const shapePoints = shapes[shapeName]
        if (!shapePoints) return

        const OUTLINE_DELAY = 15
        const FILL_DELAY = 50
        const FILL_STEPS = 2
        
        const baselinePoints = 10
        const OUTLINE_STEPS = Math.max(5, Math.floor(10 * (baselinePoints / shapePoints.length)))

        const actualPoints = shapePoints.map(point => {
          const rad = rotation * Math.PI / 180
          const relX = (point.x - 0.5) * size
          const relY = (point.y - 0.5) * size
          
          const rotatedX = relX * Math.cos(rad) - relY * Math.sin(rad)
          const rotatedY = relX * Math.sin(rad) + relY * Math.cos(rad)
          
          return {
            x: centerX + rotatedX,
            y: centerY + rotatedY
          }
        })

        if (audioRef.current && !muted) {
          const audio = audioRef.current
          const AUDIO_START_TIME = 11.5
          const AUDIO_END_CUTOFF = 20.1
          
          audio.currentTime = AUDIO_START_TIME
          audio.volume = 0.2
          audio.playbackRate = 1.0
          
          const handleTimeUpdate = () => {
            if (audio.duration && audio.currentTime >= audio.duration - AUDIO_END_CUTOFF) {
              audio.pause()
              audio.removeEventListener('timeupdate', handleTimeUpdate)
            }
          }
          
          audio.addEventListener('timeupdate', handleTimeUpdate)
          audio.play().catch(err => console.log('Audio play failed:', err))
        }

        for (let i = 0; i < actualPoints.length; i++) {
          const start = actualPoints[i]
          const end = actualPoints[(i + 1) % actualPoints.length]
          
          for (let t = 0; t <= 1; t += 1 / OUTLINE_STEPS) {
            const x = lerp(start.x, end.x, t)
            const y = lerp(start.y, end.y, t)
            
            createAutonomousParticles(x, y, color)
            
            if (OUTLINE_DELAY > 0) {
              await new Promise(resolve => setTimeout(resolve, OUTLINE_DELAY))
            }
          }
        }

        for (let i = 0; i < FILL_STEPS; i++) {
          const minX = Math.min(...actualPoints.map(p => p.x))
          const maxX = Math.max(...actualPoints.map(p => p.x))
          const minY = Math.min(...actualPoints.map(p => p.y))
          const maxY = Math.max(...actualPoints.map(p => p.y))
          
          for (let j = 0; j < 5; j++) {
            const x = minX + Math.random() * (maxX - minX)
            const y = minY + Math.random() * (maxY - minY)
            
            for (let k = 0; k < 10; k++) {
              const offsetX = x + (Math.random() - 0.5) * 30
              const offsetY = y + (Math.random() - 0.5) * 30
              const alpha = Math.random() * 0.6
              const rad = Math.random() * 3
              
              createParticle(offsetX, offsetY, rad, alpha, color)
            }
          }
          
          if (FILL_DELAY > 0) {
            await new Promise(resolve => setTimeout(resolve, FILL_DELAY))
          }
        }
      }

      const startAutonomousDrawing = async () => {
        const PAUSE_BETWEEN_SHAPES = 3000
        const PAUSE_AFTER_DRAWING = 5000

        while (!shouldStartDrawing && animationRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        const shapeNames = Object.keys(shapes)
        
        const isInTitleArea = (x, y, size) => {
          const titleTop = 0
          const titleBottom = canvas.height * 0.35
          const titleLeft = canvas.width * 0.2
          const titleRight = canvas.width * 0.8
          
          const shapeLeft = x - size / 2
          const shapeRight = x + size / 2
          const shapeTop = y - size / 2
          const shapeBottom = y + size / 2
          
          return (
            shapeBottom > titleTop && 
            shapeTop < titleBottom && 
            shapeRight > titleLeft && 
            shapeLeft < titleRight
          )
        }
        
        while (animationRef.current) {
          const shapeName = shapeNames[Math.floor(Math.random() * shapeNames.length)]
          
          const size = 180 + Math.random() * 100
          
          let centerX, centerY
          let attempts = 0
          do {
            centerX = 200 + Math.random() * (canvas.width - 400)
            centerY = 200 + Math.random() * (canvas.height - 400)
            attempts++
          } while (isInTitleArea(centerX, centerY, size) && attempts < 10)
          
          if (isInTitleArea(centerX, centerY, size)) {
            centerY = canvas.height * 0.6 + Math.random() * (canvas.height * 0.3)
          }
          
          const rotation = Math.random() * 360
          
          const color = colors[Math.floor(Math.random() * colors.length)]
          
          await drawShape(shapeName, centerX, centerY, size, rotation, color)
          
          await new Promise(resolve => setTimeout(resolve, PAUSE_AFTER_DRAWING))
          
          await new Promise(resolve => setTimeout(resolve, PAUSE_BETWEEN_SHAPES))
        }
      }

      animationRef.current = true
      startAutonomousDrawing()

      stage.on("stagemousemove", (event) => {
        randomizeParticles(event.stageX, event.stageY, colors[0])
      })

      stage.on("stagemousedown", () => {
        setIsMouseDown(true)
      })

      stage.on("stagemouseup", () => {
        setIsMouseDown(false)
      })

      const handleResize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      window.addEventListener('resize', handleResize)

      return () => {
        animationRef.current = false
        window.removeEventListener('resize', handleResize)
        window.createjs.Ticker.removeEventListener("tick", stage)
        stage.removeAllChildren()
        stage.removeAllEventListeners()
      }
    }
  }, [isMouseDown, shouldStartDrawing])

  return (
    <>
      <canvas 
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'auto'
        }}
      />
      <audio
        ref={audioRef}
        src={sprayPaintSound}
        preload="auto"
      />
    </>
  )
}

export default DrawingCanvas