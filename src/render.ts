import { VIEW_H, VIEW_W } from './const'
import { crisp, PX, prect, snap } from './pixel'
import { lookById, LOOKS, type CosmeticId, type Look } from './cosmetics'
import { bakeBabe, bakeBank, type SpriteBank } from './sprites'

/** Baked sprites carry one padding cell (2px) below the feet. */
const S_PAD = 2
import { bakePack, type LayerPack } from './backdrop'
import { boulders, disk, hash, pineTree, roots, stamp } from './gfx'
import { bakeGround, type GroundSkin } from './tiles'
import type { Camera } from './camera'
import type { Particles } from './particles'
import type { Player } from './player'
import type { Npc, Platform, Pop, Secret, Theme, World } from './world'

type Skin = SpriteBank

export class Renderer {
  private skins = new Map<CosmeticId, Skin>()
  private packs = new Map<Theme, LayerPack>()
  private grounds = new Map<Theme, GroundSkin>()
  private babe: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private theme: Theme = 'gutter'
  private look: Look = LOOKS[0]

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
    crisp(ctx)
    for (const look of LOOKS) this.skins.set(look.id, bakeBank(look.pal))
    this.babe = bakeBabe(lookById('babe').pal)
    const themes: Theme[] = ['woods', 'gutter', 'filter', 'overflow', 'flue', 'street']
    for (const t of themes) {
      this.packs.set(t, bakePack(t))
      this.grounds.set(t, bakeGround(t))
    }
  }

  private earth() {
    return this.grounds.get(this.theme)!
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
    this.blit(pack.fore, -((cam.x * 1.12) % (VIEW_W + 200)), 0, 0.85)
    this.vignette()
  }

  private drawLayers(cam: Camera, time: number) {
    const ctx = this.ctx
    const sky = this.sky()
    if (this.theme === 'woods') {
      const night = ctx.createLinearGradient(0, 0, 0, VIEW_H)
      night.addColorStop(0, '#070d1c')
      night.addColorStop(0.35, '#0e1930')
      night.addColorStop(0.62, '#1b2a4a')
      night.addColorStop(1, '#16233c')
      ctx.fillStyle = night
      ctx.fillRect(0, 0, VIEW_W, VIEW_H)
    } else {
      ctx.fillStyle = sky[0]
      ctx.fillRect(0, 0, VIEW_W, VIEW_H)
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H)
      g.addColorStop(0, sky[1])
      g.addColorStop(0.55, sky[2])
      g.addColorStop(1, sky[3])
      ctx.fillStyle = g
      ctx.fillRect(0, 0, VIEW_W, VIEW_H)
    }

    const pack = this.packs.get(this.theme)!
    this.blit(pack.far, -((cam.x * 0.08) % (VIEW_W + 320)), 0, 1)
    this.blit(pack.mid, -((cam.x * 0.2) % (VIEW_W + 320)), 8, 1)
    this.blit(pack.near, -((cam.x * 0.38) % (VIEW_W + 200)), 0, 1)

    const bounce = ctx.createLinearGradient(0, VIEW_H * 0.5, 0, VIEW_H)
    bounce.addColorStop(0, 'rgba(0,0,0,0)')
    bounce.addColorStop(1, sky[4])
    ctx.fillStyle = bounce
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    this.sporeField(cam, time)
  }

  private sky(): [string, string, string, string, string] {
    if (this.theme === 'woods') {
      return ['#0a1220', '#152038', '#1a2430', '#121820', 'rgba(8,12,20,0.2)']
    }
    if (this.theme === 'filter') {
      return ['#1a0804', '#2a1008', '#5a2010', '#3a1408', 'rgba(255,100,30,0.18)']
    }
    if (this.theme === 'overflow') {
      return ['#041018', '#072030', '#0a3848', '#063038', 'rgba(40,220,200,0.16)']
    }
    if (this.theme === 'flue') {
      return ['#180604', '#2a0c06', '#5a1808', '#3a1008', 'rgba(255,70,20,0.2)']
    }
    if (this.theme === 'street') {
      return ['#080610', '#140c28', '#2a1848', '#1a1830', 'rgba(180,140,255,0.16)']
    }
    return ['#06100a', '#0c1c12', '#143018', '#0a2a10', 'rgba(80,255,50,0.16)']
  }

  private blit(sheet: HTMLCanvasElement, x: number, y: number, alpha: number) {
    const ctx = this.ctx
    ctx.globalAlpha = alpha
    const sx = snap(x)
    ctx.drawImage(sheet, sx, snap(y))
    ctx.drawImage(sheet, sx + sheet.width, snap(y))
    ctx.globalAlpha = 1
  }

  private sporeField(cam: Camera, time: number) {
    const ctx = this.ctx
    const core =
      this.theme === 'woods'
        ? '#ffe8a0'
        : this.theme === 'filter' || this.theme === 'flue'
        ? '#ffb040'
        : this.theme === 'overflow'
          ? '#5ef0d8'
          : this.theme === 'street'
            ? '#c8b0ff'
            : '#7cff3a'
    for (let i = 0; i < 10; i++) {
      const x = snap(((i * 97 + time * 14 - cam.x * 0.18) % (VIEW_W + 20) + VIEW_W + 20) % (VIEW_W + 20))
      const y = snap((i * 61 + Math.sin(time * 0.7 + i) * 18) % VIEW_H)
      ctx.globalAlpha = 0.28 + Math.sin(time * 2 + i) * 0.12
      ctx.fillStyle = core
      ctx.fillRect(x, y, 2, 2)
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
      else this.groundFace({ ...p, x })
    }
  }

  private groundFace(p: Platform) {
    if (this.theme === 'woods' && p.h <= 64) {
      this.rockIsland(p)
      return
    }
    const ctx = this.ctx
    const earth = this.earth()
    const g = earth.cols
    const x = Math.floor(p.x)
    const y = Math.floor(p.y)
    const w = Math.floor(p.w)
    const h = Math.floor(p.h)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(x + 10, y + h, w - 14, 14)

    stamp(ctx, earth.body, x, y, w, h)

    if (earth.grass) {
      boulders(ctx, x, y, w, h, { face: '#2f2a20', lit: '#3e3729', shade: '#171310' }, 34)
      ctx.fillStyle = '#0e0b08'
      ctx.fillRect(x + w - 6, y, 6, h)
      ctx.fillStyle = '#3c3529'
      ctx.fillRect(x, y, 3, Math.min(h, 90))
      this.soilCap(x, y, w, g)
      roots(ctx, x, y + 7, w, { root: '#6f4a26', shade: '#4a2f18', leaf: g.grass2 }, 27, 96)
    } else {
      ctx.fillStyle = g.hi
      ctx.fillRect(x, y, w, 2)
      ctx.fillStyle = g.shade
      ctx.fillRect(x + w - 4, y, 4, h)
      for (let i = x + 16; i < x + w - 6; i += 28) {
        ctx.fillStyle = g.rivet
        ctx.fillRect(i, y + 4, 4, 4)
      }
    }
  }

  /** Grass lip with moonlit tufts and a soil shelf under it. */
  private soilCap(x: number, y: number, w: number, g: GroundSkin['cols']) {
    const ctx = this.ctx
    ctx.fillStyle = '#20180f'
    ctx.fillRect(x, y, w, 7)
    ctx.fillStyle = g.grass
    ctx.fillRect(x, y - 3, w, 6)
    ctx.fillStyle = g.grass2
    ctx.fillRect(x, y - 3, w, 2)
    for (let i = x + 1; i < x + w - 1; i += 2) {
      const seed = hash(i, y)
      if (seed < 0.35) continue
      const gh = 3 + Math.floor(seed * 10)
      ctx.fillStyle = seed > 0.82 ? g.grassTip : seed > 0.55 ? g.grass2 : g.grass
      ctx.fillRect(i, y - gh, 2, gh)
    }
    for (let i = x + 6; i < x + w - 6; i += 34) {
      if (hash(i, y + 3) < 0.5) continue
      ctx.fillStyle = g.grassTip
      ctx.fillRect(i, y - 15, 1, 12)
      ctx.fillRect(i + 4, y - 12, 1, 9)
    }
  }

  /** Mossy floating rock: tapered stone mass, grass lid, trailing roots. */
  private rockIsland(p: Platform) {
    const ctx = this.ctx
    const g = this.earth().cols
    const x = Math.floor(p.x)
    const y = Math.floor(p.y)
    const w = Math.floor(p.w)
    const keel = Math.floor(Math.max(46, w * 0.42))

    const cx = x + w / 2
    for (let row = 0; row < keel; row++) {
      const t = row / keel
      const round = Math.sqrt(Math.max(0, 1 - t * t))
      const wobble = (hash(x, y + row) - 0.5) * 5
      const sw = Math.round(Math.max(4, w * round + wobble))
      if (sw <= 4) break
      const sx = Math.round(cx - sw / 2 + wobble * 0.4)
      ctx.fillStyle = t < 0.1 ? '#3c3527' : t < 0.35 ? '#2b2519' : t < 0.68 ? '#201b12' : '#15110b'
      ctx.fillRect(sx, y + row, sw, 1)
      ctx.fillStyle = '#4a4231'
      ctx.fillRect(sx, y + row, 2, 1)
      ctx.fillStyle = '#0d0a07'
      ctx.fillRect(sx + sw - 3, y + row, 3, 1)
      if (hash(sx, y + row) > 0.9) {
        ctx.fillStyle = '#443b2a'
        ctx.fillRect(sx + 4 + hash(row, x) * Math.max(1, sw - 8), y + row, 3, 2)
      }
    }

    ctx.fillStyle = g.moss
    ctx.fillRect(x + 2, y + 4, w - 4, 4)
    this.soilCap(x + 2, y, w - 4, g)
    roots(
      ctx,
      x + 8,
      y + keel * 0.5,
      w - 20,
      { root: '#96652f', shade: '#66421f', leaf: g.grass2 },
      11,
      keel * 1.5,
    )
  }

  private crumblePlate(x: number, y: number, w: number, shake: boolean) {
    const earth = this.earth()
    const g = earth.cols
    const hi = shake ? '#fff0a0' : g.hi
    stamp(this.ctx, earth.body, x, y, w, 16)
    prect(this.ctx, x, y, w, 2, hi)
    prect(this.ctx, x, y, 2, 16, g.rim)
    prect(this.ctx, x + w - 2, y, 2, 16, g.shade)
    for (let i = x + 8; i < x + w; i += 14) prect(this.ctx, i, y + 5, 2, 8, g.shade)
  }

  private pipe(x: number, y: number, w: number, h: number, hang: boolean) {
    const earth = this.earth()
    const g = earth.cols
    stamp(this.ctx, earth.pipe, x, y, w, Math.max(h, 12))
    prect(this.ctx, x, y, w, 2, g.hi)
    prect(this.ctx, x, y, 2, h, g.rim)
    prect(this.ctx, x + w - 2, y, 2, h, g.shade)
    for (let i = x + 16; i < x + w - 6; i += 26) {
      prect(this.ctx, i, y - 2, 6, h + 4, g.shade)
      prect(this.ctx, i, y + 2, 6, 2, g.hi)
      prect(this.ctx, i + 2, y + 5, 2, 2, g.rivet)
    }
    if (hang) {
      for (let i = x + 10; i < x + w; i += 14) {
        prect(this.ctx, i, y + h, 2, 16, g.shade)
        prect(this.ctx, i, y + h, 2, 2, g.rivet)
      }
    }
  }

  private riser(p: Platform) {
    const earth = this.earth()
    const g = earth.cols
    stamp(this.ctx, earth.wall, p.x, p.y, p.w, p.h)
    prect(this.ctx, p.x, p.y, 4, p.h, g.rim)
    prect(this.ctx, p.x + 4, p.y, 2, p.h, g.hi)
    prect(this.ctx, p.x + p.w - 5, p.y, 5, p.h, g.shade)
    for (let y = p.y + 16; y < p.y + p.h - 8; y += 32) {
      prect(this.ctx, p.x - 3, y, p.w + 6, 6, g.moss)
      prect(this.ctx, p.x, y, 4, 2, g.hi)
      prect(this.ctx, p.x + 8, y + 1, 3, 3, g.rivet)
    }
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
    pineTree(this.ctx, 26, 2, 1.15, {
      trunk: '#3a2a1c',
      bark: '#54402c',
      mid: '#1c3222',
      lit: '#3a5c38',
      dark: '#0e1c14',
    })
  }

  private pixelTent() {
    const ctx = this.ctx
    const h = 56
    const halfBase = 38
    for (let r = 0; r < h; r++) {
      const t = r / (h - 1)
      const w = Math.round(6 + t * halfBase * 2)
      const sx = 40 - w / 2
      prect(ctx, sx, -h + r, w, 1, '#3f4a34')
      prect(ctx, sx, -h + r, Math.max(2, w * 0.3), 1, '#55603c')
      prect(ctx, sx + w * 0.72, -h + r, Math.max(2, w * 0.28), 1, '#232b1c')
      if (r % 9 === 0) prect(ctx, sx, -h + r, w, 1, '#4a563a')
    }
    prect(ctx, 22, -30, 36, 30, '#141a12')
    for (let r = 0; r < 30; r++) {
      const w = Math.round(4 + (r / 30) * 26)
      prect(ctx, 40 - w / 2, -30 + r, w, 1, '#0b0f0a')
    }
    prect(ctx, 39, -h - 3, 3, 8, '#5a4a30')
    prect(ctx, 4, -14, 3, 16, '#4a3c28')
    prect(ctx, 74, -14, 3, 16, '#4a3c28')
    prect(ctx, 7, -13, 14, 1, '#5a5040')
    prect(ctx, 60, -13, 14, 1, '#5a5040')
    prect(ctx, 0, -12, 14, 12, '#2c3422')
    prect(ctx, 2, -14, 9, 3, '#3c4630')
  }

  private pixelRock() {
    const ctx = this.ctx
    prect(ctx, 2, -22, 46, 22, '#2a3238')
    prect(ctx, 8, -34, 28, 16, '#3a444c')
    prect(ctx, 18, -42, 16, 12, '#4a5660')
    prect(ctx, 4, -20, 14, 3, '#8a9aaa')
    prect(ctx, 36, -18, 10, 18, '#1a2026')
    prect(ctx, 12, -8, 18, 2, '#12161a')
    prect(ctx, 10, -36, 8, 2, '#3a5a32')
  }

  private pixelPole(time: number, seed: number) {
    prect(this.ctx, 10, -96, 8, 96, '#3a4048')
    prect(this.ctx, 12, -96, 2, 96, '#8a9aaa')
    prect(this.ctx, 8, -100, 12, 8, '#5a626a')
    prect(this.ctx, 18, -92, 28, 6, '#2a3038')
    const on = Math.sin(time * 7 + seed) > -0.5
    prect(this.ctx, 38, -90, 12, 10, on ? '#e8f4ff' : '#6a8090')
    if (on) {
      this.ctx.globalAlpha = 0.18
      prect(this.ctx, 20, -88, 56, 80, '#c8e0ff')
      this.ctx.globalAlpha = 1
    }
  }

  private pixelTruck() {
    const ctx = this.ctx
    prect(ctx, 2, -8, 92, 6, 'rgba(0,0,0,0.45)')
    prect(ctx, 4, -30, 88, 22, '#404c30')
    prect(ctx, 4, -30, 88, 3, '#5c6a42')
    prect(ctx, 4, -12, 88, 4, '#222a1a')
    prect(ctx, 10, -52, 56, 24, '#3a4630')
    prect(ctx, 10, -52, 56, 3, '#5a6842')
    prect(ctx, 14, -48, 22, 14, '#1c2a30')
    prect(ctx, 15, -47, 8, 5, '#54707c')
    prect(ctx, 40, -48, 22, 14, '#1c2a30')
    prect(ctx, 41, -47, 7, 5, '#48646e')
    prect(ctx, 66, -46, 26, 16, '#38442c')
    prect(ctx, 66, -46, 26, 2, '#5a6842')
    prect(ctx, 8, -56, 60, 3, '#2a3420')
    prect(ctx, 12, -60, 4, 5, '#2a3420')
    prect(ctx, 60, -60, 4, 5, '#2a3420')
    prect(ctx, 86, -28, 8, 7, '#e8d88a')
    prect(ctx, 87, -27, 5, 4, '#fff6c8')
    prect(ctx, 4, -26, 4, 6, '#a03828')
    disk(ctx, 24, -6, 10, '#15170f')
    disk(ctx, 24, -6, 5, '#3c4034')
    disk(ctx, 24, -6, 2, '#6a6e5c')
    disk(ctx, 74, -6, 10, '#15170f')
    disk(ctx, 74, -6, 5, '#3c4034')
    disk(ctx, 74, -6, 2, '#6a6e5c')
    prect(ctx, 30, -44, 2, 14, '#5a6842')
  }

  private pixelGrass() {
    for (let i = 0; i < 9; i++) {
      const h = 8 + (i % 4) * 5
      prect(this.ctx, i * 5, -h, 2, h, i % 2 === 0 ? '#4a6e32' : '#2a4024')
      prect(this.ctx, i * 5, -h, 1, 2, '#8cbc58')
    }
  }

  private pixelMouth() {
    prect(this.ctx, 0, -140, 140, 140, '#2a3038')
    prect(this.ctx, 0, -140, 140, 6, '#8a9aaa')
    prect(this.ctx, 0, -140, 6, 140, '#c8d4e0')
    prect(this.ctx, 134, -140, 6, 140, '#12161a')
    for (let i = 0; i < 8; i++) {
      prect(this.ctx, 10 + i * 16, -136, 5, 5, '#6a7068')
      prect(this.ctx, 10 + i * 16, -12, 5, 5, '#6a7068')
    }
    disk(this.ctx, 70, -70, 52, '#0a0c10')
    disk(this.ctx, 70, -70, 40, '#050608')
    disk(this.ctx, 70, -66, 26, '#020304')
    this.ctx.globalAlpha = 0.2
    disk(this.ctx, 70, -58, 10, '#7ee0ff')
    this.ctx.globalAlpha = 1
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
    ctx.font = '8px "Press Start 2P", monospace'
    ctx.imageSmoothingEnabled = false
    for (const s of world.signs) {
      const w = ctx.measureText(s.text).width
      ctx.globalAlpha = 0.55
      prect(ctx, s.x - 6, s.y - 11, w + 12, 15, '#070c16')
      ctx.globalAlpha = 0.85
      prect(ctx, s.x - 6, s.y - 11, w + 12, 1, '#c9a862')
      ctx.fillStyle = '#cfe0ff'
      ctx.fillText(s.text, snap(s.x), snap(s.y))
      ctx.globalAlpha = 1
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
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
      this.ctx.beginPath()
      this.ctx.ellipse(n.x, n.y + 2, 16, 4, 0, 0, Math.PI * 2)
      this.ctx.fill()
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
      ctx.globalAlpha = Math.max(0, g.life * 0.55)
      this.drawRoach(player.slideDash ? skin.slideDash : skin.dash, g.x + player.w / 2, g.y + g.h, player.facing, this.look, false)
    }
    ctx.globalAlpha = 1

    if (player.onGround && !player.dead) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)'
      ctx.beginPath()
      ctx.ellipse(player.cx, player.bottom + 3, 18, 5, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    this.drawRoach(spr, player.cx, player.bottom, player.facing, this.look, !player.sliding, player.squish)
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
    const s = 1.55
    const ox = 0.48
    const dx = -Math.floor(spr.width * ox * s)
    const dy = -Math.floor(spr.height * s) + Math.round(S_PAD * s)
    ctx.save()
    ctx.translate(snap(x), snap(y))
    ctx.scale(facing, squish)
    ctx.drawImage(spr, dx, dy, spr.width * s, spr.height * s)
    if (look.glasses) {
      prect(ctx, -8, -Math.floor(spr.height * s) + 26, 18, 6, '#111')
      prect(ctx, -6, -Math.floor(spr.height * s) + 28, 4, PX, '#d8f0ff')
    }
    ctx.restore()
    if (cig) {
      const flicker = Math.sin(x * 0.2) > 0
      const cx = x + facing * 20
      const cy = y - (squish < 0.95 ? 20 : 40)
      ctx.globalAlpha = flicker ? 0.26 : 0.16
      disk(ctx, cx, cy, 7, look.cig[0])
      ctx.globalAlpha = 1
      prect(ctx, cx - 1, cy - 1, 3, 3, flicker ? look.cig[0] : look.cig[1])
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
    g.addColorStop(0, 'rgba(18, 28, 48, 0.4)')
    g.addColorStop(1, 'rgba(8, 12, 18, 0.7)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.beginPath()
    ctx.ellipse(canvas.width / 2, canvas.height - 10, 48, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    const scale = Math.min((canvas.width * 0.94) / spr.width, (canvas.height * 0.9) / spr.height)
    const dw = spr.width * scale
    const dh = spr.height * scale
    const dx = (canvas.width - dw) / 2
    const dy = canvas.height - dh - 6
    ctx.drawImage(spr, dx, dy, dw, dh)
    ctx.fillStyle = look.cig[0]
    ctx.fillRect(Math.floor(dx + dw * 0.72), Math.floor(dy + dh * 0.28), 5, 5)
    ctx.fillStyle = look.smoke[0]
    ctx.globalAlpha = 0.7
    ctx.fillRect(Math.floor(dx + dw * 0.78), Math.floor(dy + dh * 0.12), 6, 6)
    ctx.fillStyle = look.smoke[1]
    ctx.fillRect(Math.floor(dx + dw * 0.86), Math.floor(dy + dh * 0.04), 8, 8)
    ctx.globalAlpha = 1
  }

  private vignette() {
    const ctx = this.ctx
    const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H * 0.45, 220, VIEW_W / 2, VIEW_H / 2, VIEW_H)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.22)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  }
}
