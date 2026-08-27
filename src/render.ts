import { VIEW_H, VIEW_W } from './const'
import type { Camera } from './camera'
import type { Particles } from './particles'
import type { Player } from './player'
import type { Platform, Prop, World } from './world'

type PipeDeco = {
  x: number
  w: number
  h: number
  rust: number
  elbow: boolean
}

export class Renderer {
  private brickSheet: HTMLCanvasElement
  private farSheet: HTMLCanvasElement
  private drips: { x: number; delay: number; len: number }[]
  private lamps: { x: number; y: number }[]
  private stains: { x: number; y: number; w: number; h: number; color: string }[]
  private ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    this.brickSheet = bakeBricks()
    this.farSheet = bakeFarPipes()
    this.drips = makeDrips()
    this.lamps = [
      { x: 180, y: 90 },
      { x: 620, y: 70 },
      { x: 1040, y: 110 },
    ]
    this.stains = makeStains()
  }

  draw(world: World, player: Player, cam: Camera, particles: Particles, time: number) {
    const ctx = this.ctx
    const shake = cam.offset()
    ctx.clearRect(0, 0, VIEW_W, VIEW_H)

    this.drawBackdrop(cam.x, time)

    ctx.save()
    ctx.translate(-cam.x + shake.x, -cam.y + shake.y)
    this.drawWorldWash(world)
    this.drawPlatforms(world, cam)
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
    this.drawFilmGrain(time)
  }

  private drawBackdrop(scroll: number, time: number) {
    const ctx = this.ctx
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H)
    g.addColorStop(0, '#120e0b')
    g.addColorStop(0.4, '#231910')
    g.addColorStop(0.75, '#2c2016')
    g.addColorStop(1, '#1a2218')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    ctx.globalAlpha = 0.55
    ctx.drawImage(this.brickSheet, 0, 0)
    ctx.globalAlpha = 1

    const farX = -((scroll * 0.18) % (VIEW_W + 400))
    ctx.globalAlpha = 0.7
    ctx.drawImage(this.farSheet, farX, 40)
    ctx.drawImage(this.farSheet, farX + VIEW_W + 400, 40)
    ctx.globalAlpha = 1

    for (const s of this.stains) {
      ctx.fillStyle = s.color
      ctx.beginPath()
      ctx.ellipse(s.x, s.y, s.w, s.h, 0.2, 0, Math.PI * 2)
      ctx.fill()
    }

    for (const lamp of this.lamps) {
      const lx = lamp.x - scroll * 0.08
      const glow = ctx.createRadialGradient(lx, lamp.y, 8, lx, lamp.y, 160)
      glow.addColorStop(0, 'rgba(255, 190, 90, 0.22)')
      glow.addColorStop(0.45, 'rgba(180, 110, 40, 0.08)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(lx - 160, lamp.y - 40, 320, 280)
      ctx.fillStyle = '#e8c878'
      ctx.beginPath()
      ctx.arc(lx, lamp.y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#6a5340'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(lx, 0)
      ctx.lineTo(lx, lamp.y)
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(170, 210, 160, 0.28)'
    ctx.lineWidth = 1.4
    ctx.lineCap = 'round'
    for (const d of this.drips) {
      const y = ((time * 70 + d.delay) % (VIEW_H + 50)) - 20
      ctx.beginPath()
      ctx.moveTo(d.x, y)
      ctx.lineTo(d.x, y + d.len)
      ctx.stroke()
      ctx.fillStyle = 'rgba(190, 220, 180, 0.35)'
      ctx.beginPath()
      ctx.ellipse(d.x, y + d.len, 1.6, 2.4, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = 'rgba(40, 70, 48, 0.12)'
    ctx.fillRect(0, VIEW_H * 0.78, VIEW_W, VIEW_H * 0.22)
  }

  private drawWorldWash(world: World) {
    const ctx = this.ctx
    const g = ctx.createLinearGradient(0, world.killY - 80, 0, world.h)
    g.addColorStop(0, 'rgba(20, 40, 28, 0)')
    g.addColorStop(1, 'rgba(10, 28, 18, 0.45)')
    ctx.fillStyle = g
    ctx.fillRect(0, world.killY - 80, world.w, world.h - world.killY + 80)
  }

  private drawPlatforms(world: World, cam: Camera) {
    for (const p of world.platforms) {
      if (p.x > cam.x + VIEW_W + 80 || p.x + p.w < cam.x - 80) continue
      if (p.type === 'oneway') this.drawHangingPipe(p)
      else if (p.h > p.w * 1.35) this.drawRiser(p)
      else this.drawPipe(p)
    }
  }

  private drawPipe(p: Platform) {
    const ctx = this.ctx
    const moving = p.type === 'moving'
    const massH = Math.max(14, p.h - 16)

    ctx.fillStyle = moving ? '#3a2418' : '#2a211a'
    ctx.fillRect(p.x + 2, p.y + 14, p.w - 4, massH)
    if (p.h > 50) {
      ctx.fillStyle = '#1c1612'
      for (let y = p.y + 36; y < p.y + p.h; y += 18) {
        ctx.fillRect(p.x + 4, y, p.w - 8, 1)
      }
      this.moss(p.x + 10, p.y + 22, p.w - 20)
    }

    const pipeH = 22
    const body = ctx.createLinearGradient(0, p.y, 0, p.y + pipeH)
    if (moving) {
      body.addColorStop(0, '#8a4030')
      body.addColorStop(0.3, '#e08a58')
      body.addColorStop(0.55, '#6a2e20')
      body.addColorStop(1, '#2a1410')
    } else {
      body.addColorStop(0, '#b08a58')
      body.addColorStop(0.22, '#ecd8a8')
      body.addColorStop(0.48, '#a07840')
      body.addColorStop(0.72, '#6a4a28')
      body.addColorStop(1, '#2e2014')
    }
    ctx.fillStyle = body
    roundRect(ctx, p.x, p.y, p.w, pipeH, 10)
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 240, 200, 0.28)'
    roundRect(ctx, p.x + 8, p.y + 3, Math.max(16, p.w * 0.42), 4, 2)
    ctx.fill()

    for (let x = p.x + 28; x < p.x + p.w - 16; x += 52) {
      ctx.fillStyle = '#4a3424'
      ctx.fillRect(x, p.y - 3, 8, pipeH + 6)
      ctx.fillStyle = '#d2b06a'
      ctx.fillRect(x + 1, p.y - 1, 6, 3)
      ctx.fillStyle = '#2a1c12'
      ctx.fillRect(x + 2, p.y + 8, 4, 6)
      this.bolt(x + 4, p.y + 4)
      this.bolt(x + 4, p.y + pipeH - 3)
    }

    this.pipeCap(p.x, p.y + 11, moving)
    this.pipeCap(p.x + p.w, p.y + 11, moving)
    if (hash(p.x, p.y) > 0.55) this.valve(p.x + p.w * 0.35, p.y)
    if (hash(p.x + 9, p.y) > 0.7) this.leak(p.x + p.w * 0.62, p.y + pipeH)
  }

  private drawRiser(p: Platform) {
    const ctx = this.ctx
    const body = ctx.createLinearGradient(p.x, 0, p.x + p.w, 0)
    body.addColorStop(0, '#2a1c12')
    body.addColorStop(0.28, '#c4a070')
    body.addColorStop(0.5, '#8a6238')
    body.addColorStop(0.78, '#5a3c24')
    body.addColorStop(1, '#1c140e')
    ctx.fillStyle = body
    roundRect(ctx, p.x, p.y, p.w, p.h, Math.min(11, p.w / 2))
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 230, 180, 0.18)'
    ctx.fillRect(p.x + 5, p.y + 8, 4, p.h - 16)

    for (let y = p.y + 18; y < p.y + p.h - 12; y += 42) {
      ctx.fillStyle = '#3a2a1c'
      ctx.fillRect(p.x - 4, y, p.w + 8, 9)
      ctx.fillStyle = '#d0b070'
      ctx.fillRect(p.x - 3, y + 1, p.w + 6, 2)
      this.bolt(p.x + 3, y + 4)
      this.bolt(p.x + p.w - 3, y + 4)
    }

    ctx.fillStyle = '#2a1c12'
    ctx.beginPath()
    ctx.arc(p.x + p.w / 2, p.y + 6, p.w * 0.28, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawHangingPipe(p: Platform) {
    const ctx = this.ctx
    const body = ctx.createLinearGradient(0, p.y, 0, p.y + 14)
    body.addColorStop(0, '#c8b07a')
    body.addColorStop(0.5, '#8a6a40')
    body.addColorStop(1, '#3a2a1c')
    ctx.fillStyle = body
    roundRect(ctx, p.x, p.y, p.w, 14, 7)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,240,200,0.25)'
    ctx.fillRect(p.x + 6, p.y + 2, p.w * 0.4, 3)
    ctx.strokeStyle = '#8a7a58'
    ctx.lineWidth = 2
    for (let x = p.x + 14; x < p.x + p.w - 6; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, p.y + 14)
      ctx.lineTo(x - 3, p.y + 26)
      ctx.lineTo(x + 3, p.y + 26)
      ctx.stroke()
    }
  }

  private valve(x: number, y: number) {
    const ctx = this.ctx
    ctx.fillStyle = '#5a3a24'
    ctx.fillRect(x - 4, y - 10, 8, 10)
    ctx.fillStyle = '#c45a2a'
    ctx.beginPath()
    ctx.arc(x, y - 14, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#2a140e'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x - 6, y - 14)
    ctx.lineTo(x + 6, y - 14)
    ctx.moveTo(x, y - 20)
    ctx.lineTo(x, y - 8)
    ctx.stroke()
  }

  private leak(x: number, y: number) {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(140, 180, 120, 0.35)'
    ctx.beginPath()
    ctx.ellipse(x, y + 6, 5, 8, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  private moss(x: number, y: number, w: number) {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(70, 110, 55, 0.35)'
    for (let i = 0; i < w; i += 11) {
      ctx.beginPath()
      ctx.ellipse(x + i, y + (i % 7), 6, 3.5, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private bolt(x: number, y: number) {
    const ctx = this.ctx
    ctx.fillStyle = '#d8c090'
    ctx.beginPath()
    ctx.arc(x, y, 2.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#5a4a30'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x - 1.4, y)
    ctx.lineTo(x + 1.4, y)
    ctx.stroke()
  }

  private pipeCap(x: number, y: number, hot: boolean) {
    const ctx = this.ctx
    const g = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, 12)
    g.addColorStop(0, hot ? '#f0a070' : '#f0e0b0')
    g.addColorStop(0.45, hot ? '#c45a2a' : '#c4a15a')
    g.addColorStop(1, '#2a1c12')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1a120c'
    ctx.beginPath()
    ctx.arc(x, y, 4.5, 0, Math.PI * 2)
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
      const g = ctx.createLinearGradient(0, -30, 0, 0)
      g.addColorStop(0, '#8a6a48')
      g.addColorStop(1, '#3a2a1c')
      ctx.fillStyle = g
      roundRect(ctx, 0, -30, 54, 30, 4)
      ctx.fill()
      ctx.fillStyle = '#1a140e'
      for (let i = 0; i < 4; i++) ctx.fillRect(8 + i * 11, -22, 7, 16)
      ctx.fillStyle = '#d2b06a'
      ctx.fillRect(0, -30, 54, 4)
    } else if (prop.kind === 'tank') {
      const g = ctx.createLinearGradient(0, -62, 56, 0)
      g.addColorStop(0, '#b08a58')
      g.addColorStop(0.5, '#6a4a2c')
      g.addColorStop(1, '#2a1c12')
      ctx.fillStyle = g
      roundRect(ctx, 0, -62, 56, 62, 12)
      ctx.fill()
      ctx.strokeStyle = '#d2b06a'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(28, -32, 16, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#2a1c12'
      ctx.fillRect(24, -62, 8, 10)
      this.bolt(10, -10)
      this.bolt(46, -10)
    } else if (prop.kind === 'antenna') {
      const g = ctx.createLinearGradient(0, -110, 20, 0)
      g.addColorStop(0, '#c4a070')
      g.addColorStop(1, '#3a2a1c')
      ctx.fillStyle = g
      roundRect(ctx, 2, -108, 16, 108, 8)
      ctx.fill()
      ctx.fillStyle = '#d2b06a'
      ctx.fillRect(-2, -28, 24, 8)
      ctx.fillStyle = '#c45a2a'
      ctx.beginPath()
      ctx.arc(10, -112, 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1a120c'
      ctx.beginPath()
      ctx.arc(10, -112, 4, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillStyle = '#4a3828'
      roundRect(ctx, 0, -18, 92, 18, 4)
      ctx.fill()
      const arm = ctx.createLinearGradient(70, -78, 86, 0)
      arm.addColorStop(0, '#c45a2a')
      arm.addColorStop(1, '#4a2418')
      ctx.fillStyle = arm
      ctx.fillRect(70, -78, 12, 78)
      ctx.strokeStyle = '#e08a58'
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(76, -74)
      ctx.lineTo(-8, -74)
      ctx.lineTo(-8, -60)
      ctx.stroke()
    }
    ctx.restore()
  }

  private drawSpikes(world: World) {
    const ctx = this.ctx
    for (const s of world.spikes) {
      const n = Math.max(1, Math.floor(s.w / 13))
      const w = s.w / n
      for (let i = 0; i < n; i++) {
        const x = s.x + i * w
        const g = ctx.createLinearGradient(x, s.y, x + w, s.y + s.h)
        g.addColorStop(0, '#c8d0c4')
        g.addColorStop(0.45, '#6a7068')
        g.addColorStop(1, '#3a3028')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(x + 1, s.y + s.h)
        ctx.lineTo(x + w * 0.5, s.y - 2)
        ctx.lineTo(x + w - 1, s.y + s.h)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,230,0.25)'
        ctx.beginPath()
        ctx.moveTo(x + w * 0.5, s.y)
        ctx.lineTo(x + w * 0.58, s.y + s.h)
        ctx.lineTo(x + w * 0.5, s.y + s.h)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  private drawOrbs(world: World, time: number) {
    const ctx = this.ctx
    for (const o of world.orbs) {
      if (o.got) continue
      const bob = Math.sin(time * 3 + o.x * 0.02) * 4
      const x = o.x + o.w / 2
      const y = o.y + o.h / 2 + bob
      ctx.fillStyle = 'rgba(220, 160, 60, 0.18)'
      ctx.beginPath()
      ctx.arc(x, y, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#c48a30'
      ctx.beginPath()
      ctx.ellipse(x, y + 1, 8.5, 6.2, -0.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#e8c878'
      ctx.beginPath()
      ctx.ellipse(x - 0.5, y - 0.8, 7, 5, -0.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff4c8'
      ctx.beginPath()
      ctx.ellipse(x - 2.5, y - 2.2, 2.4, 1.6, -0.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#8a5a20'
      ctx.fillRect(x + 2, y - 1, 1.2, 3)
    }
  }

  private drawCheckpoints(world: World, time: number) {
    const ctx = this.ctx
    for (const c of world.checkpoints) {
      const lit = c.armed
      const g = ctx.createLinearGradient(c.x, c.y, c.x + 20, c.y + c.h)
      g.addColorStop(0, '#8a6a48')
      g.addColorStop(1, '#3a2a1c')
      ctx.fillStyle = g
      roundRect(ctx, c.x + 6, c.y, 14, c.h, 4)
      ctx.fill()
      ctx.fillStyle = '#d2b06a'
      ctx.fillRect(c.x + 4, c.y + c.h - 8, 18, 6)
      const pulse = lit ? 1 : 0.45 + Math.sin(time * 2.4) * 0.12
      ctx.fillStyle = lit ? `rgba(255, 200, 80, ${pulse})` : `rgba(120, 140, 90, ${pulse})`
      ctx.beginPath()
      ctx.arc(c.x + 13, c.y + 14, 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#2a1c12'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(c.x + 13, c.y + 14, 8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = lit ? '#6a3a10' : '#3a4030'
      ctx.beginPath()
      ctx.moveTo(c.x + 13, c.y + 14)
      ctx.lineTo(c.x + 13 + Math.cos(time) * 5, c.y + 14 + Math.sin(time) * 5)
      ctx.stroke()
    }
  }

  private drawGoal(world: World, time: number) {
    const ctx = this.ctx
    const g = world.goal
    const pulse = 0.5 + Math.sin(time * 3) * 0.2
    ctx.save()
    ctx.translate(g.x, g.y)
    const metal = ctx.createLinearGradient(0, 0, g.w, g.h)
    metal.addColorStop(0, '#b08a58')
    metal.addColorStop(0.5, '#6a4a2c')
    metal.addColorStop(1, '#2a1c12')
    ctx.fillStyle = metal
    roundRect(ctx, 0, 0, g.w, g.h, 10)
    ctx.fill()
    ctx.fillStyle = `rgba(8, 6, 4, ${0.55 + pulse * 0.2})`
    ctx.beginPath()
    ctx.arc(g.w / 2, g.h / 2 + 4, 22, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#d2b06a'
    ctx.lineWidth = 2
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(g.w / 2 + i * 7, g.h / 2 - 16)
      ctx.lineTo(g.w / 2 + i * 7, g.h / 2 + 24)
      ctx.stroke()
    }
    ctx.fillStyle = `rgba(255, 210, 120, ${0.15 + pulse * 0.15})`
    ctx.beginPath()
    ctx.arc(g.w / 2, g.h / 2 + 4, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f4e4c0'
    ctx.font = '700 12px Rajdhani, sans-serif'
    ctx.fillText('OUT', 24, 18)
    ctx.restore()
  }

  private drawSigns(world: World) {
    const ctx = this.ctx
    ctx.font = '600 15px Rajdhani, sans-serif'
    for (const s of world.signs) {
      const w = ctx.measureText(s.text).width
      ctx.fillStyle = 'rgba(42, 30, 20, 0.72)'
      roundRect(ctx, s.x - 10, s.y - 18, w + 20, 26, 4)
      ctx.fill()
      ctx.strokeStyle = 'rgba(196, 161, 90, 0.35)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = 'rgba(242, 226, 190, 0.92)'
      ctx.fillText(s.text, s.x, s.y)
    }
  }

  private drawParticles(particles: Particles) {
    const ctx = this.ctx
    for (const p of particles.items) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawPlayer(player: Player, time: number) {
    const ctx = this.ctx
    for (const g of player.ghosts) {
      ctx.globalAlpha = Math.max(0, g.life * 1.6)
      ctx.fillStyle = '#5a3818'
      ctx.beginPath()
      ctx.ellipse(g.x + player.w / 2, g.y + g.h / 2, 14, 10, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    const h = player.h * player.squish
    const y = player.y + player.h - h
    const run = player.onGround && Math.abs(player.vx) > 40
    const climb = player.onWall !== 0 && !player.onGround
    const air = !player.onGround && !climb
    const bob = run ? Math.sin(time * 22) * 1.6 : 0
    const gait = time * (run ? 24 : climb ? 18 : 5)

    ctx.save()
    ctx.translate(player.cx, y + h * 0.72 + bob)
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.beginPath()
    ctx.ellipse(0, h * 0.28, 13, 4.5, 0, 0, Math.PI * 2)
    ctx.fill()

    if (climb) ctx.rotate((player.onWall * Math.PI) / 2)
    ctx.scale(player.facing * 1.9, 1.9)

    drawRoach(ctx, gait, time, air || player.dashing, player.sliding)
    ctx.restore()
  }

  private drawVignette() {
    const ctx = this.ctx
    const g = ctx.createRadialGradient(
      VIEW_W / 2,
      VIEW_H / 2,
      VIEW_H * 0.16,
      VIEW_W / 2,
      VIEW_H / 2,
      VIEW_H * 0.86,
    )
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(0.65, 'rgba(10, 6, 4, 0.12)')
    g.addColorStop(1, 'rgba(8, 4, 2, 0.62)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  }

  private drawFilmGrain(time: number) {
    const ctx = this.ctx
    ctx.globalAlpha = 0.035
    ctx.fillStyle = '#fff3d0'
    const rng = mulberry((time * 20) | 0)
    for (let i = 0; i < 40; i++) {
      ctx.fillRect(rng() * VIEW_W, rng() * VIEW_H, 2, 2)
    }
    ctx.globalAlpha = 1
  }
}

function drawRoach(
  ctx: CanvasRenderingContext2D,
  gait: number,
  time: number,
  wingsOpen: boolean,
  sliding: boolean,
) {
  const flatten = sliding ? 0.72 : 1
  ctx.scale(1, flatten)

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const pairs = [
    { x: -7, phase: 0, spread: 11 },
    { x: -1, phase: 2.1, spread: 12 },
    { x: 6, phase: 4.2, spread: 10 },
  ]
  for (const leg of pairs) {
    const swing = Math.sin(gait + leg.phase) * 0.55
    drawLeg(ctx, leg.x, 2, -1, swing, leg.spread)
    drawLeg(ctx, leg.x, 2, 1, -swing, leg.spread)
  }

  ctx.fillStyle = '#2a1a0c'
  ctx.beginPath()
  ctx.moveTo(-16, 0)
  ctx.lineTo(-19, -3)
  ctx.lineTo(-16, -1)
  ctx.moveTo(-16, 0)
  ctx.lineTo(-19, 3)
  ctx.lineTo(-16, 1)
  ctx.fill()

  const abdomen = ctx.createLinearGradient(0, -10, 0, 12)
  abdomen.addColorStop(0, '#8a5a28')
  abdomen.addColorStop(0.45, '#5a3416')
  abdomen.addColorStop(1, '#2e1a0c')
  ctx.fillStyle = abdomen
  ctx.beginPath()
  ctx.ellipse(-4, 0, 15, 9.5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(30, 16, 8, 0.55)'
  ctx.lineWidth = 1
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.ellipse(-8 + i * 3.2, 0, 3.2, 8.2 - i * 0.4, 0, 0.15, Math.PI - 0.15)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(255, 210, 140, 0.2)'
  ctx.beginPath()
  ctx.ellipse(-3, -4.5, 9, 3.2, 0, 0, Math.PI * 2)
  ctx.fill()

  const open = wingsOpen ? 0.35 : 0.08
  ctx.fillStyle = '#6a4018'
  ctx.beginPath()
  ctx.ellipse(-1, -3.5 - open * 4, 11, 5.2, -0.15 - open, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(-1, 3.5 + open * 4, 11, 5.2, 0.15 + open, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(20, 10, 4, 0.45)'
  ctx.stroke()

  const thorax = ctx.createRadialGradient(8, -2, 1, 7, 0, 8)
  thorax.addColorStop(0, '#c48a48')
  thorax.addColorStop(0.5, '#7a4a20')
  thorax.addColorStop(1, '#3a2010')
  ctx.fillStyle = thorax
  ctx.beginPath()
  ctx.ellipse(7, 0, 7.5, 7.2, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#8a5a28'
  ctx.beginPath()
  ctx.ellipse(14.5, 0, 5.4, 4.6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#5a3418'
  ctx.beginPath()
  ctx.ellipse(16.5, 0, 2.4, 2.8, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#1a0e08'
  ctx.beginPath()
  ctx.arc(16.2, -2.2, 1.7, 0, Math.PI * 2)
  ctx.arc(16.2, 2.2, 1.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f2e0a8'
  ctx.beginPath()
  ctx.arc(16.6, -2.5, 0.6, 0, Math.PI * 2)
  ctx.arc(16.6, 1.9, 0.6, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#2a180c'
  ctx.lineWidth = 2.1
  const ant = Math.sin(time * 9) * 0.18
  ctx.beginPath()
  ctx.moveTo(18, -2)
  ctx.quadraticCurveTo(24, -10, 28, -14 + ant * 10)
  ctx.moveTo(18, 2)
  ctx.quadraticCurveTo(23, -8, 26, -16 - ant * 10)
  ctx.stroke()
  ctx.fillStyle = '#3a2410'
  ctx.beginPath()
  ctx.arc(28, -14 + ant * 10, 1.1, 0, Math.PI * 2)
  ctx.arc(26, -16 - ant * 10, 1.1, 0, Math.PI * 2)
  ctx.fill()
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  side: number,
  swing: number,
  spread: number,
) {
  const hipY = y + side * 3
  const midX = x + swing * 5
  const midY = hipY + side * (spread * 0.45)
  const footX = x + swing * 9
  const footY = hipY + side * spread
  ctx.strokeStyle = '#1a1008'
  ctx.lineWidth = 2.8
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(midX, midY)
  ctx.lineTo(footX, footY)
  ctx.stroke()
  ctx.fillStyle = '#2a180c'
  ctx.beginPath()
  ctx.arc(footX, footY, 1.3, 0, Math.PI * 2)
  ctx.fill()
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

function bakeBricks() {
  const c = document.createElement('canvas')
  c.width = VIEW_W
  c.height = VIEW_H
  const ctx = c.getContext('2d')
  if (!ctx) return c
  const rng = mulberry(4)
  ctx.fillStyle = '#2a1e16'
  ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  for (let row = 0; row < VIEW_H / 18; row++) {
    const offset = row % 2 === 0 ? 0 : 18
    for (let col = -1; col < VIEW_W / 36 + 1; col++) {
      const x = col * 36 + offset
      const y = row * 18
      const shade = rng()
      ctx.fillStyle = shade > 0.82 ? '#3a2a1c' : shade > 0.4 ? '#2c2118' : '#231910'
      ctx.fillRect(x + 1, y + 1, 33, 15)
      if (rng() > 0.88) {
        ctx.fillStyle = 'rgba(60, 90, 48, 0.28)'
        ctx.fillRect(x + 4, y + 4, 12, 7)
      }
      if (rng() > 0.93) {
        ctx.fillStyle = 'rgba(20, 12, 8, 0.35)'
        ctx.fillRect(x + 8, y + 2, 18, 11)
      }
    }
  }
  return c
}

function bakeFarPipes() {
  const c = document.createElement('canvas')
  c.width = VIEW_W + 400
  c.height = VIEW_H
  const ctx = c.getContext('2d')
  if (!ctx) return c
  const rng = mulberry(11)
  const pipes: PipeDeco[] = []
  let x = -20
  while (x < c.width) {
    pipes.push({
      x,
      w: 18 + rng() * 36,
      h: 140 + rng() * 320,
      rust: rng(),
      elbow: rng() > 0.72,
    })
    x += 32 + rng() * 44
  }
  for (const p of pipes) {
    const g = ctx.createLinearGradient(p.x, 0, p.x + p.w, 0)
    if (p.rust > 0.55) {
      g.addColorStop(0, '#2a1c12')
      g.addColorStop(0.35, '#7a4a28')
      g.addColorStop(1, '#1c140e')
    } else {
      g.addColorStop(0, '#1c2420')
      g.addColorStop(0.35, '#4a5c50')
      g.addColorStop(1, '#121816')
    }
    ctx.fillStyle = g
    const y = VIEW_H - p.h
    roundRect(ctx, p.x, y, p.w, p.h + 40, Math.min(10, p.w / 2))
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 220, 160, 0.1)'
    ctx.fillRect(p.x + 3, y + 10, 4, p.h - 30)
    if (p.elbow) {
      ctx.fillStyle = g
      ctx.fillRect(p.x - 18, y + 24, 26, p.w)
    }
  }
  return c
}

function makeDrips() {
  const rng = mulberry(21)
  const list: { x: number; delay: number; len: number }[] = []
  for (let i = 0; i < 26; i++) {
    list.push({ x: 40 + rng() * (VIEW_W - 80), delay: rng() * 500, len: 8 + rng() * 14 })
  }
  return list
}

function makeStains() {
  const rng = mulberry(8)
  const list: { x: number; y: number; w: number; h: number; color: string }[] = []
  for (let i = 0; i < 12; i++) {
    list.push({
      x: rng() * VIEW_W,
      y: 80 + rng() * 500,
      w: 30 + rng() * 70,
      h: 12 + rng() * 28,
      color: rng() > 0.5 ? 'rgba(40, 70, 40, 0.12)' : 'rgba(20, 12, 8, 0.16)',
    })
  }
  return list
}

function hash(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
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
