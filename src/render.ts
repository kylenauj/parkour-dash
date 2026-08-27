import { DASH_TIME, VIEW_H, VIEW_W } from './const'
import { bakePixels, crisp, PX, prect, snap } from './pixel'
import type { Camera } from './camera'
import type { Particles } from './particles'
import type { Player } from './player'
import type { Platform, World } from './world'

const PAL = {
  a: '#2a1a0c',
  A: '#4a3020',
  H: '#6b3a18',
  h: '#9a5a28',
  D: '#3a1e0c',
  E: '#f0e8c8',
  o: '#111008',
  C: '#efe4c8',
  F: '#ff6a20',
  B: '#1a2418',
  b: '#314838',
  P: '#4a3020',
  L: '#2a1a10',
  S: '#140e08',
  W: '#5a3010',
  m: '#8a6828',
  M: '#f0d878',
  v: '#fff4c0',
} as const

export class Renderer {
  private idle: HTMLCanvasElement
  private run: HTMLCanvasElement[]
  private jump: HTMLCanvasElement
  private slide: HTMLCanvasElement
  private wall: HTMLCanvasElement
  private dash: HTMLCanvasElement
  private layerFar: HTMLCanvasElement
  private layerMid: HTMLCanvasElement
  private layerNear: HTMLCanvasElement
  private layerFore: HTMLCanvasElement
  private brick: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    crisp(ctx)
    this.idle = bakeRoach(idleRows, 3)
    this.run = [runA, runB, runC, runB].map((rows) => bakeRoach(rows, 3))
    this.jump = bakeRoach(jumpRows, 3)
    this.slide = bakeRoach(slideRows, 3)
    this.wall = bakeRoach(wallRows, 3)
    this.dash = bakeRoach(dashRows, 3)
    this.brick = bakeBrick()
    this.layerFar = bakeFar()
    this.layerMid = bakeMid()
    this.layerNear = bakeNear()
    this.layerFore = bakeFore()
  }

  draw(world: World, player: Player, cam: Camera, particles: Particles, time: number) {
    const ctx = this.ctx
    crisp(ctx)
    ctx.clearRect(0, 0, VIEW_W, VIEW_H)

    this.drawLayers(cam, time)

    ctx.save()
    ctx.translate(-snap(cam.x) + snap(cam.offset().x), -snap(cam.y) + snap(cam.offset().y))
    this.drawSludge(world, cam, time)
    this.drawPlatforms(world, cam)
    this.drawProps(world)
    this.drawSpikes(world)
    this.drawOrbs(world, time)
    this.drawCheckpoints(world, time)
    this.drawGoal(world, time)
    this.drawSigns(world)
    this.drawSmoke(player)
    this.drawParticles(particles)
    this.drawPlayer(player)
    ctx.restore()

    this.blit(this.layerFore, -((cam.x * 1.12) % (VIEW_W + 200)), 0, 0.55)
    this.scanlines()
    this.vignette()
  }

  private drawLayers(cam: Camera, time: number) {
    const ctx = this.ctx
    ctx.fillStyle = '#070b08'
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H)
    g.addColorStop(0, '#0b100e')
    g.addColorStop(0.6, '#102014')
    g.addColorStop(1, '#0a2a10')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    this.dither()
    this.blit(this.layerFar, -((cam.x * 0.08) % (VIEW_W + 320)), 40, 0.7)
    this.blit(this.layerMid, -((cam.x * 0.18) % (VIEW_W + 320)), 20, 0.85)
    this.blit(this.layerNear, -((cam.x * 0.32) % (VIEW_W + 200)), 0, 1)

    const bounce = ctx.createLinearGradient(0, VIEW_H * 0.5, 0, VIEW_H)
    bounce.addColorStop(0, 'rgba(80,255,50,0)')
    bounce.addColorStop(1, 'rgba(80,255,50,0.16)')
    ctx.fillStyle = bounce
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    this.sporeField(cam, time)
  }

  private blit(sheet: HTMLCanvasElement, x: number, y: number, alpha: number) {
    const ctx = this.ctx
    ctx.globalAlpha = alpha
    const sx = snap(x)
    ctx.drawImage(sheet, sx, snap(y))
    ctx.drawImage(sheet, sx + sheet.width, snap(y))
    ctx.globalAlpha = 1
  }

  private dither() {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    for (let y = 0; y < VIEW_H; y += PX * 2) {
      for (let x = y % (PX * 4) === 0 ? 0 : PX; x < VIEW_W; x += PX * 2) {
        ctx.fillRect(x, y, PX, PX)
      }
    }
  }

  private sporeField(cam: Camera, time: number) {
    const ctx = this.ctx
    ctx.fillStyle = '#7cff3a'
    for (let i = 0; i < 36; i++) {
      const x = snap(((i * 97 + time * 18 - cam.x * 0.25) % (VIEW_W + 20) + VIEW_W + 20) % (VIEW_W + 20))
      const y = snap((i * 53 + Math.sin(time + i) * 20) % VIEW_H)
      ctx.globalAlpha = 0.25 + (i % 3) * 0.12
      ctx.fillRect(x, y, PX, PX)
    }
    ctx.globalAlpha = 1
  }

  private drawSludge(world: World, cam: Camera, time: number) {
    const ctx = this.ctx
    const y = snap(world.killY - 24)
    prect(ctx, cam.x - 20, y - 80, VIEW_W + 40, world.h - y + 120, 'rgba(40,140,30,0.28)')
    const start = snap(cam.x - 16)
    for (let x = start; x < cam.x + VIEW_W + 32; x += PX) {
      const wave = Math.floor(Math.sin(x * 0.04 + time * 2.4) * 2) * PX
      prect(ctx, x, y + wave - 8, PX, 12, '#b6ff4a')
      prect(ctx, x, y + wave, PX, 28, '#7cff3a')
      prect(ctx, x, y + wave + 16, PX, 80, '#1a5a12')
    }
  }

  private drawPlatforms(world: World, cam: Camera) {
    for (const p of world.platforms) {
      if (p.x > cam.x + VIEW_W + 80 || p.x + p.w < cam.x - 80) continue
      if (p.type === 'oneway') this.pipe(p.x, p.y, p.w, 12, true)
      else if (p.h > p.w * 1.35) this.riser(p)
      else if (p.h > 36 && p.w > 70) this.brickLedge(p)
      else this.pipe(p.x, p.y, p.w, 20, false)
    }
  }

  private brickLedge(p: Platform) {
    const ctx = this.ctx
    const tw = this.brick.width
    const th = this.brick.height
    for (let y = snap(p.y + 16); y < p.y + p.h; y += th) {
      const row = Math.floor((y - p.y) / th)
      const ox = row % 2 === 0 ? 0 : tw / 2
      for (let x = snap(p.x) - ox; x < p.x + p.w; x += tw) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(snap(p.x), snap(p.y + 16), snap(p.w), snap(p.h - 16))
        ctx.clip()
        ctx.drawImage(this.brick, x, y)
        ctx.restore()
      }
    }
    this.pipe(p.x, p.y, p.w, 20, false)
    prect(ctx, p.x, p.y + p.h - 16, p.w, 16, 'rgba(80,255,50,0.12)')
  }

  private pipe(x: number, y: number, w: number, h: number, hang: boolean) {
    prect(this.ctx, x, y, w, h, '#5a626a')
    prect(this.ctx, x, y, w, PX, '#c4ccd4')
    prect(this.ctx, x, y + PX, w, PX, '#8a929a')
    prect(this.ctx, x, y + h - PX, w, PX, '#2a2e32')
    for (let i = x + 24; i < x + w - 8; i += 56) {
      prect(this.ctx, i, y - PX, PX * 2, h + PX * 2, '#3a3e44')
      prect(this.ctx, i, y + PX, PX * 2, PX, '#d0d4d8')
    }
    for (let i = 0; i < 5; i++) {
      const rx = x + 16 + ((hash(x, y) * 80 + i * 37) % Math.max(8, w - 32))
      prect(this.ctx, rx, y + PX * (1 + (i % 2)), PX * 2, PX, '#8a3a18')
    }
    if (hang) {
      for (let i = x + 12; i < x + w; i += 20) prect(this.ctx, i, y + h, PX, 12, '#4a4038')
    }
  }

  private riser(p: Platform) {
    prect(this.ctx, p.x, p.y, p.w, p.h, '#4a5258')
    prect(this.ctx, p.x, p.y, PX, p.h, '#c4ccd4')
    prect(this.ctx, p.x + p.w - PX, p.y, PX, p.h, '#1c2024')
    for (let y = p.y + 16; y < p.y + p.h - 8; y += 40) {
      prect(this.ctx, p.x - PX, y, p.w + PX * 2, PX * 2, '#2e3238')
      prect(this.ctx, p.x, y, PX, PX, '#d0d4d8')
    }
    prect(this.ctx, p.x + PX * 2, p.y + p.h * 0.4, PX * 3, PX * 4, '#8a3a18')
  }

  private drawProps(world: World) {
    for (const prop of world.props) {
      const ctx = this.ctx
      ctx.save()
      ctx.translate(snap(prop.x), snap(prop.y))
      if (prop.kind === 'barrel' || prop.kind === 'barrelTip') this.pixelBarrel(prop.kind === 'barrelTip')
      else if (prop.kind === 'shroom') this.pixelShroom()
      else if (prop.kind === 'web') this.pixelWeb()
      else if (prop.kind === 'vent') this.pixelVent()
      else if (prop.kind === 'tank') this.pixelTank()
      else if (prop.kind === 'antenna') this.pixelStack()
      else this.pixelCrane()
      ctx.restore()
    }
  }

  private pixelBarrel(tip: boolean) {
    const ctx = this.ctx
    if (tip) {
      prect(ctx, 4, -18, 36, 16, '#3a5a28')
      prect(ctx, 8, -14, 28, 8, '#d8c84a')
      prect(ctx, 36, -8, 16, 8, '#7cff3a')
    } else {
      prect(ctx, 0, -40, 24, 40, '#3a5a28')
      prect(ctx, 0, -28, 24, 8, '#d8c84a')
      prect(ctx, 8, -26, 8, 4, '#111')
      prect(ctx, 0, -40, 24, PX, '#8aaa70')
    }
  }

  private pixelShroom() {
    prect(this.ctx, 2, -16, 16, 8, '#7ee8ff')
    prect(this.ctx, 6, -8, 4, 8, '#d8fbff')
    prect(this.ctx, 16, -12, 10, 6, '#7ee8ff')
  }

  private pixelWeb() {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(230,230,210,0.4)'
    for (let i = 0; i < 6; i++) ctx.fillRect(i * 4, -36 + i * 6, PX, PX)
    for (let i = 0; i < 5; i++) ctx.fillRect(4 + i * 4, -28 + i * 4, PX, PX)
  }

  private pixelVent() {
    prect(this.ctx, 0, -28, 48, 28, '#3a403c')
    for (let i = 0; i < 4; i++) prect(this.ctx, 6 + i * 10, -22, 6, 16, '#0e100e')
  }

  private pixelTank() {
    prect(this.ctx, 0, -56, 48, 56, '#2a4a22')
    prect(this.ctx, 8, -40, 32, 24, '#d8c84a')
    prect(this.ctx, 20, -30, 8, 8, '#111')
  }

  private pixelStack() {
    prect(this.ctx, 4, -96, 12, 96, '#5a626a')
    prect(this.ctx, 4, -96, 12, PX, '#c4ccd4')
    prect(this.ctx, 2, -104, 16, 8, '#7cff3a')
  }

  private pixelCrane() {
    prect(this.ctx, 0, -12, 80, 12, '#3a3e38')
    prect(this.ctx, 64, -72, 10, 72, '#5a4030')
    prect(this.ctx, -4, -72, 78, 4, '#8a9098')
  }

  private drawSpikes(world: World) {
    for (const s of world.spikes) {
      for (let x = 0; x < s.w; x += PX * 3) {
        prect(this.ctx, s.x + x, s.y + 8, PX, 10, '#8a8078')
        prect(this.ctx, s.x + x, s.y, PX, 10, '#d0d4cc')
      }
      prect(this.ctx, s.x, s.y + s.h - 4, s.w, 8, 'rgba(80,255,50,0.25)')
    }
  }

  private drawOrbs(world: World, time: number) {
    for (const o of world.orbs) {
      if (o.got) continue
      const bob = snap(Math.sin(time * 3 + o.x) * 4)
      prect(this.ctx, o.x, o.y + bob, 16, 12, '#c49a30')
      prect(this.ctx, o.x + 4, o.y + bob + 4, 8, 4, '#ffe08a')
      prect(this.ctx, o.x + 4, o.y + bob, 4, 4, '#fff6c8')
    }
  }

  private drawCheckpoints(world: World, time: number) {
    for (const c of world.checkpoints) {
      prect(this.ctx, c.x + 8, c.y, 8, c.h, '#2a2e28')
      const on = c.armed || Math.sin(time * 3) > 0
      prect(this.ctx, c.x + 4, c.y + 4, 16, 16, c.armed || on ? '#7cff3a' : '#4a5a30')
      prect(this.ctx, c.x + 8, c.y + 8, 8, 8, '#111')
    }
  }

  private drawGoal(world: World, time: number) {
    const g = world.goal
    prect(this.ctx, g.x, g.y, g.w, g.h, '#3a3e44')
    const pulse = Math.sin(time * 4) > 0
    prect(this.ctx, g.x + 12, g.y + 16, g.w - 24, g.h - 32, pulse ? '#7cff3a' : '#1a5a12')
    for (let i = 0; i < 5; i++) prect(this.ctx, g.x + 16 + i * 8, g.y + 20, PX, g.h - 40, '#111')
  }

  private drawSigns(world: World) {
    const ctx = this.ctx
    ctx.font = '10px "Press Start 2P", monospace'
    ctx.imageSmoothingEnabled = false
    for (const s of world.signs) {
      const w = ctx.measureText(s.text).width
      prect(ctx, s.x - 8, s.y - 16, w + 16, 20, '#0c140c')
      ctx.fillStyle = '#c8ff90'
      ctx.fillText(s.text, snap(s.x), snap(s.y))
    }
  }

  private drawSmoke(player: Player) {
    const ctx = this.ctx
    for (const s of player.smoke) {
      const a = Math.max(0, s.life / s.max)
      ctx.globalAlpha = a * 0.7
      const col = a > 0.55 ? '#efe8dc' : a > 0.3 ? '#9a968c' : '#5a5854'
      prect(ctx, s.x, s.y, s.size, s.size, col)
    }
    ctx.globalAlpha = 1
  }

  private drawParticles(particles: Particles) {
    const ctx = this.ctx
    for (const p of particles.items) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      prect(ctx, p.x, p.y, Math.max(PX, p.size), Math.max(PX, p.size), p.color)
    }
    ctx.globalAlpha = 1
  }

  private drawPlayer(player: Player) {
    const ctx = this.ctx
    crisp(ctx)
    let spr = this.idle
    if (player.dashing) spr = this.dash
    else if (player.sliding) spr = this.slide
    else if (player.onWall && !player.onGround) spr = this.wall
    else if (!player.onGround) spr = this.jump
    else if (Math.abs(player.vx) > 40) {
      const f = Math.floor(Math.abs(player.x) / 14) % this.run.length
      spr = this.run[f]
    }

    for (const g of player.ghosts) {
      ctx.globalAlpha = Math.max(0, g.life * 1.6)
      this.drawDashWingsAt(g.x + player.w / 2, g.y + g.h * 0.42, player, 0.45 + g.life)
      ctx.save()
      ctx.translate(snap(g.x + player.w / 2), snap(g.y + g.h))
      ctx.scale(player.facing, 1)
      ctx.drawImage(this.dash, -Math.floor(this.dash.width * 0.42), -this.dash.height + 4)
      ctx.restore()
    }
    ctx.globalAlpha = 1

    if (player.dashing) this.drawDashWings(player)

    const px = snap(player.cx)
    const py = snap(player.bottom)
    ctx.save()
    ctx.translate(px, py)
    ctx.scale(player.facing, 1)
    const ox = player.dashing ? 0.42 : 0.45
    ctx.drawImage(spr, -Math.floor(spr.width * ox), -spr.height + 4)
    ctx.restore()

    if (!player.sliding) {
      const flicker = Math.sin(player.x * 0.2) > 0
      prect(ctx, player.mouthX, player.mouthY, PX, PX, flicker ? '#ffee66' : '#ff6a20')
    }
  }

  private drawDashWings(player: Player) {
    this.drawDashWingsAt(player.cx, player.cy + 2, player, 1)
  }

  private drawDashWingsAt(x: number, y: number, player: Player, power: number) {
    const u = 1 - Math.max(0, player.dashT) / DASH_TIME
    const shoot = 1 - (1 - Math.min(1, u * 4.4)) ** 3
    const flap = Math.sin(u * 62) * 0.14
    const span = shoot * power
    const mag = Math.hypot(player.vx, player.vy) || 1
    const back = Math.atan2(player.vy / mag, player.vx / mag) + Math.PI

    this.paintWing(x, y, back - 0.62 + flap, 22 + span * 58, 16 + span * 26, ['#fff4c0', '#f0d878', '#c8a050'], span)
    this.paintWing(x, y, back + 0.62 - flap, 22 + span * 58, 16 + span * 26, ['#fff4c0', '#f0d878', '#c8a050'], span)
    this.paintWing(x, y, back - 0.28 + flap * 0.4, 14 + span * 36, 10 + span * 14, ['#f0d878', '#8a6828', '#5a3010'], span)
    this.paintWing(x, y, back + 0.28 - flap * 0.4, 14 + span * 36, 10 + span * 14, ['#f0d878', '#8a6828', '#5a3010'], span)

    if (u < 0.34 && power >= 0.95) {
      const burst = (1 - u / 0.34) * power
      for (let i = 0; i < 6; i++) {
        const a = back + (i - 2.5) * 0.28
        const d = 10 + burst * 28
        prect(
          this.ctx,
          x + Math.cos(a) * d,
          y + Math.sin(a) * d,
          PX * (i % 2 === 0 ? 2 : 1),
          PX,
          i % 2 === 0 ? '#fff4c0' : '#f0d878',
        )
      }
    }
  }

  private paintWing(
    ox: number,
    oy: number,
    angle: number,
    length: number,
    chord: number,
    colors: string[],
    open: number,
  ) {
    const ctx = this.ctx
    const segs = 8
    const px = Math.cos(angle)
    const py = Math.sin(angle)
    const nx = Math.cos(angle + Math.PI / 2)
    const ny = Math.sin(angle + Math.PI / 2)
    for (let i = 0; i < segs; i++) {
      const t = i / (segs - 1)
      const dist = t * length
      const fan = Math.sin(t * Math.PI) * chord * (0.35 + open * 0.65)
      const w = Math.max(PX, (1 - t * 0.72) * fan)
      const col = colors[Math.min(colors.length - 1, Math.floor(t * colors.length))]
      prect(ctx, ox + px * dist + nx * fan * 0.15 - w / 2, oy + py * dist + ny * fan * 0.15 - PX, w, PX * (t < 0.18 ? 3 : 2), col)
      if (i % 2 === 0) {
        prect(ctx, ox + px * dist - PX / 2, oy + py * dist - PX / 2, PX, PX, '#5a3010')
      }
    }
  }

  private scanlines() {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    for (let y = 0; y < VIEW_H; y += PX * 2) ctx.fillRect(0, y, VIEW_W, PX)
  }

  private vignette() {
    const ctx = this.ctx
    const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, 80, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.85)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  }
}

function bakeRoach(rows: string[], scale: number) {
  return bakePixels(rows, PAL, scale)
}

const idleRows = [
  '......aa..........',
  '.....a..a.........',
  '....HHHHH.........',
  '...HhEoEhH........',
  '...HHEEEHHC.......',
  '....HHHHH.F.......',
  '....WBBBW.........',
  '...BBBBBBB........',
  '..BbBBBBBb........',
  '..B..BBB..b.......',
  '.....BBB..........',
  '....PP.PP.........',
  '....LL.LL.........',
  '....LL.LL.........',
  '....S...S.........',
]

const runA = [
  '......aa..........',
  '.....a..a.........',
  '....HHHHH.........',
  '...HhEoEhH........',
  '...HHEEEHHC.......',
  '....HHHHH.F.......',
  '....WBBBW.........',
  '...BBBBBBB........',
  '..BbBBBBBb........',
  '.L...BBB...L......',
  'L....BBB....L.....',
  '.....PP.PP........',
  '....LL............',
  '...LL.....L.......',
  '...S......S.......',
]

const runB = [
  '......aa..........',
  '.....a..a.........',
  '....HHHHH.........',
  '...HhEoEhH........',
  '...HHEEEHHC.......',
  '....HHHHH.F.......',
  '....WBBBW.........',
  '...BBBBBBB........',
  '..BbBBBBBb........',
  '..B..BBB..b.......',
  '.....BBB..........',
  '....PP.PP.........',
  '....LL.LL.........',
  '....LL.LL.........',
  '....S...S.........',
]

const runC = [
  '......aa..........',
  '.....a..a.........',
  '....HHHHH.........',
  '...HhEoEhH........',
  '...HHEEEHHC.......',
  '....HHHHH.F.......',
  '....WBBBW.........',
  '...BBBBBBB........',
  '..BbBBBBBb........',
  '..L..BBB..L.......',
  '...L.BBB.L........',
  '....PP.PP.........',
  '.....LL...........',
  '....L...LL........',
  '....S...S.........',
]

const jumpRows = [
  '.....aa...........',
  '....a..a..........',
  '...HHHHH..........',
  '..HhEoEhH.........',
  '..HHEEEHHC........',
  '...HHHHH.F........',
  '...WBBBW..........',
  '..BBBBBBB.........',
  '.BbBBBBBb.........',
  'L..BBBBB..L.......',
  '....BBB...........',
  '...PP.PP..........',
  '...L...L..........',
  '..L.....L.........',
  '..S.....S.........',
]

const slideRows = [
  '..................',
  'aa...HHHHHC.......',
  '..a.HhEoEhHF......',
  '...BBBBBBBB.......',
  '..BBBBBBBBB.......',
  '.LLLLLLLLLL.......',
  '.S........S.......',
]

const wallRows = [
  '....aa............',
  '...a..a...........',
  '..HHHHH...........',
  '.HhEoEhH..........',
  '.HHEEEHHC.........',
  '..HHHHH.F.........',
  '..WBBBW...........',
  '.BBBBBBB..........',
  'BbBBBBBb..........',
  'B..BBB..b.........',
  '...BBB............',
  '..PP.PP...........',
  '..LL..............',
  '..LL..............',
  '..S...............',
]

const dashRows = [
  '..........aa................',
  '.........a..a...............',
  '........HHHHH...............',
  '.......HhEoEhHC.............',
  '....mmHHHEEEHH.F............',
  '..mMMMWBBBBWMMMm............',
  '.Mv.v.BBBBBB.v.vM...........',
  'vM....BbBBBb....Mv..........',
  '......BBBBB.................',
  '.....L.BBB.L................',
  '......PP.PP.................',
  '.....LL....LL...............',
  '....LL......L...............',
  '....S.......S...............',
  '............................',
]

function bakeBrick() {
  return bakePixels(
    [
      '############',
      '#hhhhhhhhhD#',
      '#hHHHHHHHHD#',
      '#hHHHHHHHHD#',
      '#hHHHHHHHHD#',
      '#DDDDDDDDDD#',
    ],
    { '#': '#1a1814', h: '#4a4034', H: '#3a342c', D: '#141210' },
    PX,
  )
}

function bakeFar() {
  const c = document.createElement('canvas')
  c.width = VIEW_W + 320
  c.height = VIEW_H
  const ctx = c.getContext('2d')
  if (!ctx) return c
  crisp(ctx)
  for (let i = 0; i < 9; i++) {
    const x = 40 + i * 160
    prect(ctx, x, 180, 120, 400, '#0c140e')
    prect(ctx, x + 20, 200, 80, 160, '#070a08')
    prect(ctx, x + 36, 240, 48, 80, '#7cff3a')
    ctx.globalAlpha = 0.15
    ctx.fillRect(x + 36, 240, 48, 80)
    ctx.globalAlpha = 1
  }
  return c
}

function bakeMid() {
  const c = document.createElement('canvas')
  c.width = VIEW_W + 320
  c.height = VIEW_H
  const ctx = c.getContext('2d')
  if (!ctx) return c
  crisp(ctx)
  for (let i = 0; i < 14; i++) {
    const x = i * 110
    prect(ctx, x + 20, 120, 16, 520, '#1c2420')
    prect(ctx, x + 24, 120, 4, 520, '#3a4a40')
    prect(ctx, x, 280, 90, 12, '#1c2420')
    prect(ctx, x, 280, 90, 4, '#4a5a50')
  }
  return c
}

function bakeNear() {
  const c = document.createElement('canvas')
  c.width = VIEW_W + 200
  c.height = VIEW_H
  const ctx = c.getContext('2d')
  if (!ctx) return c
  crisp(ctx)
  for (let x = 0; x < c.width; x += 32) {
    for (let y = 0; y < 80; y += 16) {
      if ((x + y) % 64 === 0) prect(ctx, x, y, 4, 80, '#1a1e1a')
    }
  }
  for (let i = 0; i < 8; i++) {
    prect(ctx, 80 + i * 180, 40, 8, 24, '#ffe080')
    prect(ctx, 76 + i * 180, 32, 16, 8, '#2a2e28')
  }
  return c
}

function bakeFore() {
  const c = document.createElement('canvas')
  c.width = VIEW_W + 200
  c.height = VIEW_H
  const ctx = c.getContext('2d')
  if (!ctx) return c
  crisp(ctx)
  ctx.globalAlpha = 0.45
  for (let i = 0; i < 18; i++) {
    prect(ctx, i * 90, 0, 4, 50 + (i % 3) * 20, '#0a0e0a')
    prect(ctx, 30 + i * 90, VIEW_H - 40, 50, 40, '#0a0e0a')
  }
  ctx.globalAlpha = 1
  return c
}

function hash(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}
