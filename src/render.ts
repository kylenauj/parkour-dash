import { VIEW_H, VIEW_W } from './const'
import type { Camera } from './camera'
import type { Particles } from './particles'
import type { Player } from './player'
import type { Platform, Prop, World } from './world'

const TOXIC = '#7CFF3A'
const TOXIC_DEEP = '#1a5a12'

export class Renderer {
  private brickSheet: HTMLCanvasElement
  private farSheet: HTMLCanvasElement
  private brickTile: HTMLCanvasElement[]
  private spores: { x: number; y: number; s: number; z: number }[]
  private lamps: { x: number; y: number }[]
  private ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    this.brickTile = [0, 1, 2, 3].map((i) => bakeBrickTile(i + 2))
    this.brickSheet = bakeBrickWall(this.brickTile)
    this.farSheet = bakeFarPipes()
    this.spores = makeSpores()
    this.lamps = [
      { x: 160, y: 78 },
      { x: 540, y: 64 },
      { x: 920, y: 88 },
      { x: 1180, y: 70 },
    ]
  }

  draw(world: World, player: Player, cam: Camera, particles: Particles, time: number) {
    const ctx = this.ctx
    const shake = cam.offset()
    ctx.clearRect(0, 0, VIEW_W, VIEW_H)

    this.drawBackdrop(cam, time)

    ctx.save()
    ctx.translate(-cam.x + shake.x, -cam.y + shake.y)
    this.drawSludge(world, cam, time)
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

    this.drawToxicVeil(world, cam)
    this.drawVignette()
  }

  private drawBackdrop(cam: Camera, time: number) {
    const ctx = this.ctx
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H)
    g.addColorStop(0, '#0a0e0c')
    g.addColorStop(0.45, '#141c16')
    g.addColorStop(1, '#0c2210')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    ctx.drawImage(this.brickSheet, 0, 0)

    const farX = -((cam.x * 0.16) % (VIEW_W + 420))
    ctx.globalAlpha = 0.55
    ctx.drawImage(this.farSheet, farX, 20)
    ctx.drawImage(this.farSheet, farX + VIEW_W + 420, 20)
    ctx.globalAlpha = 1

    const bounce = ctx.createLinearGradient(0, VIEW_H * 0.45, 0, VIEW_H)
    bounce.addColorStop(0, 'rgba(80, 255, 40, 0)')
    bounce.addColorStop(1, 'rgba(80, 255, 40, 0.16)')
    ctx.fillStyle = bounce
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    for (const lamp of this.lamps) {
      const lx = lamp.x - cam.x * 0.07
      const glow = ctx.createRadialGradient(lx, lamp.y, 4, lx, lamp.y, 130)
      glow.addColorStop(0, 'rgba(255, 210, 90, 0.55)')
      glow.addColorStop(0.2, 'rgba(255, 180, 60, 0.16)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(lx - 130, lamp.y - 20, 260, 240)
      this.bulkhead(lx, lamp.y)
    }

    ctx.save()
    for (const sp of this.spores) {
      const x = ((sp.x - cam.x * sp.z * 0.12 + time * 12) % (VIEW_W + 40) + VIEW_W + 40) % (VIEW_W + 40) - 20
      const y = (sp.y + Math.sin(time * 0.7 + sp.x) * 18) % VIEW_H
      ctx.globalAlpha = 0.25 + sp.s * 0.35
      ctx.fillStyle = TOXIC
      ctx.beginPath()
      ctx.arc(x, y, sp.s, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  private bulkhead(x: number, y: number) {
    const ctx = this.ctx
    ctx.fillStyle = '#2a2e28'
    roundRect(ctx, x - 14, y - 8, 28, 14, 3)
    ctx.fill()
    ctx.fillStyle = '#ffe080'
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 240, 160, 0.7)'
    ctx.beginPath()
    ctx.arc(x - 1.5, y - 1.5, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawSludge(world: World, cam: Camera, time: number) {
    const ctx = this.ctx
    const y = world.killY - 28
    if (y > cam.y + VIEW_H + 40) return

    const glow = ctx.createLinearGradient(0, y - 160, 0, world.h)
    glow.addColorStop(0, 'rgba(80, 255, 50, 0)')
    glow.addColorStop(0.35, 'rgba(80, 255, 50, 0.18)')
    glow.addColorStop(1, 'rgba(40, 180, 30, 0.55)')
    ctx.fillStyle = glow
    ctx.fillRect(cam.x - 40, y - 160, VIEW_W + 80, world.h - y + 200)

    ctx.fillStyle = TOXIC_DEEP
    ctx.beginPath()
    ctx.moveTo(cam.x - 40, world.h)
    ctx.lineTo(cam.x - 40, y)
    const start = Math.floor(cam.x / 24) * 24
    for (let x = start - 40; x < cam.x + VIEW_W + 60; x += 16) {
      const wave = Math.sin(x * 0.05 + time * 2.2) * 5 + Math.sin(x * 0.12 + time * 3.1) * 2.5
      ctx.lineTo(x, y + wave)
    }
    ctx.lineTo(cam.x + VIEW_W + 40, world.h)
    ctx.closePath()
    ctx.fill()

    const skin = ctx.createLinearGradient(0, y - 8, 0, y + 36)
    skin.addColorStop(0, 'rgba(180, 255, 90, 0.95)')
    skin.addColorStop(0.35, 'rgba(90, 220, 40, 0.7)')
    skin.addColorStop(1, 'rgba(20, 80, 20, 0)')
    ctx.fillStyle = skin
    ctx.fillRect(cam.x - 40, y - 10, VIEW_W + 80, 48)

    ctx.fillStyle = 'rgba(220, 255, 140, 0.55)'
    for (let x = start; x < cam.x + VIEW_W + 40; x += 38) {
      const wy = y + Math.sin(x * 0.08 + time * 2.4) * 4
      ctx.beginPath()
      ctx.ellipse(x, wy, 11, 3, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawToxicVeil(world: World, cam: Camera) {
    const ctx = this.ctx
    const sludgeScreen = world.killY - cam.y
    if (sludgeScreen > VIEW_H + 80) return
    const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H, 40, VIEW_W / 2, VIEW_H, VIEW_H)
    g.addColorStop(0, 'rgba(90, 255, 50, 0.14)')
    g.addColorStop(1, 'rgba(90, 255, 50, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  }

  private drawPlatforms(world: World, cam: Camera) {
    for (const p of world.platforms) {
      if (p.x > cam.x + VIEW_W + 90 || p.x + p.w < cam.x - 90) continue
      if (p.type === 'oneway') this.drawHangingPipe(p)
      else if (p.h > p.w * 1.35) this.drawRiser(p)
      else if (p.h > 36 && p.w > 70) this.drawBrickLedge(p)
      else this.drawRustyPipe(p)
    }
  }

  private drawBrickLedge(p: Platform) {
    const ctx = this.ctx
    const bw = 46
    const bh = 24
    ctx.fillStyle = '#14110e'
    ctx.fillRect(p.x, p.y + 18, p.w, Math.max(8, p.h - 18))
    const rows = Math.max(1, Math.ceil((p.h - 8) / bh))
    const cols = Math.ceil(p.w / bw) + 1
    for (let r = 0; r < rows; r++) {
      const ox = r % 2 === 0 ? 0 : bw * 0.45
      for (let c = -1; c < cols; c++) {
        const x = p.x + c * bw + ox
        const y = p.y + 16 + r * bh
        if (y > p.y + p.h - 4) continue
        const tile = this.brickTile[(Math.abs((p.x * 3 + r * 7 + c) | 0) % this.brickTile.length)]
        ctx.save()
        ctx.beginPath()
        ctx.rect(p.x, p.y + 16, p.w, p.h - 16)
        ctx.clip()
        ctx.drawImage(tile, x, y, bw - 3, bh - 3)
        ctx.restore()
      }
    }
    this.drawRustyPipe({ ...p, h: 22, y: p.y })
    const bounce = ctx.createLinearGradient(0, p.y + p.h - 50, 0, p.y + p.h)
    bounce.addColorStop(0, 'rgba(90,255,50,0)')
    bounce.addColorStop(1, 'rgba(90,255,50,0.18)')
    ctx.fillStyle = bounce
    ctx.fillRect(p.x, p.y + p.h - 50, p.w, 50)
  }

  private drawRustyPipe(p: Platform) {
    const ctx = this.ctx
    const h = Math.min(24, Math.max(16, p.h))
    const body = ctx.createLinearGradient(0, p.y, 0, p.y + h)
    body.addColorStop(0, '#8a9098')
    body.addColorStop(0.22, '#d5d8de')
    body.addColorStop(0.48, '#6a7078')
    body.addColorStop(0.78, '#3a3e44')
    body.addColorStop(1, '#1c1e22')
    ctx.fillStyle = body
    roundRect(ctx, p.x, p.y, p.w, h, h / 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    roundRect(ctx, p.x + 10, p.y + 3, p.w * 0.4, 4, 2)
    ctx.fill()

    const rngOff = hash(p.x, p.y)
    for (let i = 0; i < 4; i++) {
      const rx = p.x + 20 + ((rngOff * 97 + i * 73) % Math.max(8, p.w - 40))
      ctx.fillStyle = i % 2 === 0 ? 'rgba(140, 60, 28, 0.55)' : 'rgba(90, 40, 18, 0.4)'
      ctx.beginPath()
      ctx.ellipse(rx, p.y + 8 + (i % 3), 10 + (i % 3) * 3, 4, 0.2, 0, Math.PI * 2)
      ctx.fill()
    }

    for (let x = p.x + 26; x < p.x + p.w - 14; x += 58) {
      ctx.fillStyle = '#2c3036'
      ctx.fillRect(x - 5, p.y - 4, 10, h + 8)
      ctx.fillStyle = '#9aa0a8'
      ctx.fillRect(x - 4, p.y - 2, 8, 3)
      this.bolt(x, p.y + 4)
      this.bolt(x, p.y + h - 4)
    }

    this.pipeCap(p.x, p.y + h / 2)
    this.pipeCap(p.x + p.w, p.y + h / 2)

    ctx.fillStyle = 'rgba(90, 255, 50, 0.12)'
    ctx.fillRect(p.x, p.y + h - 6, p.w, 6)
  }

  private drawRiser(p: Platform) {
    const ctx = this.ctx
    const body = ctx.createLinearGradient(p.x, 0, p.x + p.w, 0)
    body.addColorStop(0, '#1c1e22')
    body.addColorStop(0.28, '#c4c8ce')
    body.addColorStop(0.5, '#6a7078')
    body.addColorStop(0.8, '#3a3e44')
    body.addColorStop(1, '#141618')
    ctx.fillStyle = body
    roundRect(ctx, p.x, p.y, p.w, p.h, Math.min(12, p.w / 2))
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.16)'
    ctx.fillRect(p.x + 5, p.y + 8, 4, p.h - 16)
    for (let y = p.y + 20; y < p.y + p.h - 14; y += 44) {
      ctx.fillStyle = '#2a2e34'
      ctx.fillRect(p.x - 5, y, p.w + 10, 10)
      ctx.fillStyle = '#8a9098'
      ctx.fillRect(p.x - 4, y + 1, p.w + 8, 2)
      this.bolt(p.x + 4, y + 5)
      this.bolt(p.x + p.w - 4, y + 5)
    }
    ctx.fillStyle = 'rgba(120, 50, 20, 0.4)'
    ctx.beginPath()
    ctx.ellipse(p.x + p.w * 0.45, p.y + p.h * 0.4, p.w * 0.28, 18, 0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(90,255,50,0.1)'
    ctx.fillRect(p.x, p.y + p.h - 40, p.w, 40)
  }

  private drawHangingPipe(p: Platform) {
    const ctx = this.ctx
    const body = ctx.createLinearGradient(0, p.y, 0, p.y + 14)
    body.addColorStop(0, '#c8ccd2')
    body.addColorStop(0.5, '#6a7078')
    body.addColorStop(1, '#2a2e34')
    ctx.fillStyle = body
    roundRect(ctx, p.x, p.y, p.w, 14, 7)
    ctx.fill()
    ctx.strokeStyle = '#5a5048'
    ctx.lineWidth = 2
    for (let x = p.x + 12; x < p.x + p.w; x += 22) {
      ctx.beginPath()
      ctx.moveTo(x, p.y + 14)
      ctx.lineTo(x - 2, p.y + 28)
      ctx.stroke()
    }
  }

  private pipeCap(x: number, y: number) {
    const ctx = this.ctx
    const g = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, 12)
    g.addColorStop(0, '#e8eaee')
    g.addColorStop(0.4, '#8a9098')
    g.addColorStop(1, '#1c1e22')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#121416'
    ctx.beginPath()
    ctx.arc(x, y, 4.2, 0, Math.PI * 2)
    ctx.fill()
  }

  private bolt(x: number, y: number) {
    const ctx = this.ctx
    ctx.fillStyle = '#c4c0b4'
    ctx.beginPath()
    ctx.arc(x, y, 2.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#3a3a32'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x - 1.3, y)
    ctx.lineTo(x + 1.3, y)
    ctx.stroke()
  }

  private drawProps(world: World) {
    for (const prop of world.props) this.drawProp(prop)
  }

  private drawProp(prop: Prop) {
    const ctx = this.ctx
    ctx.save()
    ctx.translate(prop.x, prop.y)
    if (prop.kind === 'vent') this.drawVent()
    else if (prop.kind === 'tank') this.drawTank()
    else if (prop.kind === 'antenna') this.drawStack()
    else if (prop.kind === 'crane') this.drawCrane()
    else if (prop.kind === 'barrel') this.drawBarrel(false)
    else if (prop.kind === 'barrelTip') this.drawBarrel(true)
    else if (prop.kind === 'shroom') this.drawShroom()
    else this.drawWeb()
    ctx.restore()
  }

  private drawVent() {
    const ctx = this.ctx
    const g = ctx.createLinearGradient(0, -32, 0, 0)
    g.addColorStop(0, '#6a7068')
    g.addColorStop(1, '#2a2e28')
    ctx.fillStyle = g
    roundRect(ctx, 0, -32, 56, 32, 4)
    ctx.fill()
    ctx.fillStyle = '#0e100e'
    for (let i = 0; i < 4; i++) ctx.fillRect(8 + i * 12, -24, 8, 18)
    ctx.fillStyle = '#8a9090'
    ctx.fillRect(0, -32, 56, 4)
  }

  private drawTank() {
    const ctx = this.ctx
    const g = ctx.createLinearGradient(0, -64, 58, 0)
    g.addColorStop(0, '#4a6a38')
    g.addColorStop(1, '#1c2418')
    ctx.fillStyle = g
    roundRect(ctx, 0, -64, 58, 64, 10)
    ctx.fill()
    this.hazmat(29, -34, 15)
    ctx.fillStyle = '#2a2e28'
    ctx.fillRect(25, -64, 8, 10)
  }

  private drawStack() {
    const ctx = this.ctx
    const g = ctx.createLinearGradient(0, -110, 18, 0)
    g.addColorStop(0, '#9aa0a8')
    g.addColorStop(1, '#2a2e34')
    ctx.fillStyle = g
    roundRect(ctx, 2, -110, 16, 110, 8)
    ctx.fill()
    ctx.fillStyle = TOXIC
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.arc(10, -114, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  private drawCrane() {
    const ctx = this.ctx
    ctx.fillStyle = '#3a3e38'
    roundRect(ctx, 0, -16, 90, 16, 3)
    ctx.fill()
    ctx.fillStyle = '#5a4030'
    ctx.fillRect(70, -78, 12, 78)
    ctx.strokeStyle = '#8a9098'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(76, -74)
    ctx.lineTo(-6, -74)
    ctx.stroke()
  }

  private drawBarrel(tipped: boolean) {
    const ctx = this.ctx
    ctx.save()
    if (tipped) {
      ctx.translate(18, -6)
      ctx.rotate(1.15)
    }
    const g = ctx.createLinearGradient(0, -44, 28, 0)
    g.addColorStop(0, tipped ? '#6a3a28' : '#3a5a28')
    g.addColorStop(1, '#1a1814')
    ctx.fillStyle = g
    roundRect(ctx, 0, -46, 28, 46, 6)
    ctx.fill()
    ctx.fillStyle = '#d8c84a'
    ctx.fillRect(0, -30, 28, 10)
    this.hazmat(14, -25, 7)
    ctx.restore()
    if (tipped) {
      ctx.fillStyle = TOXIC
      ctx.globalAlpha = 0.75
      ctx.beginPath()
      ctx.ellipse(36, -2, 16, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  private hazmat(x: number, y: number, r: number) {
    const ctx = this.ctx
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#d8c84a'
    ctx.beginPath()
    ctx.arc(x, y, r * 0.28, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#d8c84a'
    ctx.lineWidth = Math.max(1.5, r * 0.22)
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + i * ((Math.PI * 2) / 3)
      ctx.beginPath()
      ctx.arc(x, y, r * 0.72, a - 0.45, a + 0.45)
      ctx.stroke()
    }
  }

  private drawShroom() {
    const ctx = this.ctx
    ctx.fillStyle = '#9ef0ff'
    ctx.shadowColor = '#6af0ff'
    ctx.shadowBlur = 12
    ctx.beginPath()
    ctx.ellipse(8, -16, 10, 7, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(20, -12, 7, 5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#d8fbff'
    ctx.fillRect(6, -12, 3, 12)
    ctx.fillRect(18, -9, 3, 9)
  }

  private drawWeb() {
    const ctx = this.ctx
    ctx.strokeStyle = 'rgba(230, 230, 210, 0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, -40)
    ctx.lineTo(36, 0)
    ctx.moveTo(8, -40)
    ctx.lineTo(28, 0)
    ctx.moveTo(0, -28)
    ctx.lineTo(22, -4)
    ctx.stroke()
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
        g.addColorStop(0.5, '#6a6058')
        g.addColorStop(1, '#3a3028')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(x + 1, s.y + s.h)
        ctx.lineTo(x + w * 0.5, s.y - 3)
        ctx.lineTo(x + w - 1, s.y + s.h)
        ctx.closePath()
        ctx.fill()
      }
      ctx.fillStyle = 'rgba(90,255,50,0.25)'
      ctx.fillRect(s.x, s.y + s.h - 4, s.w, 8)
    }
  }

  private drawOrbs(world: World, time: number) {
    const ctx = this.ctx
    for (const o of world.orbs) {
      if (o.got) continue
      const bob = Math.sin(time * 3 + o.x * 0.02) * 4
      const x = o.x + o.w / 2
      const y = o.y + o.h / 2 + bob
      ctx.fillStyle = 'rgba(180, 255, 70, 0.18)'
      ctx.beginPath()
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#c49a30'
      ctx.beginPath()
      ctx.ellipse(x, y + 1, 8.5, 6, -0.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f0d878'
      ctx.beginPath()
      ctx.ellipse(x - 0.5, y - 0.8, 7, 5, -0.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff6c8'
      ctx.beginPath()
      ctx.ellipse(x - 2.5, y - 2.2, 2.4, 1.6, -0.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawCheckpoints(world: World, time: number) {
    const ctx = this.ctx
    for (const c of world.checkpoints) {
      const lit = c.armed
      ctx.fillStyle = '#2a2e28'
      roundRect(ctx, c.x + 6, c.y, 14, c.h, 3)
      ctx.fill()
      ctx.fillStyle = lit ? TOXIC : '#6a7a50'
      ctx.globalAlpha = lit ? 0.95 : 0.5 + Math.sin(time * 2.2) * 0.12
      ctx.shadowColor = lit ? TOXIC : 'transparent'
      ctx.shadowBlur = lit ? 16 : 0
      ctx.beginPath()
      ctx.arc(c.x + 13, c.y + 14, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(c.x + 13, c.y + 14, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawGoal(world: World, time: number) {
    const ctx = this.ctx
    const g = world.goal
    const pulse = 0.5 + Math.sin(time * 3) * 0.2
    ctx.save()
    ctx.translate(g.x, g.y)
    const metal = ctx.createLinearGradient(0, 0, g.w, g.h)
    metal.addColorStop(0, '#8a9098')
    metal.addColorStop(1, '#1c1e22')
    ctx.fillStyle = metal
    roundRect(ctx, 0, 0, g.w, g.h, 10)
    ctx.fill()
    ctx.fillStyle = `rgba(20, 40, 12, ${0.55 + pulse * 0.2})`
    ctx.beginPath()
    ctx.arc(g.w / 2, g.h / 2 + 4, 22, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = `rgba(124, 255, 58, ${0.2 + pulse * 0.25})`
    ctx.beginPath()
    ctx.arc(g.w / 2, g.h / 2 + 4, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#9aa0a8'
    ctx.lineWidth = 2
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(g.w / 2 + i * 7, g.h / 2 - 14)
      ctx.lineTo(g.w / 2 + i * 7, g.h / 2 + 22)
      ctx.stroke()
    }
    ctx.fillStyle = '#e8f8d0'
    ctx.font = '700 12px Rajdhani, sans-serif'
    ctx.fillText('OUT', 24, 18)
    ctx.restore()
  }

  private drawSigns(world: World) {
    const ctx = this.ctx
    ctx.font = '600 15px Rajdhani, sans-serif'
    for (const s of world.signs) {
      const w = ctx.measureText(s.text).width
      ctx.fillStyle = 'rgba(12, 18, 12, 0.78)'
      roundRect(ctx, s.x - 10, s.y - 18, w + 20, 26, 4)
      ctx.fill()
      ctx.strokeStyle = 'rgba(124, 255, 58, 0.28)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = 'rgba(210, 255, 180, 0.92)'
      ctx.fillText(s.text, s.x, s.y)
    }
  }

  private drawParticles(particles: Particles) {
    const ctx = this.ctx
    for (const p of particles.items) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawPlayer(player: Player, time: number) {
    const ctx = this.ctx
    for (const g of player.ghosts) {
      ctx.globalAlpha = Math.max(0, g.life * 1.5)
      ctx.fillStyle = '#4a6a20'
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
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.beginPath()
    ctx.ellipse(0, h * 0.28, 14, 4.5, 0, 0, Math.PI * 2)
    ctx.fill()
    if (climb) ctx.rotate((player.onWall * Math.PI) / 2)
    ctx.scale(player.facing * 1.95, 1.95)
    drawRoach(ctx, gait, time, air || player.dashing, player.sliding)
    ctx.restore()
  }

  private drawVignette() {
    const ctx = this.ctx
    const g = ctx.createRadialGradient(
      VIEW_W / 2,
      VIEW_H / 2,
      VIEW_H * 0.14,
      VIEW_W / 2,
      VIEW_H / 2,
      VIEW_H * 0.88,
    )
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(4, 8, 4, 0.62)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  }
}

function drawRoach(
  ctx: CanvasRenderingContext2D,
  gait: number,
  time: number,
  wingsOpen: boolean,
  sliding: boolean,
) {
  ctx.scale(1, sliding ? 0.72 : 1)
  ctx.lineCap = 'round'
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

  ctx.fillStyle = '#1a1008'
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
  abdomen.addColorStop(0.5, '#4a2c12')
  abdomen.addColorStop(1, '#1e1208')
  ctx.fillStyle = abdomen
  ctx.beginPath()
  ctx.ellipse(-4, 0, 15, 9.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(90, 255, 50, 0.12)'
  ctx.beginPath()
  ctx.ellipse(-4, 6, 12, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(20, 10, 4, 0.55)'
  ctx.lineWidth = 1
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.ellipse(-8 + i * 3.2, 0, 3.2, 8.2 - i * 0.4, 0, 0.15, Math.PI - 0.15)
    ctx.stroke()
  }

  const open = wingsOpen ? 0.35 : 0.08
  ctx.fillStyle = '#6a4018'
  ctx.beginPath()
  ctx.ellipse(-1, -3.5 - open * 4, 11, 5.2, -0.15 - open, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(-1, 3.5 + open * 4, 11, 5.2, 0.15 + open, 0, Math.PI * 2)
  ctx.fill()

  const thorax = ctx.createRadialGradient(8, -2, 1, 7, 0, 8)
  thorax.addColorStop(0, '#c48a48')
  thorax.addColorStop(1, '#3a2010')
  ctx.fillStyle = thorax
  ctx.beginPath()
  ctx.ellipse(7, 0, 7.5, 7.2, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#8a5a28'
  ctx.beginPath()
  ctx.ellipse(14.5, 0, 5.4, 4.6, 0, 0, Math.PI * 2)
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
  ctx.lineWidth = 2.6
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(midX, midY)
  ctx.lineTo(footX, footY)
  ctx.stroke()
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

function bakeBrickTile(seed: number) {
  const c = document.createElement('canvas')
  c.width = 56
  c.height = 30
  const ctx = c.getContext('2d')
  if (!ctx) return c
  const rng = mulberry(seed)
  const base = 40 + rng() * 18
  ctx.fillStyle = `rgb(${base + 18},${base + 8},${base - 6})`
  roundRect(ctx, 1, 1, 54, 28, 6)
  ctx.fill()
  const g = ctx.createLinearGradient(0, 0, 0, 30)
  g.addColorStop(0, 'rgba(255,255,230,0.22)')
  g.addColorStop(0.4, 'rgba(255,255,255,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.38)')
  ctx.fillStyle = g
  roundRect(ctx, 1, 1, 54, 28, 6)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  ctx.fillRect(4, 3, 22, 3)
  if (rng() > 0.55) {
    ctx.fillStyle = 'rgba(50, 90, 40, 0.28)'
    ctx.beginPath()
    ctx.ellipse(18 + rng() * 16, 16, 10, 4, 0.2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 1.5
  roundRect(ctx, 1, 1, 54, 28, 6)
  ctx.stroke()
  return c
}

function bakeBrickWall(tiles: HTMLCanvasElement[]) {
  const c = document.createElement('canvas')
  c.width = VIEW_W
  c.height = VIEW_H
  const ctx = c.getContext('2d')
  if (!ctx) return c
  ctx.fillStyle = '#0c0e0c'
  ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  const bw = 52
  const bh = 26
  for (let row = 0; row < VIEW_H / bh + 1; row++) {
    const ox = row % 2 === 0 ? 0 : bw * 0.5
    for (let col = -1; col < VIEW_W / bw + 2; col++) {
      const tile = tiles[Math.abs(row * 3 + col) % tiles.length]
      ctx.drawImage(tile, col * bw + ox, row * bh, bw - 4, bh - 4)
    }
  }
  const wash = ctx.createLinearGradient(0, 0, 0, VIEW_H)
  wash.addColorStop(0, 'rgba(0,0,0,0.35)')
  wash.addColorStop(0.5, 'rgba(0,0,0,0.1)')
  wash.addColorStop(1, 'rgba(40, 120, 30, 0.18)')
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  return c
}

function bakeFarPipes() {
  const c = document.createElement('canvas')
  c.width = VIEW_W + 420
  c.height = VIEW_H
  const ctx = c.getContext('2d')
  if (!ctx) return c
  const rng = mulberry(11)
  let x = -20
  while (x < c.width) {
    const w = 16 + rng() * 34
    const h = 150 + rng() * 300
    const g = ctx.createLinearGradient(x, 0, x + w, 0)
    g.addColorStop(0, '#121614')
    g.addColorStop(0.4, '#3a403c')
    g.addColorStop(1, '#0e100e')
    ctx.fillStyle = g
    const y = VIEW_H - h
    roundRect(ctx, x, y, w, h + 50, Math.min(8, w / 2))
    ctx.fill()
    x += 30 + rng() * 40
  }
  return c
}

function makeSpores() {
  const rng = mulberry(19)
  const list: { x: number; y: number; s: number; z: number }[] = []
  for (let i = 0; i < 48; i++) {
    list.push({ x: rng() * VIEW_W, y: rng() * VIEW_H, s: 0.8 + rng() * 2.2, z: 0.4 + rng() * 0.8 })
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
