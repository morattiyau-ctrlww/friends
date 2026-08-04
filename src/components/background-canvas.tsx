"use client"

import { useEffect, useRef } from "react"

type Star = {
  x: number
  y: number
  z: number
  size: number
  baseAlpha: number
  twinkleSpeed: number
  phase: number
  hue: number
}

type Nebula = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  hue: number
  alpha: number
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

    let stars: Star[] = []
    let nebulae: Nebula[] = []

    const init = () => {
      const count = Math.min(220, Math.max(90, Math.floor((width * height) / 6500)))
      stars = Array.from({ length: count }, () => {
        const z = Math.random() * 0.9 + 0.1
        const roll = Math.random()
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          size: Math.random() * 1.8 + 0.4,
          baseAlpha: Math.random() * 0.6 + 0.35,
          twinkleSpeed: Math.random() * 1.5 + 0.4,
          phase: Math.random() * Math.PI * 2,
          hue: roll < 0.68 ? 0 : roll < 0.84 ? 282 : 195,
        }
      })
      nebulae = [
        { x: width * 0.2, y: height * 0.15, r: 340, vx: 0.14, vy: 0.1, hue: 282, alpha: 0.13 },
        { x: width * 0.85, y: height * 0.3, r: 380, vx: -0.11, vy: 0.13, hue: 195, alpha: 0.1 },
        { x: width * 0.5, y: height * 0.9, r: 360, vx: 0.09, vy: -0.09, hue: 320, alpha: 0.09 },
      ]
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      init()
    }
    resize()

    const draw = (t: number) => {
      const time = t / 1000
      ctx.clearRect(0, 0, width, height)

      for (const nebula of nebulae) {
        nebula.x += nebula.vx + (mouse.x - nebula.x) * 0.0003
        nebula.y += nebula.vy + (mouse.y - nebula.y) * 0.0003
        const gradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.r
        )
        gradient.addColorStop(0, `hsla(${nebula.hue} 80% 62% / ${nebula.alpha})`)
        gradient.addColorStop(1, `hsla(${nebula.hue} 80% 62% / 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(nebula.x, nebula.y, nebula.r, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const star of stars) {
        star.x += star.z * 0.12 + (mouse.x - star.x) * 0.00008 * star.z
        star.y += star.z * 0.06 + (mouse.y - star.y) * 0.00008 * star.z
        if (star.x < -4) star.x = width + 4
        else if (star.x > width + 4) star.x = -4
        if (star.y < -4) star.y = height + 4
        else if (star.y > height + 4) star.y = -4
      }

      ctx.lineWidth = 1
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i]
          const b = stars[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const limit = Math.min(160, 130 * ((a.z + b.z) / 2))
          if (dist < limit) {
            const alpha = (1 - dist / limit) * 0.16
            ctx.strokeStyle = `hsla(278 80% 72% / ${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      for (const star of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(time * star.twinkleSpeed + star.phase)
        const alpha = star.baseAlpha * twinkle
        const fill =
          star.hue === 0
            ? `hsla(0 0% 100% / ${alpha})`
            : `hsla(${star.hue} 85% 70% / ${alpha})`
        ctx.fillStyle = fill
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
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

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointerMove)
    }
  }, [])

  return (
    <canvas
      id="space-bg"
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  )
}
