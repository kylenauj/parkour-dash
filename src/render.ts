import { DASH_TIME, VIEW_H, VIEW_W } from './const'
import { bakePixels, crisp, PX, prect, snap } from './pixel'
import { lookById, LOOKS, type CosmeticId, type Look } from './cosmetics'
import { bakeBabe, bakeBank, type SpriteBank } from './sprites'
import { bakePack, type LayerPack } from './backdrop'
import type { Camera } from './camera'
import type { Particles } from './particles'
import type { Player } from './player'
import type { Npc, Platform, Pop, Secret, Theme, World } from './world'

type Skin = SpriteBank

export class Renderer {
  private skins = new Map<CosmeticId, Skin>()
  private packs = new Map<Theme, LayerPack>()
  private babe: HTMLCanvasElement
  private brick: HTMLCanvasElement
  private rustBrick: HTMLCanvasElement
  private rockBrick: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private theme: Theme = 'gutter'
  private look: Look = LOOKS[0]
  private clock = 0

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    crisp(ctx)
    for (const look of LOOKS) this.skins.set(look.id, bakeBank(look.pal))
    this.babe = bakeBabe(lookById('babe').pal)
    this.brick = bakeBrick('#1a1814', '#4a4034', '#3a342c', '#141210')
    this.rustBrick = bakeBrick('#24140c', '#8a4a22', '#5a3018', '#180c08')
    this.rockBrick = bakeBrick('#12161a', '#3a4248', '#2a3238', '#0c1014')
    const themes: Theme[] = ['woods', 'gutter', 'filter', 'overflow', 'flue', 'street']
    for (const t of themes) this.packs.set(t, bakePack(t))
  }

  draw(
    world: World,
    player: Player,
    cam: Camera,
    particles: Particles,
    time: number,
    lookId: CosmeticId,
    pops: Pop[],
    nearNpc: Npc | null,
  ) {
    const ctx = this.ctx
    crisp(ctx)
    ctx.clearRect(0, 0, VIEW_W, VIEW_H)
    this.look = lookById(lookId)
    this.theme = world.theme
    this.clock = time
    this.drawLayers(cam, time)

    ctx.save()
    ctx.translate(-snap(cam.x) + snap(cam.offset().x), -snap(cam.y) + snap(cam.offset().y))
    this.drawSludge(world, cam, time)
    this.drawFans(world, time)
    this.drawPlatforms(world, cam)
    this.drawCrushers(world)
    this.drawProps(world, time)
    this.drawSpikes(world)
    this.drawDrips(world)
    this.drawSecrets(world.secrets)
    this.drawOrbs(world, time)
    this.drawCheckpoints(world, time)
    this.drawGoal(world, time)
    this.drawSigns(world)
    this.drawNpcs(world, time)
    this.drawSmokeList(player.smoke, this.look.smoke)
    this.drawParticles(particles)
    this.drawPops(pops)
    this.drawPlayer(player)
    if (nearNpc) this.drawPrompt(nearNpc, time)
    ctx.restore()

    const pack = this.packs.get(this.theme)!
    this.blit(pack.fore, -((cam.x * 1.12) % (VIEW_W + 200)), 0, 0.55)
    if (player.dashing) this.speedLines(player)
    this.scanlines()
    this.vignette()
  }

  private drawLayers(cam: Camera, time: number) {
    const ctx = this.ctx
    const sky = this.sky()
    ctx.fillStyle = sky[0]
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H)
    g.addColorStop(0, sky[1])
    g.addColorStop(0.6, sky[2])
    g.addColorStop(1, sky[3])
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    this.dither()
    const pack = this.packs.get(this.theme)!
    this.blit(pack.far, -((cam.x * 0.08) % (VIEW_W + 320)), 40, 0.7)
    this.blit(pack.mid, -((cam.x * 0.18) % (VIEW_W + 320)), 20, 0.85)
    this.blit(pack.near, -((cam.x * 0.32) % (VIEW_W + 200)), 0, 1)

    const bounce = ctx.createLinearGradient(0, VIEW_H * 0.5, 0, VIEW_H)
    bounce.addColorStop(0, 'rgba(0,0,0,0)')
    bounce.addColorStop(1, sky[4])
    ctx.fillStyle = bounce
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    this.sporeField(cam, time)
  }

  private sky(): [string, string, string, string, string] {
    if (this.theme === 'woods') {
      return ['#6a7a88', '#4a5868', '#2a3848', '#1a242e', 'rgba(20,30,50,0.32)']
    }
    if (this.theme === 'filter') {
      return ['#120a06', '#1a0e08', '#2a140c', '#3a1808', 'rgba(255,120,30,0.16)']
    }
    if (this.theme === 'overflow') {
      return ['#060b12', '#071018', '#0a1c24', '#063038', 'rgba(40,220,200,0.14)']
    }
    if (this.theme === 'flue') {
      return ['#140806', '#1c0a06', '#2a1008', '#3a1408', 'rgba(255,80,20,0.18)']
    }
    if (this.theme === 'street') {
      return ['#080610', '#0c0a16', '#141028', '#1a1830', 'rgba(180,140,255,0.14)']
    }
    return ['#070b08', '#0b100e', '#102014', '#0a2a10', 'rgba(80,255,50,0.16)']
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
    ctx.fillStyle =
      this.theme === 'woods'
        ? '#c8d8e8'
        : this.theme === 'filter' || this.theme === 'flue'
        ? '#ffb040'
        : this.theme === 'overflow'
          ? '#5ef0d8'
          : this.theme === 'street'
            ? '#c8b0ff'
            : '#7cff3a'
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
    const slime =
      this.theme === 'woods'
        ? ['#4a5a48', '#2a3a30', '#121810']
        : this.theme === 'filter' || this.theme === 'flue'
        ? ['#ff8a30', '#d45a18', '#5a2010']
        : this.theme === 'overflow'
          ? ['#4af0d0', '#1aa090', '#043838']
          : this.theme === 'street'
            ? ['#a090e0', '#504878', '#181428']
            : ['#b6ff4a', '#7cff3a', '#1a5a12']
    const fog =
      this.theme === 'woods'
        ? 'rgba(20,40,50,0.28)'
        : this.theme === 'filter' || this.theme === 'flue'
        ? 'rgba(180,70,20,0.28)'
        : this.theme === 'overflow'
          ? 'rgba(20,80,90,0.34)'
          : this.theme === 'street'
            ? 'rgba(40,20,70,0.32)'
            : 'rgba(40,140,30,0.28)'
    prect(ctx, cam.x - 20, y - 80, VIEW_W + 40, world.h - y + 120, fog)
    const start = snap(cam.x - 16)
    for (let x = start; x < cam.x + VIEW_W + 32; x += PX) {
      const wave = Math.floor(Math.sin(x * 0.04 + time * 2.4) * 2) * PX
      prect(ctx, x, y + wave - 8, PX, 12, slime[0])
      prect(ctx, x, y + wave, PX, 28, slime[1])
      prect(ctx, x, y + wave + 16, PX, 80, slime[2])
    }
    for (let i = 0; i < 14; i++) {
      const bx = start + ((i * 97 + Math.floor(time * 40)) % (VIEW_W + 40))
      const wave = Math.floor(Math.sin(bx * 0.04 + time * 2.4) * 2) * PX
      prect(ctx, bx, y + wave - 16 - (i % 3) * 8, PX * (1 + (i % 2)), PX, slime[0])
    }
  }

  private drawPlatforms(world: World, cam: Camera) {
    for (const p of world.platforms) {
      if (p.crumble === 'gone') continue
      if (p.x > cam.x + VIEW_W + 80 || p.x + p.w < cam.x - 80) continue
      const shake = p.crumble === 'shake' ? Math.sin(p.timer * 70) * 3 : 0
      const x = p.x + shake
      if (p.type === 'oneway') this.pipe(x, p.y, p.w, 12, true)
      else if (p.type === 'crumble') this.crumblePlate(x, p.y, p.w, p.crumble === 'shake')
      else if (p.h > p.w * 1.35) this.riser({ ...p, x })
      else if (p.h > 36 && p.w > 70) this.brickLedge({ ...p, x })
      else this.pipe(x, p.y, p.w, 20, false)
    }
  }

  private crumblePlate(x: number, y: number, w: number, shake: boolean) {
    const body =
      this.theme === 'filter' || this.theme === 'flue'
        ? '#6a3a18'
        : this.theme === 'overflow'
          ? '#2a4a48'
          : this.theme === 'street'
            ? '#3a3648'
            : '#4a4e42'
    const hi = shake ? '#f0d878' : '#c4b48a'
    prect(this.ctx, x, y, w, 18, body)
    prect(this.ctx, x, y, w, PX, hi)
    for (let i = x + 10; i < x + w; i += 22) prect(this.ctx, i, y + 6, PX, 10, '#1a1208')
  }

  private brickLedge(p: Platform) {
    const ctx = this.ctx
    const tile =
      this.theme === 'woods' ? this.rockBrick : this.theme === 'filter' || this.theme === 'flue' ? this.rustBrick : this.brick
    const tw = tile.width
    const th = tile.height
    for (let y = snap(p.y + 16); y < p.y + p.h; y += th) {
      const row = Math.floor((y - p.y) / th)
      const ox = row % 2 === 0 ? 0 : tw / 2
      for (let x = snap(p.x) - ox; x < p.x + p.w; x += tw) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(snap(p.x), snap(p.y + 16), snap(p.w), snap(p.h - 16))
        ctx.clip()
        ctx.drawImage(tile, x, y)
        ctx.restore()
      }
    }
    this.pipe(p.x, p.y, p.w, 20, false)
    if (this.theme === 'woods') {
      prect(ctx, p.x, p.y - 6, p.w, 8, '#1a2818')
      for (let i = p.x + 8; i < p.x + p.w; i += 18) {
        prect(ctx, i, p.y - 12, PX, 8, i % 36 === 0 ? '#3a5a30' : '#2a3a24')
      }
    }
    const glow =
      this.theme === 'woods'
        ? 'rgba(80,120,90,0.12)'
        : this.theme === 'filter' ? 'rgba(255,140,40,0.12)' : this.theme === 'overflow' ? 'rgba(40,220,200,0.12)' : 'rgba(80,255,50,0.12)'
    prect(ctx, p.x, p.y + p.h - 16, p.w, 16, glow)
  }

  private pipe(x: number, y: number, w: number, h: number, hang: boolean) {
    const cols =
      this.theme === 'woods'
        ? ['#3a4248', '#8a9aaa', '#5a646c', '#1a2024', '#2a3238']
        : this.theme === 'filter'
        ? ['#6a4a3a', '#d4b090', '#a07858', '#3a2418', '#4a3028']
        : this.theme === 'overflow'
          ? ['#3a5a5c', '#b0d4d4', '#6a9090', '#1a3030', '#2a4040']
          : ['#5a626a', '#c4ccd4', '#8a929a', '#2a2e32', '#3a3e44']
    prect(this.ctx, x, y, w, h, cols[0])
    prect(this.ctx, x, y, w, PX, cols[1])
    prect(this.ctx, x, y + PX, w, PX, cols[2])
    prect(this.ctx, x, y + h - PX, w, PX, cols[3])
    for (let i = x + 24; i < x + w - 8; i += 56) {
      prect(this.ctx, i, y - PX, PX * 2, h + PX * 2, cols[4])
      prect(this.ctx, i, y + PX, PX * 2, PX, cols[1])
    }
    for (let i = 0; i < 5; i++) {
      const rx = x + 16 + ((hash(x, y) * 80 + i * 37) % Math.max(8, w - 32))
      prect(this.ctx, rx, y + PX * (1 + (i % 2)), PX * 2, PX, this.theme === 'overflow' ? '#1aa090' : '#8a3a18')
    }
    if (hang) {
      for (let i = x + 12; i < x + w; i += 20) prect(this.ctx, i, y + h, PX, 12, '#4a4038')
    }
  }

  private riser(p: Platform) {
    const body = this.theme === 'filter' ? '#5a3a2a' : this.theme === 'overflow' ? '#2e4a4c' : '#4a5258'
    const hi = this.theme === 'filter' ? '#d4b090' : this.theme === 'overflow' ? '#b0d4d4' : '#c4ccd4'
    prect(this.ctx, p.x, p.y, p.w, p.h, body)
    prect(this.ctx, p.x, p.y, PX, p.h, hi)
    prect(this.ctx, p.x + p.w - PX, p.y, PX, p.h, '#1c2024')
    for (let y = p.y + 16; y < p.y + p.h - 8; y += 40) {
      prect(this.ctx, p.x - PX, y, p.w + PX * 2, PX * 2, '#2e3238')
      prect(this.ctx, p.x, y, PX, PX, hi)
    }
    prect(this.ctx, p.x + PX * 2, p.y + p.h * 0.4, PX * 3, PX * 4, this.theme === 'overflow' ? '#1aa090' : '#8a3a18')
  }

  private drawProps(world: World, time: number) {
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
      else if (prop.kind === 'lamp') this.pixelLamp(time, prop.x)
      else if (prop.kind === 'nest') this.pixelNest()
      else if (prop.kind === 'grate') this.pixelGrate()
      else if (prop.kind === 'chain') this.pixelChain()
      else if (prop.kind === 'pine') this.pixelPine()
      else if (prop.kind === 'tent') this.pixelTent()
      else if (prop.kind === 'rock') this.pixelRock()
      else if (prop.kind === 'pole') this.pixelPole(time, prop.x)
      else if (prop.kind === 'truck') this.pixelTruck()
      else if (prop.kind === 'grass') this.pixelGrass()
      else if (prop.kind === 'mouth') this.pixelMouth()
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

  private pixelPine() {
    prect(this.ctx, 18, -110, 10, 110, '#2a2018')
    prect(this.ctx, 0, -70, 48, 28, '#152018')
    prect(this.ctx, 6, -92, 36, 24, '#1a2818')
    prect(this.ctx, 12, -110, 24, 22, '#203020')
    prect(this.ctx, 16, -108, PX, 8, '#4a6a40')
  }

  private pixelTent() {
    prect(this.ctx, 4, -52, 72, 52, '#1a2a18')
    prect(this.ctx, 8, -48, 64, 44, '#2a4a28')
    prect(this.ctx, 36, -52, 8, 52, '#142014')
    prect(this.ctx, 28, -20, 20, 20, '#0c140c')
    prect(this.ctx, 10, -44, 16, PX, '#7cff3a')
  }

  private pixelRock() {
    prect(this.ctx, 0, -28, 40, 28, '#2a3238')
    prect(this.ctx, 8, -36, 24, 12, '#3a444c')
    prect(this.ctx, 4, -24, 12, PX, '#8a9aaa')
  }

  private pixelPole(time: number, seed: number) {
    prect(this.ctx, 10, -96, 8, 96, '#3a4048')
    prect(this.ctx, 8, -100, 12, 8, '#5a626a')
    prect(this.ctx, 18, -92, 28, 6, '#2a3038')
    const on = Math.sin(time * 7 + seed) > -0.5
    prect(this.ctx, 38, -90, 12, 10, on ? '#d8f0ff' : '#6a8090')
    if (on) {
      this.ctx.globalAlpha = 0.16
      prect(this.ctx, 20, -88, 48, 70, '#c8e0ff')
      this.ctx.globalAlpha = 1
    }
  }

  private pixelTruck() {
    prect(this.ctx, 0, -36, 88, 28, '#3a4a28')
    prect(this.ctx, 48, -52, 36, 20, '#2a3820')
    prect(this.ctx, 8, -12, 16, 12, '#1a1c18')
    prect(this.ctx, 60, -12, 16, 12, '#1a1c18')
    prect(this.ctx, 54, -70, 10, 18, '#5a6260')
    prect(this.ctx, 52, -78, 14, 8, '#8a9088')
    prect(this.ctx, 20, -30, 20, 8, '#111')
  }

  private pixelGrass() {
    for (let i = 0; i < 7; i++) prect(this.ctx, i * 6, -10 - (i % 3) * 6, PX, 10 + (i % 3) * 6, i % 2 === 0 ? '#3a5a30' : '#2a4024')
  }

  private pixelMouth() {
    prect(this.ctx, 0, -140, 140, 140, '#1a1c20')
    prect(this.ctx, 16, -124, 108, 108, '#0a0c10')
    prect(this.ctx, 32, -108, 76, 92, '#050608')
    prect(this.ctx, 20, -124, 100, PX, '#8a9aaa')
  }

  private pixelCrane() {
    prect(this.ctx, 0, -12, 80, 12, '#3a3e38')
    prect(this.ctx, 64, -72, 10, 72, '#5a4030')
    prect(this.ctx, -4, -72, 78, 4, '#8a9098')
  }

  private pixelLamp(time: number, seed: number) {
    prect(this.ctx, 8, -36, 8, 20, '#3a3e38')
    prect(this.ctx, 2, -48, 20, 14, '#2a2e28')
    const on = Math.sin(time * 9 + seed) > -0.6
    prect(this.ctx, 6, -44, 12, 8, on ? '#ffe080' : '#8a7030')
    if (on) {
      this.ctx.globalAlpha = 0.18
      prect(this.ctx, -8, -40, 40, 48, '#ffe080')
      this.ctx.globalAlpha = 1
    }
  }

  private pixelNest() {
    prect(this.ctx, 0, -16, 28, 8, '#5a3a18')
    prect(this.ctx, 4, -22, 20, 8, '#7a5020')
    prect(this.ctx, 10, -12, 8, 12, '#3a2410')
  }

  private pixelGrate() {
    prect(this.ctx, 0, 0, 64, 8, '#2a2e28')
    for (let i = 0; i < 6; i++) prect(this.ctx, 4 + i * 10, 0, 4, 8, '#6a7068')
  }

  private pixelChain() {
    for (let i = 0; i < 8; i++) prect(this.ctx, 4 + (i % 2) * 4, -90 + i * 10, 8, 8, '#8a9098')
  }

  private drawFans(world: World, time: number) {
    const ctx = this.ctx
    for (const f of world.fans) {
      const col = this.theme === 'filter' ? '#ffb060' : this.theme === 'overflow' ? '#7ef0e0' : '#9cff6a'
      ctx.globalAlpha = 0.22
      prect(ctx, f.x, f.y, f.w, f.h, col)
      ctx.globalAlpha = 0.55
      const mag = Math.hypot(f.fx, f.fy) || 1
      const dx = f.fx / mag
      const dy = f.fy / mag
      for (let i = 0; i < 10; i++) {
        const u = ((time * 1.8 + i * 0.13) % 1)
        prect(
          ctx,
          f.x + 8 + (f.w - 16) * (0.15 + ((i * 17) % 70) / 100) + dx * u * 24,
          f.y + 8 + (f.h - 16) * ((i * 13) % 80) / 100 + dy * u * 24,
          PX * (1 + (i % 2)),
          PX,
          col,
        )
      }
      ctx.globalAlpha = 1
    }
  }

  private drawCrushers(world: World) {
    for (const c of world.crushers) {
      prect(this.ctx, c.x, c.y, c.w, c.h, '#4a3020')
      prect(this.ctx, c.x, c.y, c.w, PX, '#c49060')
      prect(this.ctx, c.x, c.y + c.h - PX, c.w, PX, '#1a1008')
      for (let x = c.x + 6; x < c.x + c.w - 4; x += 14) {
        prect(this.ctx, x, c.y + c.h, 8, 10, '#d8d0c4')
        prect(this.ctx, x + 2, c.y + c.h + 10, 4, 6, '#8a8078')
      }
    }
  }

  private drawDrips(world: World) {
    const col = this.theme === 'filter' ? '#ff8a30' : '#7cff3a'
    for (const d of world.drips) {
      prect(this.ctx, d.x, d.y, 8, 12, col)
      prect(this.ctx, d.x + 2, d.y + 2, 4, 4, '#fff4c0')
    }
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
      const ang = time * 4 + o.x * 0.02
      for (let i = 0; i < 4; i++) {
        const a = ang + i * (Math.PI / 2)
        prect(this.ctx, o.x + 6 + Math.cos(a) * 12, o.y + bob + 4 + Math.sin(a) * 8, PX, PX, '#fff6c8')
      }
    }
  }

  private drawCheckpoints(world: World, time: number) {
    for (const c of world.checkpoints) {
      prect(this.ctx, c.x + 8, c.y, 8, c.h, '#2a2e28')
      const on = c.armed || Math.sin(time * 3) > 0
      const lit = this.theme === 'filter' ? '#ffb040' : this.theme === 'overflow' ? '#5ef0d8' : '#7cff3a'
      prect(this.ctx, c.x + 4, c.y + 4, 16, 16, c.armed || on ? lit : '#4a5a30')
      if (c.armed) {
        const pulse = 8 + Math.abs(Math.sin(time * 5)) * 10
        this.ctx.globalAlpha = 0.35
        prect(this.ctx, c.x + 12 - pulse, c.y + 8, pulse * 2, PX, lit)
        this.ctx.globalAlpha = 1
      }
    }
  }

  private drawGoal(world: World, time: number) {
    const g = world.goal
    if (this.theme === 'woods') {
      prect(this.ctx, g.x - 20, g.y - 20, g.w + 40, g.h + 40, '#12141a')
      prect(this.ctx, g.x, g.y, g.w, g.h, '#050608')
      const pulse = 0.35 + Math.sin(time * 3) * 0.12
      this.ctx.globalAlpha = pulse
      prect(this.ctx, g.x + 16, g.y + 20, g.w - 32, g.h - 40, '#1a3040')
      this.ctx.globalAlpha = 1
      return
    }
    prect(this.ctx, g.x, g.y, g.w, g.h, '#3a3e44')
    const pulse = Math.sin(time * 4) > 0
    const lit = world.id === 5 ? '#ff90b0' : this.theme === 'filter' ? '#ffb040' : this.theme === 'overflow' ? '#5ef0d8' : '#7cff3a'
    prect(this.ctx, g.x + 12, g.y + 16, g.w - 24, g.h - 32, pulse ? lit : '#1a5a12')
    for (let i = 0; i < 5; i++) prect(this.ctx, g.x + 16 + i * 8, g.y + 20, PX, g.h - 40, '#111')
    if (world.id === 5) {
      for (let i = 0; i < 4; i++) {
        const a = time * 2 + i
        prect(this.ctx, g.x + 20 + Math.sin(a) * 18, g.y - 8 + Math.cos(a * 1.3) * 10, PX, PX, '#ffb0c8')
      }
    }
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

  private drawSmokeList(smoke: { x: number; y: number; life: number; max: number; size: number }[], cols: [string, string, string]) {
    const ctx = this.ctx
    for (const s of smoke) {
      const a = Math.max(0, s.life / s.max)
      ctx.globalAlpha = a * 0.72
      const col = a > 0.55 ? cols[0] : a > 0.3 ? cols[1] : cols[2]
      prect(ctx, s.x, s.y, s.size, s.size, col)
    }
    ctx.globalAlpha = 1
  }

  private drawParticles(particles: Particles) {
    const ctx = this.ctx
    for (const p of particles.items) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      if (p.ring) {
        const r = p.size
        prect(ctx, p.x - r, p.y - r, r * 2, PX, p.color)
        prect(ctx, p.x - r, p.y + r, r * 2, PX, p.color)
        prect(ctx, p.x - r, p.y - r, PX, r * 2, p.color)
        prect(ctx, p.x + r, p.y - r, PX, r * 2, p.color)
      } else {
        prect(ctx, p.x, p.y, Math.max(PX, p.size), Math.max(PX, p.size), p.color)
      }
    }
    ctx.globalAlpha = 1
  }

  private drawPops(pops: Pop[]) {
    const ctx = this.ctx
    ctx.font = '10px "Press Start 2P", monospace'
    ctx.imageSmoothingEnabled = false
    for (const p of pops) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      ctx.fillStyle = p.color
      ctx.fillText(p.text, snap(p.x), snap(p.y - (1 - p.life / p.max) * 28))
    }
    ctx.globalAlpha = 1
  }

  private drawSecrets(secrets: Secret[]) {
    for (const s of secrets) {
      if (s.got) continue
      prect(this.ctx, s.x, s.y, s.w, s.h, '#3a2a10')
      prect(this.ctx, s.x, s.y, s.w, PX, '#f0d878')
      prect(this.ctx, s.x + 8, s.y + 6, s.w - 16, 10, '#8a6828')
      prect(this.ctx, s.x + 12, s.y + 8, 4, 6, '#fff4c0')
    }
  }

  private drawNpcs(world: World, time: number) {
    for (const n of world.npcs) {
      const look = lookById(n.look)
      if (n.id === 'babe') {
        this.drawRoach(this.babe, n.x, n.y, n.facing, look, false)
        continue
      }
      const skin = this.skins.get(n.look) ?? this.skins.get('stock')!
      const idle = Math.abs(Math.sin(time * 2 + n.x)) < 0.12 ? skin.jump : skin.idle
      this.drawSmokeList(n.smoke, look.smoke)
      this.drawRoach(idle, n.x, n.y, n.facing, look, true)
    }
  }

  private drawPrompt(npc: Npc, time: number) {
    const bob = Math.sin(time * 6) * 3
    prect(this.ctx, npc.x - 10, npc.y - 78 + bob, 28, 16, '#0c140c')
    this.ctx.font = '10px "Press Start 2P", monospace'
    this.ctx.fillStyle = '#c8ff90'
    this.ctx.fillText('E', snap(npc.x - 2), snap(npc.y - 66 + bob))
  }

  private drawPlayer(player: Player) {
    const ctx = this.ctx
    crisp(ctx)
    const skin = this.skins.get(this.look.id) ?? this.skins.get('stock')!
    let spr = skin.idle
    if (player.slideDash) spr = skin.slideDash
    else if (player.dashing) spr = skin.dash
    else if (player.sliding) spr = skin.slide
    else if (player.wallKickT > 0) spr = skin.kick
    else if (player.onWall && !player.onGround) spr = skin.wall
    else if (!player.onGround) spr = skin.jump
    else if (Math.abs(player.vx) > 40) {
      const f = Math.floor(Math.abs(player.x) / 14) % skin.run.length
      spr = skin.run[f]
    }

    for (const g of player.ghosts) {
      ctx.globalAlpha = Math.max(0, g.life * 1.6)
      if (!player.slideDash) this.drawDashWingsAt(g.x + player.w / 2, g.y + g.h * 0.42, player, 0.45 + g.life)
      this.drawRoach(player.slideDash ? skin.slideDash : skin.dash, g.x + player.w / 2, g.y + g.h, player.facing, this.look, false)
    }
    ctx.globalAlpha = 1

    if (player.dashing && !player.slideDash) {
      this.drawDashWings(player)
      this.drawDashAura(player)
    }
    this.drawRoach(spr, player.cx, player.bottom, player.facing, this.look, !player.sliding, player.squish)
  }

  private drawDashAura(player: Player) {
    const ctx = this.ctx
    const u = 1 - Math.max(0, player.dashT) / DASH_TIME
    for (let i = 0; i < 18; i++) {
      const a = this.clock * 14 + i * 0.4
      const r = 18 + Math.sin(a * 2 + u * 8) * 16 + u * 22
      ctx.globalAlpha = 0.22 + (i % 3) * 0.08
      prect(
        ctx,
        player.cx + Math.cos(a) * r,
        player.cy + Math.sin(a * 1.3) * r * 0.55,
        PX * (i % 3 === 0 ? 2 : 1),
        PX,
        i % 2 === 0 ? '#7ef0ff' : '#c090ff',
      )
    }
    ctx.globalAlpha = 1
  }

  private drawRoach(
    spr: HTMLCanvasElement,
    x: number,
    y: number,
    facing: number,
    look: Look,
    cig: boolean,
    squish = 1,
  ) {
    const ctx = this.ctx
    const s = 1.22
    const ox = 0.48
    const dx = -Math.floor(spr.width * ox * s)
    const dy = -Math.floor(spr.height * s) + 4
    ctx.save()
    ctx.translate(snap(x), snap(y))
    ctx.scale(facing, squish)
    ctx.globalAlpha = 0.55
    ctx.filter = 'brightness(2.2)'
    ctx.drawImage(spr, dx - 1, dy, spr.width * s, spr.height * s)
    ctx.drawImage(spr, dx + 1, dy, spr.width * s, spr.height * s)
    ctx.filter = 'none'
    ctx.globalAlpha = 1
    ctx.drawImage(spr, dx, dy, spr.width * s, spr.height * s)
    if (look.glasses) {
      prect(ctx, -8, -Math.floor(spr.height * s) + 22, 18, 6, '#111')
      prect(ctx, -6, -Math.floor(spr.height * s) + 24, 4, PX, '#d8f0ff')
    }
    ctx.restore()
    if (cig) {
      const flicker = Math.sin(x * 0.2) > 0
      const cx = x + facing * 14
      const cy = y - (squish < 0.95 ? 16 : 34)
      this.ctx.globalAlpha = 0.28
      prect(this.ctx, cx - 4, cy - 4, 12, 12, look.cig[0])
      this.ctx.globalAlpha = 1
      prect(this.ctx, cx, cy, PX, PX, flicker ? look.cig[0] : look.cig[1])
    }
  }

  paintHero(canvas: HTMLCanvasElement, lookId: CosmeticId) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const look = lookById(lookId)
    const skin = this.skins.get(look.id) ?? this.skins.get('stock')!
    const spr = skin.hero
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height)
    g.addColorStop(0, 'rgba(12, 20, 14, 0)')
    g.addColorStop(1, 'rgba(8, 14, 10, 0.55)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const scale = Math.min((canvas.width * 0.92) / spr.width, (canvas.height * 0.88) / spr.height)
    const dw = spr.width * scale
    const dh = spr.height * scale
    const dx = (canvas.width - dw) / 2
    const dy = canvas.height - dh - 8
    ctx.drawImage(spr, dx, dy, dw, dh)
    ctx.fillStyle = look.cig[0]
    ctx.fillRect(Math.floor(dx + dw * 0.72), Math.floor(dy + dh * 0.28), 4, 4)
    ctx.fillStyle = look.smoke[0]
    ctx.globalAlpha = 0.7
    ctx.fillRect(Math.floor(dx + dw * 0.78), Math.floor(dy + dh * 0.12), 6, 6)
    ctx.fillStyle = look.smoke[1]
    ctx.fillRect(Math.floor(dx + dw * 0.86), Math.floor(dy + dh * 0.04), 8, 8)
    ctx.globalAlpha = 1
  }

  private speedLines(player: Player) {
    const ctx = this.ctx
    const mag = Math.hypot(player.vx, player.vy) || 1
    const ax = -player.vx / mag
    const ay = -player.vy / mag
    ctx.globalAlpha = 0.35
    for (let i = 0; i < 12; i++) {
      const x = VIEW_W * 0.35 + (i * 73) % 420
      const y = 80 + ((i * 97) % (VIEW_H - 160))
      prect(ctx, x, y, 18 + (i % 3) * 10, PX, this.look.wings[1])
      prect(ctx, x + ax * 8, y + ay * 6, 10, PX, this.look.wings[0])
    }
    ctx.globalAlpha = 1
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

    this.paintWing(x, y, back - 0.62 + flap, 28 + span * 70, 18 + span * 30, [this.look.wings[0], this.look.wings[1], this.look.wings[2]], span)
    this.paintWing(x, y, back + 0.62 - flap, 28 + span * 70, 18 + span * 30, [this.look.wings[0], this.look.wings[1], this.look.wings[2]], span)
    this.paintWing(x, y, back - 0.28 + flap * 0.4, 18 + span * 44, 12 + span * 16, [this.look.wings[1], this.look.wings[2], this.look.wings[3]], span)
    this.paintWing(x, y, back + 0.28 - flap * 0.4, 18 + span * 44, 12 + span * 16, [this.look.wings[1], this.look.wings[2], this.look.wings[3]], span)

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
          i % 2 === 0 ? this.look.wings[0] : this.look.wings[1],
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
        prect(ctx, ox + px * dist - PX / 2, oy + py * dist - PX / 2, PX, PX, this.look.wings[3])
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


function bakeBrick(edge: string, h: string, H: string, D: string) {
  return bakePixels(
    [
      '############',
      '#hhhhhhhhhD#',
      '#hHHHHHHHHD#',
      '#hHHHHHHHHD#',
      '#hHHHHHHHHD#',
      '#DDDDDDDDDD#',
    ],
    { '#': edge, h, H, D },
    PX,
  )
}


function hash(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}
