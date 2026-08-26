import { VIEW_H, VIEW_W } from './const'
import type { Camera } from './camera'
import type { Particles } from './particles'
import type { Player } from './player'
import type { Platform, Prop, World } from './world'

const SKY_TOP = '#0a1224'
const SKY_HORIZON = '#1b1140'
const SKY_GLOW = '#ff5a7a'

type Building = { x: number; w: number; h: number; windows: { x: number; y: number }[] }

export class Renderer {
  private buildingsBack: Building[]
  private buildingsMid: Building[]
  private stars: { x: number; y: number; r: number }[]
  private ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    this.stars = makeStars()
    this.buildingsBack = makeSkyline(0.55, 90, 280, 1)
    this.buildingsMid = makeSkyline(0.85, 140, 420, 2)
  }

  draw(world: World, player: Player, cam: Camera, particles: Particles, time: number) {
    const ctx = this.ctx
    const shake = cam.offset()
    ctx.clearRect(0, 0, VIEW_W, VIEW_H)

    this.drawSky(time)
    this.drawStars()
    this.drawSkyline(this.buildingsBack, cam.x * 0.12, '#10182c', time)
    this.drawSkyline(this.buildingsMid, cam.x * 0.28, '#152038', time)

    ctx.save()
    ctx.translate(-cam.x + shake.x, -cam.y + shake.y)
    this.drawGrid(world)
    this.drawPlatforms(world)
    this.drawProps(world)
    this.drawSpikes(world)
    this.drawOrbs(world, time)
    this.drawCheckpoints(world, time)
    this.drawGoal(world, time)
    this.drawSigns(world)
    this.drawParticles(particles)
    this.drawPlayer(player, time)
    ctx.restore()

    this.drawVignette()
  }

  private drawSky(time: number) {
    const ctx = this.ctx
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H)
    g.addColorStop(0, SKY_TOP)
    g.addColorStop(0.55, SKY_HORIZON)
    g.addColorStop(1, SKY_GLOW)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    const sunX = VIEW_W * 0.72
    const sunY = VIEW_H * 0.62
    const sun = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 220 + Math.sin(time) * 8)
    sun.addColorStop(0, 'rgba(255, 196, 120, 0.85)')
    sun.addColorStop(0.2, 'rgba(255, 90, 122, 0.35)')
    sun.addColorStop(1, 'rgba(255, 90, 122, 0)')
    ctx.fillStyle = sun
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  }

  private drawStars() {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    for (const s of this.stars) {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawSkyline(list: Building[], scroll: number, color: string, time: number) {
    const ctx = this.ctx
    ctx.fillStyle = color
    for (const b of list) {
      const x = ((b.x - scroll) % (VIEW_W + 400)) - 80
      const y = VIEW_H - b.h + 40
      ctx.fillRect(x, y, b.w, b.h)
      ctx.fillStyle = 'rgba(255, 210, 140, 0.35)'
      for (const w of b.windows) {
        if ((Math.sin(time * 0.8 + w.x) + 1) * 0.5 < 0.25) continue
        ctx.fillRect(x + w.x, y + w.y, 4, 6)
      }
      ctx.fillStyle = color
    }
  }

  private drawGrid(world: World) {
    const ctx = this.ctx
    ctx.strokeStyle = 'rgba(62, 224, 255, 0.04)'
    ctx.lineWidth = 1
    for (let x = 0; x < world.w; x += 80) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, world.h)
      ctx.stroke()
    }
  }

  private drawPlatforms(world: World) {
    const ctx = this.ctx
    for (const p of world.platforms) {
      if (p.type === 'oneway') {
        this.girder(p)
        continue
      }
      ctx.fillStyle = p.type === 'moving' ? '#1c3054' : '#17263f'
      ctx.fillRect(p.x, p.y, p.w, p.h)
      ctx.fillStyle = p.type === 'moving' ? '#ff3d8a' : '#3ee0ff'
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = 12
      ctx.fillRect(p.x, p.y, p.w, 5)
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(p.x, p.y + 5, p.w, 8)
    }
  }

  private girder(p: Platform) {
    const ctx = this.ctx
    ctx.fillStyle = '#2a3d5c'
    ctx.fillRect(p.x, p.y, p.w, 8)
    ctx.fillStyle = '#7dffce'
    ctx.shadowColor = '#7dffce'
    ctx.shadowBlur = 10
    ctx.fillRect(p.x, p.y, p.w, 3)
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(125, 255, 206, 0.35)'
    ctx.lineWidth = 2
    for (let x = p.x + 10; x < p.x + p.w; x += 18) {
      ctx.beginPath()
      ctx.moveTo(x, p.y + 8)
      ctx.lineTo(x - 6, p.y + 16)
      ctx.stroke()
    }
  }

  private drawProps(world: World) {
    for (const prop of world.props) this.drawProp(prop)
  }

  private drawProp(prop: Prop) {
    const ctx = this.ctx
    ctx.save()
    ctx.translate(prop.x, prop.y)
    if (prop.kind === 'vent') {
      ctx.fillStyle = '#22344f'
      ctx.fillRect(0, -22, 46, 22)
      ctx.fillStyle = '#3ee0ff'
      ctx.fillRect(6, -16, 10, 4)
      ctx.fillRect(22, -16, 10, 4)
    } else if (prop.kind === 'tank') {
      ctx.fillStyle = '#1b2c44'
      ctx.fillRect(4, -50, 44, 50)
      ctx.strokeStyle = '#3ee0ff'
      ctx.lineWidth = 2
      ctx.strokeRect(4, -50, 44, 50)
      ctx.beginPath()
      ctx.arc(26, -50, 22, Math.PI, 0)
      ctx.fill()
      ctx.stroke()
    } else if (prop.kind === 'antenna') {
      ctx.strokeStyle = '#9ad8ff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(8, 0)
      ctx.lineTo(8, -90)
      ctx.stroke()
      ctx.strokeStyle = '#ff3d8a'
      ctx.beginPath()
      ctx.moveTo(8, -40)
      ctx.lineTo(28, -58)
      ctx.moveTo(8, -40)
      ctx.lineTo(-12, -58)
      ctx.stroke()
      ctx.fillStyle = '#7dffce'
      ctx.beginPath()
      ctx.arc(8, -92, 5, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillStyle = '#22344f'
      ctx.fillRect(0, -18, 90, 18)
      ctx.fillRect(70, -70, 12, 70)
      ctx.strokeStyle = '#ff3d8a'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(76, -70)
      ctx.lineTo(-10, -70)
      ctx.stroke()
    }
    ctx.restore()
  }

  private drawSpikes(world: World) {
    const ctx = this.ctx
    ctx.fillStyle = '#ff5c7a'
    ctx.shadowColor = '#ff3d8a'
    ctx.shadowBlur = 8
    for (const s of world.spikes) {
      const n = Math.max(1, Math.floor(s.w / 14))
      const w = s.w / n
      for (let i = 0; i < n; i++) {
        const x = s.x + i * w
        ctx.beginPath()
        ctx.moveTo(x, s.y + s.h)
        ctx.lineTo(x + w / 2, s.y)
        ctx.lineTo(x + w, s.y + s.h)
        ctx.closePath()
        ctx.fill()
      }
    }
    ctx.shadowBlur = 0
  }

  private drawOrbs(world: World, time: number) {
    const ctx = this.ctx
    for (const o of world.orbs) {
      if (o.got) continue
      const bob = Math.sin(time * 3 + o.x) * 4
      const x = o.x + o.w / 2
      const y = o.y + o.h / 2 + bob
      ctx.fillStyle = 'rgba(255, 209, 102, 0.22)'
      ctx.beginPath()
      ctx.arc(x, y, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffd166'
      ctx.shadowColor = '#ffd166'
      ctx.shadowBlur = 16
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = '#fff6d5'
      ctx.beginPath()
      ctx.arc(x - 2, y - 2, 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawCheckpoints(world: World, time: number) {
    const ctx = this.ctx
    for (const c of world.checkpoints) {
      const lit = c.armed
      ctx.fillStyle = '#1a2740'
      ctx.fillRect(c.x + 10, c.y, 6, c.h)
      ctx.fillStyle = lit ? '#7dffce' : '#3ee0ff'
      ctx.globalAlpha = lit ? 0.9 : 0.45 + Math.sin(time * 2) * 0.1
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = lit ? 18 : 8
      ctx.beginPath()
      ctx.moveTo(c.x + 16, c.y + 4)
      ctx.lineTo(c.x + 16, c.y + 28)
      ctx.lineTo(c.x + 42, c.y + 16)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
    }
  }

  private drawGoal(world: World, time: number) {
    const ctx = this.ctx
    const g = world.goal
    const pulse = 0.55 + Math.sin(time * 3) * 0.2
    ctx.save()
    ctx.translate(g.x, g.y)
    ctx.strokeStyle = `rgba(125, 255, 206, ${pulse})`
    ctx.lineWidth = 4
    ctx.shadowColor = '#7dffce'
    ctx.shadowBlur = 18
    ctx.strokeRect(0, 0, g.w, g.h)
    ctx.fillStyle = `rgba(62, 224, 255, ${0.12 + pulse * 0.08})`
    ctx.fillRect(8, 8, g.w - 16, g.h - 16)
    ctx.fillStyle = '#e8f4ff'
    ctx.font = '700 14px Rajdhani, sans-serif'
    ctx.fillText('END', 18, g.h / 2 + 4)
    ctx.restore()
  }

  private drawSigns(world: World) {
    const ctx = this.ctx
    ctx.font = '600 16px Rajdhani, sans-serif'
    ctx.fillStyle = 'rgba(232, 244, 255, 0.72)'
    for (const s of world.signs) ctx.fillText(s.text, s.x, s.y)
  }

  private drawParticles(particles: Particles) {
    const ctx = this.ctx
    for (const p of particles.items) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      ctx.fillStyle = p.color
      ctx.fillRect(p.x, p.y, p.size, p.size)
    }
    ctx.globalAlpha = 1
  }

  private drawPlayer(player: Player, time: number) {
    const ctx = this.ctx
    if (player.scarf.length > 1) {
      ctx.strokeStyle = '#ff3d8a'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(player.scarf[0].x, player.scarf[0].y)
      for (const p of player.scarf) ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }

    for (const g of player.ghosts) {
      ctx.globalAlpha = g.life * 2.2
      ctx.fillStyle = '#3ee0ff'
      roundRect(ctx, g.x, g.y, player.w, g.h, 6)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    const h = player.h * player.squish
    const y = player.y + player.h - h
    const run = player.onGround && Math.abs(player.vx) > 40
    const bob = run ? Math.sin(time * 18) * 1.5 : 0

    ctx.save()
    ctx.translate(player.cx, y + h / 2 + bob)
    ctx.scale(player.facing, 1)

    ctx.fillStyle = '#7dffce'
    ctx.shadowColor = '#7dffce'
    ctx.shadowBlur = player.dashing ? 22 : 10
    roundRect(ctx, -player.w / 2, -h / 2, player.w, h, 7)
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.fillStyle = '#041018'
    ctx.fillRect(2, -h / 2 + 8, 5, 5)
    ctx.fillStyle = '#e8f4ff'
    ctx.fillRect(3, -h / 2 + 9, 2, 2)

    if (player.sliding) {
      ctx.fillStyle = '#3ee0ff'
      ctx.fillRect(-player.w / 2, h / 2 - 4, player.w, 4)
    }

    ctx.restore()
  }

  private drawVignette() {
    const ctx = this.ctx
    const g = ctx.createRadialGradient(
      VIEW_W / 2,
      VIEW_H / 2,
      VIEW_H * 0.2,
      VIEW_W / 2,
      VIEW_H / 2,
      VIEW_H * 0.78,
    )
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.42)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function makeStars() {
  const rng = mulberry(7)
  const stars = []
  for (let i = 0; i < 70; i++) {
    stars.push({ x: rng() * VIEW_W, y: rng() * VIEW_H * 0.5, r: rng() * 1.4 + 0.3 })
  }
  return stars
}

function makeSkyline(density: number, minH: number, maxH: number, seed: number): Building[] {
  const rng = mulberry(seed * 99)
  const list: Building[] = []
  let x = -40
  while (x < VIEW_W + 500) {
    const w = 28 + rng() * 70
    const h = minH + rng() * (maxH - minH) * density
    const windows: { x: number; y: number }[] = []
    for (let wx = 6; wx < w - 6; wx += 10) {
      for (let wy = 12; wy < h - 20; wy += 14) {
        if (rng() > 0.55) windows.push({ x: wx, y: wy })
      }
    }
    list.push({ x, w, h, windows })
    x += w + 6 + rng() * 18
  }
  return list
}

function mulberry(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
