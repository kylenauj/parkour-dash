import { VIEW_H, VIEW_W } from './const'
import type { Camera } from './camera'
import type { Particles } from './particles'
import type { Player } from './player'
import type { Platform, Prop, World } from './world'

type PipeDeco = { x: number; w: number; h: number; rust: number }

export class Renderer {
  private bricks: { x: number; y: number; w: number; h: number }[]
  private farPipes: PipeDeco[]
  private drips: { x: number; delay: number }[]
  private ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    this.bricks = makeBricks()
    this.farPipes = makeFarPipes()
    this.drips = makeDrips()
  }

  draw(world: World, player: Player, cam: Camera, particles: Particles, time: number) {
    const ctx = this.ctx
    const shake = cam.offset()
    ctx.clearRect(0, 0, VIEW_W, VIEW_H)

    this.drawSewer(time)
    this.drawFarPipes(cam.x)

    ctx.save()
    ctx.translate(-cam.x + shake.x, -cam.y + shake.y)
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

  private drawSewer(time: number) {
    const ctx = this.ctx
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H)
    g.addColorStop(0, '#1a1410')
    g.addColorStop(0.45, '#2a2118')
    g.addColorStop(1, '#3a2a1c')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    ctx.fillStyle = '#241c16'
    for (const b of this.bricks) ctx.fillRect(b.x, b.y, b.w, b.h)

    ctx.fillStyle = 'rgba(80, 140, 90, 0.08)'
    ctx.fillRect(0, VIEW_H * 0.72, VIEW_W, VIEW_H * 0.28)

    ctx.strokeStyle = 'rgba(180, 210, 170, 0.18)'
    ctx.lineWidth = 1.5
    for (const d of this.drips) {
      const y = ((time * 90 + d.delay) % (VIEW_H + 40)) - 20
      ctx.beginPath()
      ctx.moveTo(d.x, y)
      ctx.lineTo(d.x, y + 10)
      ctx.stroke()
    }
  }

  private drawFarPipes(scroll: number) {
    const ctx = this.ctx
    for (const p of this.farPipes) {
      const x = ((p.x - scroll * 0.2) % (VIEW_W + 260)) - 80
      ctx.fillStyle = p.rust > 0.5 ? '#4a3728' : '#3d4a42'
      roundRect(ctx, x, VIEW_H - p.h + 30, p.w, p.h, Math.min(12, p.w / 2))
      ctx.fill()
      ctx.fillStyle = 'rgba(255,220,160,0.08)'
      ctx.fillRect(x + 4, VIEW_H - p.h + 38, 5, p.h - 50)
    }
  }

  private drawPlatforms(world: World) {
    for (const p of world.platforms) {
      if (p.type === 'oneway') this.drawHangingPipe(p)
      else if (p.h > p.w * 1.35) this.drawRiser(p)
      else this.drawPipe(p)
    }
  }

  private drawPipe(p: Platform) {
    const ctx = this.ctx
    const moving = p.type === 'moving'
    const body = moving ? '#6a3d2a' : '#7a5a3a'
    const lip = moving ? '#c45a2a' : '#c4a15a'
    ctx.fillStyle = '#2c2118'
    ctx.fillRect(p.x, p.y + 8, p.w, Math.max(12, p.h - 8))
    ctx.fillStyle = body
    roundRect(ctx, p.x, p.y, p.w, 18, 9)
    ctx.fill()
    ctx.fillStyle = lip
    ctx.fillRect(p.x + 2, p.y + 3, p.w - 4, 4)
    ctx.fillStyle = 'rgba(255,230,180,0.18)'
    ctx.fillRect(p.x + 8, p.y + 5, Math.max(12, p.w * 0.35), 3)
    this.rivets(p.x, p.y + 10, p.w)
    this.pipeCap(p.x, p.y + 9)
    this.pipeCap(p.x + p.w, p.y + 9)
  }

  private drawRiser(p: Platform) {
    const ctx = this.ctx
    ctx.fillStyle = '#6e5340'
    roundRect(ctx, p.x, p.y, p.w, p.h, Math.min(10, p.w / 2))
    ctx.fill()
    ctx.fillStyle = '#c4a15a'
    ctx.fillRect(p.x + 3, p.y + 4, 4, p.h - 8)
    ctx.fillStyle = 'rgba(255,230,180,0.14)'
    ctx.fillRect(p.x + 8, p.y + 6, 3, p.h - 12)
    for (let y = p.y + 16; y < p.y + p.h - 10; y += 36) {
      ctx.fillStyle = '#4a3828'
      ctx.fillRect(p.x - 3, y, p.w + 6, 6)
      ctx.fillStyle = '#c4a15a'
      ctx.fillRect(p.x - 2, y + 1, p.w + 4, 2)
    }
  }

  private drawHangingPipe(p: Platform) {
    const ctx = this.ctx
    ctx.fillStyle = '#5a4634'
    roundRect(ctx, p.x, p.y, p.w, 12, 6)
    ctx.fill()
    ctx.fillStyle = '#d2b56a'
    ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, 3)
    ctx.strokeStyle = 'rgba(180, 150, 90, 0.45)'
    ctx.lineWidth = 2
    for (let x = p.x + 12; x < p.x + p.w; x += 22) {
      ctx.beginPath()
      ctx.moveTo(x, p.y + 12)
      ctx.lineTo(x, p.y + 22)
      ctx.stroke()
    }
  }

  private rivets(x: number, y: number, w: number) {
    const ctx = this.ctx
    ctx.fillStyle = '#d8c090'
    for (let i = x + 14; i < x + w - 8; i += 28) {
      ctx.beginPath()
      ctx.arc(i, y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private pipeCap(x: number, y: number) {
    const ctx = this.ctx
    ctx.fillStyle = '#c4a15a'
    ctx.beginPath()
    ctx.arc(x, y, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#3a2a1c'
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawProps(world: World) {
    for (const prop of world.props) this.drawProp(prop)
  }

  private drawProp(prop: Prop) {
    const ctx = this.ctx
    ctx.save()
    ctx.translate(prop.x, prop.y)
    if (prop.kind === 'vent') {
      ctx.fillStyle = '#6a5340'
      ctx.fillRect(0, -26, 50, 26)
      ctx.fillStyle = '#c4a15a'
      ctx.fillRect(8, -18, 12, 8)
      ctx.fillRect(28, -18, 12, 8)
    } else if (prop.kind === 'tank') {
      ctx.fillStyle = '#5a4636'
      roundRect(ctx, 0, -56, 52, 56, 10)
      ctx.fill()
      ctx.strokeStyle = '#c4a15a'
      ctx.lineWidth = 3
      ctx.strokeRect(6, -48, 40, 40)
    } else if (prop.kind === 'antenna') {
      ctx.fillStyle = '#6e5340'
      ctx.fillRect(2, -96, 14, 96)
      ctx.fillStyle = '#c4a15a'
      ctx.fillRect(0, -20, 18, 8)
      ctx.beginPath()
      ctx.arc(9, -100, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#2a2118'
      ctx.beginPath()
      ctx.arc(9, -100, 4, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillStyle = '#5a4634'
      ctx.fillRect(0, -16, 86, 16)
      ctx.fillRect(64, -64, 14, 64)
      ctx.strokeStyle = '#c45a2a'
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(71, -64)
      ctx.lineTo(-6, -64)
      ctx.stroke()
    }
    ctx.restore()
  }

  private drawSpikes(world: World) {
    const ctx = this.ctx
    ctx.fillStyle = '#7a8a7a'
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
  }

  private drawOrbs(world: World, time: number) {
    const ctx = this.ctx
    for (const o of world.orbs) {
      if (o.got) continue
      const bob = Math.sin(time * 3 + o.x) * 4
      const x = o.x + o.w / 2
      const y = o.y + o.h / 2 + bob
      ctx.fillStyle = 'rgba(210, 160, 70, 0.22)'
      ctx.beginPath()
      ctx.arc(x, y, 13, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#e0b15a'
      ctx.beginPath()
      ctx.ellipse(x, y, 7, 5, 0.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f3e0a8'
      ctx.beginPath()
      ctx.arc(x - 2, y - 1.5, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawCheckpoints(world: World, time: number) {
    const ctx = this.ctx
    for (const c of world.checkpoints) {
      const lit = c.armed
      ctx.fillStyle = '#4a3828'
      ctx.fillRect(c.x + 8, c.y, 10, c.h)
      ctx.fillStyle = lit ? '#d2b56a' : '#7a8a6a'
      ctx.globalAlpha = lit ? 0.95 : 0.5 + Math.sin(time * 2) * 0.12
      ctx.beginPath()
      ctx.arc(c.x + 13, c.y + 10, 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.fillStyle = '#2a2118'
      ctx.beginPath()
      ctx.arc(c.x + 13, c.y + 10, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawGoal(world: World, time: number) {
    const ctx = this.ctx
    const g = world.goal
    const pulse = 0.5 + Math.sin(time * 3) * 0.2
    ctx.save()
    ctx.translate(g.x, g.y)
    ctx.fillStyle = '#5a4634'
    roundRect(ctx, 0, 0, g.w, g.h, 12)
    ctx.fill()
    ctx.strokeStyle = `rgba(196, 161, 90, ${pulse})`
    ctx.lineWidth = 4
    ctx.strokeRect(6, 6, g.w - 12, g.h - 12)
    ctx.fillStyle = `rgba(20, 16, 12, ${0.35 + pulse * 0.2})`
    ctx.beginPath()
    ctx.arc(g.w / 2, g.h / 2, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f0e0c0'
    ctx.font = '700 13px Rajdhani, sans-serif'
    ctx.fillText('OUT', 22, g.h / 2 + 4)
    ctx.restore()
  }

  private drawSigns(world: World) {
    const ctx = this.ctx
    ctx.font = '600 16px Rajdhani, sans-serif'
    ctx.fillStyle = 'rgba(232, 214, 180, 0.78)'
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
    for (const g of player.ghosts) {
      ctx.globalAlpha = g.life * 1.8
      ctx.fillStyle = '#6b4423'
      roundRect(ctx, g.x, g.y, player.w, g.h, 8)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    const h = player.h * player.squish
    const y = player.y + player.h - h
    const run = player.onGround && Math.abs(player.vx) > 40
    const climb = player.onWall !== 0 && !player.onGround
    const bob = run ? Math.sin(time * 20) * 1.4 : 0
    const gait = time * (run ? 22 : climb ? 16 : 6)

    ctx.save()
    ctx.translate(player.cx, y + h / 2 + bob)
    if (climb) ctx.rotate((player.onWall * Math.PI) / 2)
    ctx.scale(player.facing, 1)

    const bw = player.w
    const bh = h

    ctx.strokeStyle = '#1a120c'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    const legs = [
      { x: -bw * 0.18, base: Math.PI * 0.2 },
      { x: 0, base: Math.PI * 0.12 },
      { x: bw * 0.2, base: Math.PI * 0.22 },
    ]
    for (let i = 0; i < legs.length; i++) {
      const swing = Math.sin(gait + i * 1.1) * 0.45
      const lx = legs[i].x
      ctx.beginPath()
      ctx.moveTo(lx, 2)
      ctx.quadraticCurveTo(lx - 10, bh * 0.15, lx - 14, bh * 0.42 + swing * 6)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(lx, 2)
      ctx.quadraticCurveTo(lx + 10, bh * 0.15, lx + 14, bh * 0.42 - swing * 6)
      ctx.stroke()
    }

    ctx.fillStyle = '#5a3a1c'
    ctx.beginPath()
    ctx.ellipse(2, 4, bw * 0.42, bh * 0.38, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#6e4624'
    ctx.beginPath()
    ctx.ellipse(-2, -2, bw * 0.34, bh * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#7a522c'
    ctx.beginPath()
    ctx.ellipse(bw * 0.22, -bh * 0.08, bw * 0.22, bh * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#4a3018'
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.ellipse(2, 4, bw * 0.28, bh * 0.18, 0, 0.2, Math.PI - 0.2)
    ctx.stroke()

    ctx.strokeStyle = '#2a1a10'
    ctx.lineWidth = 1.6
    const ant = Math.sin(time * 8) * 0.15
    ctx.beginPath()
    ctx.moveTo(bw * 0.28, -bh * 0.18)
    ctx.quadraticCurveTo(bw * 0.42, -bh * 0.55, bw * 0.55, -bh * 0.62 + ant * 8)
    ctx.moveTo(bw * 0.22, -bh * 0.2)
    ctx.quadraticCurveTo(bw * 0.3, -bh * 0.58, bw * 0.38, -bh * 0.7 - ant * 8)
    ctx.stroke()

    ctx.fillStyle = '#120c08'
    ctx.beginPath()
    ctx.arc(bw * 0.3, -bh * 0.1, 2.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f2e6c8'
    ctx.beginPath()
    ctx.arc(bw * 0.32, -bh * 0.12, 0.8, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  private drawVignette() {
    const ctx = this.ctx
    const g = ctx.createRadialGradient(
      VIEW_W / 2,
      VIEW_H / 2,
      VIEW_H * 0.18,
      VIEW_W / 2,
      VIEW_H / 2,
      VIEW_H * 0.82,
    )
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(12, 8, 6, 0.55)')
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

function makeBricks() {
  const rng = mulberry(3)
  const list: { x: number; y: number; w: number; h: number }[] = []
  for (let y = 0; y < VIEW_H; y += 22) {
    const offset = (y / 22) % 2 === 0 ? 0 : 18
    for (let x = -20 + offset; x < VIEW_W; x += 36) {
      if (rng() > 0.72) list.push({ x, y, w: 32, h: 16 })
    }
  }
  return list
}

function makeFarPipes(): PipeDeco[] {
  const rng = mulberry(11)
  const list: PipeDeco[] = []
  let x = -40
  while (x < VIEW_W + 400) {
    list.push({
      x,
      w: 22 + rng() * 40,
      h: 120 + rng() * 280,
      rust: rng(),
    })
    x += 36 + rng() * 50
  }
  return list
}

function makeDrips() {
  const rng = mulberry(21)
  const list: { x: number; delay: number }[] = []
  for (let i = 0; i < 18; i++) list.push({ x: rng() * VIEW_W, delay: rng() * 400 })
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
