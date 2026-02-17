'use client'

import React, { useRef, useEffect, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */

interface Surface {
  top: number
  left: number
  right: number
  bottom: number
}

interface SplashParticle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  age: number
  maxAge: number
  hue: number
}

interface Drip {
  x: number
  phase: 'form' | 'stretch' | 'detach' | 'surface' | 'edge-drip' | 'edge-fall' | 'fade'
  age: number

  // Formation
  formDur: number
  blobR: number
  maxBlobR: number

  // Strand from top
  strandLen: number
  strandMaxLen: number
  strandThickness: number

  // Free-falling droplet
  dropY: number
  dropVy: number
  dropR: number

  // Surface flow
  surfaceY: number
  surfaceLeft: number
  surfaceRight: number
  flowX: number
  flowVx: number
  flowBlobR: number
  flowTrail: { x: number; r: number; opacity: number }[]

  // Edge drip (hanging off an element edge)
  edgeX: number
  edgeY: number
  edgeStrandLen: number
  edgeStrandMax: number
  edgeBlobR: number

  // Shared
  wobblePhase: number
  wobbleAmp: number
  opacity: number
  hue: number
  hitCount: number
}

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

const GRAVITY = 380
const MAX_DRIPS = 10
const SPAWN_MIN = 0.9
const SPAWN_MAX = 2.4
const SURFACE_FLOW_SPEED = 35
const SURFACE_FRICTION = 0.92
const EDGE_STRAND_GROW = 40
const MAX_HITS = 3

function createDrip(canvasW: number): Drip {
  const x = 30 + Math.random() * (canvasW - 60)
  return {
    x,
    phase: 'form',
    age: 0,
    formDur: 0.5 + Math.random() * 0.7,
    blobR: 0,
    maxBlobR: 5 + Math.random() * 6,
    strandLen: 0,
    strandMaxLen: 50 + Math.random() * 80,
    strandThickness: 2 + Math.random() * 2.5,
    dropY: 0,
    dropVy: 0,
    dropR: 4 + Math.random() * 4,
    surfaceY: 0,
    surfaceLeft: 0,
    surfaceRight: 0,
    flowX: 0,
    flowVx: 0,
    flowBlobR: 0,
    flowTrail: [],
    edgeX: 0,
    edgeY: 0,
    edgeStrandLen: 0,
    edgeStrandMax: 25 + Math.random() * 40,
    edgeBlobR: 0,
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleAmp: 0.4 + Math.random() * 0.6,
    opacity: 0.75 + Math.random() * 0.25,
    hue: 36 + Math.random() * 10,
    hitCount: 0,
  }
}

function findHitSurface(x: number, y: number, vy: number, surfaces: Surface[], dt: number): Surface | null {
  const nextY = y + vy * dt
  for (const s of surfaces) {
    if (x >= s.left - 4 && x <= s.right + 4 && y <= s.top && nextY >= s.top) {
      return s
    }
  }
  return null
}

/* ═══════════════════════════════════════════════════════════
   Rendering helpers
   ═══════════════════════════════════════════════════════════ */

function cheeseColors(hue: number, opacity: number) {
  return {
    base: `hsla(${hue}, 72%, 50%, ${opacity})`,
    light: `hsla(${hue + 6}, 80%, 65%, ${opacity})`,
    tip: `hsla(${hue - 4}, 65%, 40%, ${opacity * 0.8})`,
    spec: `hsla(48, 90%, 85%, ${opacity * 0.55})`,
    glow: `hsla(${hue}, 70%, 55%, ${opacity * 0.2})`,
  }
}

function drawBlob(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, colors: ReturnType<typeof cheeseColors>) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry))
  grad.addColorStop(0, colors.light)
  grad.addColorStop(0.6, colors.base)
  grad.addColorStop(1, colors.tip)
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(x - rx * 0.22, y - ry * 0.3, rx * 0.22, ry * 0.16, -0.3, 0, Math.PI * 2)
  ctx.fillStyle = colors.spec
  ctx.fill()
}

function drawStrand(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  thickTop: number, thickBot: number,
  wobble: number,
  colors: ReturnType<typeof cheeseColors>,
) {
  const len = y2 - y1
  const cp1y = y1 + len * 0.35
  const cp2y = y1 + len * 0.7

  ctx.beginPath()
  ctx.moveTo(x1 - thickTop / 2, y1)
  ctx.bezierCurveTo(
    x1 - thickTop / 2 + wobble * 0.3, cp1y,
    x2 - thickBot / 2 + wobble * 0.5, cp2y,
    x2, y2,
  )
  ctx.bezierCurveTo(
    x2 + thickBot / 2 + wobble * 0.5, cp2y,
    x1 + thickTop / 2 + wobble * 0.3, cp1y,
    x1 + thickTop / 2, y1,
  )
  ctx.closePath()

  const g = ctx.createLinearGradient(0, y1, 0, y2)
  g.addColorStop(0, colors.base)
  g.addColorStop(0.5, colors.light)
  g.addColorStop(1, colors.tip)
  ctx.fillStyle = g
  ctx.fill()
}

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */

interface CheesePhysicsProps {
  active: boolean
  containerRef?: React.RefObject<HTMLDivElement | null>
}

const CheesePhysics: React.FC<CheesePhysicsProps> = ({ active, containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dripsRef = useRef<Drip[]>([])
  const splashesRef = useRef<SplashParticle[]>([])
  const surfacesRef = useRef<Surface[]>([])
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef(0)
  const surfaceTickRef = useRef(0)

  const querySurfaces = useCallback(() => {
    const container = containerRef?.current
    if (!container) return
    const cRect = container.getBoundingClientRect()
    const els = container.querySelectorAll('[data-cheese-surface]')
    const surfs: Surface[] = []
    els.forEach((el) => {
      const r = el.getBoundingClientRect()
      surfs.push({
        top: r.top - cRect.top,
        left: r.left - cRect.left,
        right: r.right - cRect.left,
        bottom: r.bottom - cRect.top,
      })
    })
    surfs.sort((a, b) => a.top - b.top)
    surfacesRef.current = surfs
  }, [containerRef])

  const resize = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    c.width = c.offsetWidth * dpr
    c.height = c.offsetHeight * dpr
    const ctx = c.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    querySurfaces()
  }, [querySurfaces])

  useEffect(() => {
    if (!active) {
      dripsRef.current = []
      splashesRef.current = []
      surfacesRef.current = []
      lastTimeRef.current = 0
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', querySurfaces, { passive: true })
    lastTimeRef.current = performance.now()
    surfaceTickRef.current = 0

    let spawnTimer = 0
    let nextSpawn = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN)

    const loop = (now: number) => {
      const c = canvasRef.current
      if (!c) return
      const ctx = c.getContext('2d')
      if (!ctx) return

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      const w = c.offsetWidth
      const h = c.offsetHeight

      // Re-query surfaces periodically
      surfaceTickRef.current += dt
      if (surfaceTickRef.current > 2) {
        querySurfaces()
        surfaceTickRef.current = 0
      }

      ctx.clearRect(0, 0, w, h)

      const surfaces = surfacesRef.current

      // Spawn
      spawnTimer += dt
      if (spawnTimer >= nextSpawn && dripsRef.current.length < MAX_DRIPS) {
        dripsRef.current.push(createDrip(w))
        spawnTimer = 0
        nextSpawn = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN)
      }

      // Update & render splashes
      const aliveSplashes: SplashParticle[] = []
      for (const sp of splashesRef.current) {
        sp.age += dt
        if (sp.age > sp.maxAge) continue
        sp.x += sp.vx * dt
        sp.vy += GRAVITY * 0.5 * dt
        sp.y += sp.vy * dt
        const t = sp.age / sp.maxAge
        const alpha = (1 - t) * 0.7
        const c2 = cheeseColors(sp.hue, alpha)
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, sp.r * (1 - t * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = c2.base
        ctx.fill()
        aliveSplashes.push(sp)
      }
      splashesRef.current = aliveSplashes

      // Update & render drips
      const alive: Drip[] = []

      for (const d of dripsRef.current) {
        d.age += dt
        d.wobblePhase += dt * 3
        const wobX = Math.sin(d.wobblePhase) * d.wobbleAmp
        const colors = cheeseColors(d.hue, d.opacity)

        switch (d.phase) {
          /* ── FORM: blob grows at top ── */
          case 'form': {
            const t = Math.min(d.age / d.formDur, 1)
            d.blobR = d.maxBlobR * t
            if (t >= 1) { d.phase = 'stretch'; d.age = 0 }
            drawBlob(ctx, d.x + wobX, d.blobR, d.blobR * 0.9, d.blobR, colors)
            break
          }

          /* ── STRETCH: strand extends downward ── */
          case 'stretch': {
            d.strandLen += dt * (45 + d.strandLen * 0.7)
            d.blobR = d.maxBlobR * (1 - (d.strandLen / d.strandMaxLen) * 0.3)
            if (d.strandLen >= d.strandMaxLen) {
              d.phase = 'detach'
              d.dropY = d.strandLen + d.blobR
              d.dropVy = 50
              d.age = 0
            }
            // Blob at top
            drawBlob(ctx, d.x + wobX, d.blobR, d.blobR * 0.9, d.blobR, colors)
            // Strand
            const endY = d.blobR + d.strandLen
            drawStrand(ctx, d.x + wobX, d.blobR, d.x + wobX * 1.3, endY, d.strandThickness, d.strandThickness * 0.4, wobX, colors)
            // Tip droplet
            drawBlob(ctx, d.x + wobX * 1.3, endY, d.dropR * 0.8, d.dropR, colors)
            break
          }

          /* ── DETACH / EDGE-FALL: droplet falling freely ── */
          case 'detach':
          case 'edge-fall': {
            d.dropVy += GRAVITY * dt
            d.dropY += d.dropVy * dt

            // Collision check
            const hit = findHitSurface(d.x + wobX, d.dropY, d.dropVy, surfaces, dt)
            if (hit && d.hitCount < MAX_HITS) {
              d.hitCount++
              d.phase = 'surface'
              d.surfaceY = hit.top
              d.surfaceLeft = hit.left
              d.surfaceRight = hit.right
              d.flowX = d.x + wobX
              d.flowBlobR = d.dropR * 1.3
              d.flowTrail = []
              const distL = d.flowX - hit.left
              const distR = hit.right - d.flowX
              d.flowVx = (distL < distR ? -1 : 1) * SURFACE_FLOW_SPEED * (0.8 + Math.random() * 0.4)
              d.age = 0

              // Spawn splash particles
              const splashCount = 3 + Math.floor(Math.random() * 4)
              for (let s = 0; s < splashCount; s++) {
                splashesRef.current.push({
                  x: d.flowX,
                  y: hit.top,
                  vx: (Math.random() - 0.5) * 80,
                  vy: -(20 + Math.random() * 50),
                  r: 1.5 + Math.random() * 2,
                  age: 0,
                  maxAge: 0.4 + Math.random() * 0.4,
                  hue: d.hue,
                })
              }
              break
            }

            if (d.dropY > h + 20) { d.phase = 'fade'; d.age = 0; break }

            // Shrinking residual strand at top (only for initial detach)
            if (d.phase === 'detach' && d.strandLen > 0) {
              d.strandLen = Math.max(0, d.strandLen - dt * 100)
              if (d.strandLen > 1) {
                ctx.beginPath()
                ctx.moveTo(d.x, d.blobR * 0.5)
                ctx.lineTo(d.x, d.blobR * 0.5 + d.strandLen)
                ctx.strokeStyle = colors.tip
                ctx.lineWidth = d.strandThickness * 0.25
                ctx.lineCap = 'round'
                ctx.stroke()
              }
            }

            // Falling droplet with velocity stretch
            const stretch = 1 + Math.min(d.dropVy / 500, 0.5)
            const squeeze = 1 / Math.sqrt(stretch)
            ctx.save()
            ctx.translate(d.x + wobX, d.dropY)
            ctx.scale(squeeze, stretch)
            drawBlob(ctx, 0, 0, d.dropR, d.dropR, colors)
            ctx.restore()
            break
          }

          /* ── SURFACE: flowing across an element ── */
          case 'surface': {
            d.flowX += d.flowVx * dt
            d.flowVx *= (1 - (1 - SURFACE_FRICTION) * dt * 60)
            d.flowBlobR *= (1 - dt * 0.3)

            // Trail
            if (d.age > 0.05) {
              d.flowTrail.push({ x: d.flowX, r: d.flowBlobR * 0.6, opacity: d.opacity * 0.5 })
              if (d.flowTrail.length > 20) d.flowTrail.shift()
            }

            // Draw trail
            for (const t of d.flowTrail) {
              t.opacity *= (1 - dt * 2)
              if (t.opacity < 0.05) continue
              const tc = cheeseColors(d.hue, t.opacity)
              ctx.beginPath()
              ctx.ellipse(t.x, d.surfaceY, t.r, t.r * 0.4, 0, 0, Math.PI * 2)
              ctx.fillStyle = tc.base
              ctx.fill()
            }

            // Draw flowing blob (flattened on surface)
            drawBlob(ctx, d.flowX, d.surfaceY, d.flowBlobR, d.flowBlobR * 0.5, colors)

            // Check if reached edge
            const atLeftEdge = d.flowX <= d.surfaceLeft + 2
            const atRightEdge = d.flowX >= d.surfaceRight - 2
            if (atLeftEdge || atRightEdge) {
              d.phase = 'edge-drip'
              d.edgeX = atLeftEdge ? d.surfaceLeft : d.surfaceRight
              d.edgeY = d.surfaceY
              d.edgeStrandLen = 0
              d.edgeStrandMax = 20 + Math.random() * 35
              d.edgeBlobR = d.flowBlobR * 0.7
              d.age = 0
            }

            // Timeout safety
            if (d.age > 6) { d.phase = 'fade'; d.age = 0 }
            break
          }

          /* ── EDGE-DRIP: hanging off element edge ── */
          case 'edge-drip': {
            d.edgeStrandLen += dt * EDGE_STRAND_GROW
            d.edgeBlobR += dt * 1.5

            // Draw residue blob on edge
            const edgeColors = cheeseColors(d.hue, d.opacity * 0.7)
            ctx.beginPath()
            ctx.ellipse(d.edgeX, d.edgeY, d.edgeBlobR * 0.8, d.edgeBlobR * 0.5, 0, 0, Math.PI * 2)
            ctx.fillStyle = edgeColors.base
            ctx.fill()

            // Draw hanging strand
            const hangY = d.edgeY + d.edgeStrandLen
            drawStrand(ctx, d.edgeX, d.edgeY, d.edgeX + wobX * 0.5, hangY, d.strandThickness * 0.6, d.strandThickness * 0.2, wobX * 0.3, colors)

            // Droplet at strand tip
            drawBlob(ctx, d.edgeX + wobX * 0.5, hangY, d.edgeBlobR * 0.7, d.edgeBlobR * 0.9, colors)

            if (d.edgeStrandLen >= d.edgeStrandMax) {
              d.phase = 'edge-fall'
              d.x = d.edgeX
              d.dropY = hangY
              d.dropVy = 30
              d.dropR = d.edgeBlobR * 0.7
              d.age = 0
              d.strandLen = 0
            }
            break
          }

          /* ── FADE ── */
          case 'fade': {
            d.opacity -= dt * 2.5
            break
          }
        }

        if (d.phase === 'fade' && d.opacity <= 0) continue
        alive.push(d)
      }

      dripsRef.current = alive
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', querySurfaces)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, resize, querySurfaces])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%', zIndex: 15 }}
    />
  )
}

export default CheesePhysics
