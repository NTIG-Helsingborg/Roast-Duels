import React, { useEffect, useRef, useState } from 'react'

function DrawingCanvas() {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  
  const colour = "#30b0cd"
  const amount = 40

  useEffect(() => {
    if (typeof window !== 'undefined' && window.createjs && canvasRef.current) {
      const canvas = canvasRef.current
      const stage = new window.createjs.Stage(canvas)
      stageRef.current = stage

      // Set canvas size to full screen
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Enable touch
      window.createjs.Touch.enable(stage)

      // Set ticker
      window.createjs.Ticker.framerate = 150
      window.createjs.Ticker.addEventListener("tick", stage)

      // Particle creation function
      const createParticle = (x, y, rad, alpha) => {
        const circle = new window.createjs.Shape()
        circle.graphics
          .beginFill(colour)
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
      const randomizeParticles = (stageX, stageY) => {
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

          createParticle(x, y, rad, alpha)
        }
      }

      // Mouse events
      stage.on("stagemousemove", (event) => {
        randomizeParticles(event.stageX, event.stageY)
      })

      stage.on("stagemousedown", () => {
        setIsMouseDown(true)
      })

      stage.on("stagemouseup", () => {
        setIsMouseDown(false)
      })

      // Handle window resize
      const handleResize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      window.addEventListener('resize', handleResize)

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
        window.createjs.Ticker.removeEventListener("tick", stage)
        stage.removeAllChildren()
        stage.removeAllEventListeners()
      }
    }
  }, [isMouseDown])

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'auto'
      }}
    />
  )
}

export default DrawingCanvas