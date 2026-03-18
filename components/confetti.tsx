"use client"

import { useEffect, useRef } from "react"

interface ConfettiProps {
  active: boolean
}

export function Confetti({ active }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      color: string
      size: number
    }> = []

    const colors = ["#06b6d4", "#0ea5e9", "#06d6ff", "#00ffff", "#22d3ee"]
    const confettiCount = 60

    // Create confetti particles
    for (let i = 0; i < confettiCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2
      })
    }

    let animationFrameId: number

    const animate = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        p.y += p.vy
        p.x += p.vx
        p.vy += 0.1 // Gravity
        p.life -= 0.01

        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.size, p.size)
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  )
}
