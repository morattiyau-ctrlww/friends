"use client"

import { useEffect, useRef } from "react"

type Orb = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  hue: number
  alpha: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = window.innerWidth
    let height = window.innerHeight
    let raf = 0
    const mouse = { x: width / 2, y: height / 2 }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const orbs: Orb[] = [
      { x: width * 0.18, y: height * 0.15, r: 280, vx: 0.16, vy: 0.12, hue: 262, alpha: 0.17 },
      { x: width * 0.86, y: height * 0.28, r: 320, vx: -0.12, vy: 0.16, hue: 238, alpha: 0.13 },
      { x: width * 0.5, y: height * 0.9, r: 300, vx: 0.1, vy: -0.1, hue: 318, alpha: 0.1 },
    ]

    const particles: Particle[] = Array.from({ length: 72 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (const orb of orbs) {
        orb.x += orb.vx + (mouse.x - orb.x) * 0.00035
        orb.y += orb.vy + (mouse.y - orb.y) * 0.00035
        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.r
        )
        gradient.addColorStop(0, `hsla(${orb.hue} 80% 62% / ${orb.alpha})`)
        gradient.addColorStop(1, `hsla(${orb.hue} 80% 62% / 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = width
        else if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        else if (p.y > height) p.y = 0
      }

      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < 110 * 110) {
            const alpha = (1 - Math.sqrt(d2) / 110) * 0.12
            ctx.strokeStyle = `hsla(262 80% 72% / ${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      ctx.fillStyle = "hsla(262 80% 76% / 0.5)"
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!reduced) raf = requestAnimationFrame(draw)
    }

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", onPointerMove, { passive: true })

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointerMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  )
}
