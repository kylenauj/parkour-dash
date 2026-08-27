import { VIEW_H, VIEW_W } from './const'
import { AudioBus } from './audio'
import { Camera } from './camera'
import { Input } from './input'
import { Particles } from './particles'
import { Player } from './player'
import { Renderer } from './render'
import { aabb, createWorld, resetCollectibles, updateMoving, type World } from './world'

type Mode = 'title' | 'play' | 'pause' | 'win'

type GameUI = {
  hud: HTMLElement
  time: HTMLElement
  orbs: HTMLElement
  deaths: HTMLElement
  hint: HTMLElement
  dash: HTMLElement
  title: HTMLElement
  pause: HTMLElement
  win: HTMLElement
  winCopy: HTMLElement
  winStats: HTMLElement
  touch: HTMLElement
}

export class Game {
  private world: World
  private player = new Player()
  private camera = new Camera()
  private particles = new Particles()
  private renderer: Renderer
  private input = new Input()
  private audio = new AudioBus()
  private mode: Mode = 'title'
  private elapsed = 0
  private deaths = 0
  private hint = ''
  private hitstop = 0
  private respawnFlash = 0
  private clock = 0
  private canvas: HTMLCanvasElement
  private ui: GameUI

  constructor(canvas: HTMLCanvasElement, ui: GameUI) {
    this.canvas = canvas
    this.ui = ui
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available')
    this.renderer = new Renderer(ctx)
    this.world = createWorld()
    this.player.spawnAt(this.world.spawn.x, this.world.spawn.y)
    this.camera.follow(this.player.cx, this.player.cy, 0, 0, this.world.w, this.world.h, 1)
    this.input.bindTouch(ui.touch)
    this.fitCanvas()
    window.addEventListener('resize', () => this.fitCanvas())
    this.showTouchIfNeeded()
  }

  start() {
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      this.tick(dt)
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }

  playFromTitle() {
    this.audio.resume()
    this.resetRun()
    this.setMode('play')
  }

  resume() {
    if (this.mode === 'pause') this.setMode('play')
  }

  retryCheckpoint() {
    this.audio.resume()
    this.player.resetToSpawn()
    this.respawnFlash = 0.25
    this.setMode('play')
  }

  backToTitle() {
    this.setMode('title')
  }

  private tick(dt: number) {
    this.input.beginFrame()
    this.clock += dt

    if (this.mode === 'play') {
      if (this.input.pausePressed) {
        this.setMode('pause')
        return
      }
      if (this.input.retryPressed) this.retryCheckpoint()

      if (this.hitstop > 0) this.hitstop -= dt
      else this.simulate(dt)

      this.respawnFlash = Math.max(0, this.respawnFlash - dt)
      this.elapsed += dt
      this.syncHud()
    } else if (this.mode === 'pause' && this.input.pausePressed) {
      this.setMode('play')
    }

    this.renderer.draw(this.world, this.player, this.camera, this.particles, this.clock)
    if (this.respawnFlash > 0) {
      const ctx = this.canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = `rgba(255, 90, 122, ${this.respawnFlash})`
        ctx.fillRect(0, 0, VIEW_W, VIEW_H)
      }
    }
  }

  private simulate(dt: number) {
    updateMoving(this.world, dt)
    if (!this.player.dead) this.player.update(dt, this.input, this.world)
    this.particles.update(dt)
    this.fx()
    this.pickups()
    this.hazards()
    this.hints()

    const look = this.input.down ? 90 : this.input.up ? -70 : 0
    this.camera.follow(
      this.player.cx,
      this.player.cy,
      this.player.vx,
      look,
      this.world.w,
      this.world.h,
      dt,
    )
  }

  private fx() {
    const p = this.player
    if (p.justJumped) {
      this.particles.burstUp(p.cx, p.bottom, 8, '#c4a15a')
      if (p.jumpedFromWall) this.audio.wallJump()
      else this.audio.jump()
    }
    if (p.justDashed) {
      this.particles.emit(p.cx, p.cy, 14, '#6b4423', 220, 4)
      this.audio.dash()
      this.hitstop = 0.03
      this.camera.bump(0.25)
    }
    if (p.justLanded) {
      this.particles.burstUp(p.cx, p.bottom, 10, '#8a6a48')
      this.audio.land(p.landSpeed > 700)
      if (p.landSpeed > 700) this.camera.bump(0.2)
    }
    if (p.sliding && p.onGround && Math.random() < 0.4) {
      this.particles.emit(p.cx, p.bottom, 1, '#6b5344', 40, 2)
    }
    if (p.onGround && Math.abs(p.vx) > 220 && Math.random() < 0.35) {
      this.particles.emit(p.x + (p.facing < 0 ? p.w : 0), p.bottom, 1, '#5a4634', 30, 2)
    }
  }

  private pickups() {
    const p = this.player
    for (const orb of this.world.orbs) {
      if (!orb.got && aabb(p, orb)) {
        orb.got = true
        this.particles.emit(orb.x + 8, orb.y + 8, 16, '#e0b15a', 160, 3)
        this.audio.orb()
      }
    }
    for (const c of this.world.checkpoints) {
      if (!c.armed && aabb(p, c)) {
        c.armed = true
        this.player.setSpawn(c.x, c.y - 8)
        this.audio.checkpoint()
        this.particles.emit(c.x + 14, c.y + 16, 12, '#d2b56a', 120, 3)
      }
    }
    if (aabb(p, this.world.goal)) this.finish()
  }

  private hazards() {
    const p = this.player
    if (p.dead) return
    if (p.y > this.world.killY) {
      this.die()
      return
    }
    if (p.dashing) return
    for (const s of this.world.spikes) {
      if (aabb(p, s)) {
        this.die()
        return
      }
    }
  }

  private die() {
    this.player.dead = true
    this.deaths += 1
    this.particles.emit(this.player.cx, this.player.cy, 22, '#c45a2a', 240, 4)
    this.audio.death()
    this.camera.bump(0.55)
    this.hitstop = 0.08
    window.setTimeout(() => {
      this.player.resetToSpawn()
      this.respawnFlash = 0.28
    }, 180)
  }

  private hints() {
    let next = ''
    for (const s of this.world.signs) {
      if (Math.abs(s.x - this.player.x) < 360) next = s.text
    }
    if (next !== this.hint) {
      this.hint = next
      this.ui.hint.textContent = next
    }
  }

  private finish() {
    if (this.mode !== 'play') return
    this.audio.win()
    const orbs = this.world.orbs.filter((o) => o.got).length
    this.ui.winCopy.textContent =
      orbs === this.world.orbs.length
        ? 'Every crumb, every pipe. You skittered the whole drain clean.'
        : 'You reached the open drain. Grab the rest of the crumbs on the next pass if you want a perfect run.'
    this.ui.winStats.innerHTML = `
      <div><span class="k">Time</span><span class="v">${formatTime(this.elapsed)}</span></div>
      <div><span class="k">Crumbs</span><span class="v">${orbs} / ${this.world.orbs.length}</span></div>
      <div><span class="k">Falls</span><span class="v">${this.deaths}</span></div>
    `
    this.setMode('win')
  }

  private resetRun() {
    this.world = createWorld()
    resetCollectibles(this.world)
    this.player.spawnAt(this.world.spawn.x, this.world.spawn.y)
    this.camera.x = 0
    this.camera.y = 200
    this.particles.items = []
    this.elapsed = 0
    this.deaths = 0
    this.hint = ''
    this.ui.hint.textContent = ''
  }

  private setMode(mode: Mode) {
    this.mode = mode
    this.ui.title.classList.toggle('hidden', mode !== 'title')
    this.ui.pause.classList.toggle('hidden', mode !== 'pause')
    this.ui.win.classList.toggle('hidden', mode !== 'win')
    this.ui.hud.classList.toggle('hidden', mode === 'title')
    this.ui.touch.classList.toggle('hidden', mode !== 'play')
    this.showTouchIfNeeded()
  }

  private syncHud() {
    this.ui.time.textContent = formatTime(this.elapsed)
    const got = this.world.orbs.filter((o) => o.got).length
    this.ui.orbs.textContent = `${got} / ${this.world.orbs.length}`
    this.ui.deaths.textContent = String(this.deaths)
    this.ui.dash.classList.toggle('ready', this.player.canDash && !this.player.dashing)
  }

  private fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = VIEW_W * dpr
    this.canvas.height = VIEW_H * dpr
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  private showTouchIfNeeded() {
    const coarse = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900
    if (this.mode === 'play' && coarse) this.ui.touch.classList.remove('hidden')
    else this.ui.touch.classList.add('hidden')
  }
}

function formatTime(t: number) {
  const m = Math.floor(t / 60)
  const s = t - m * 60
  return `${m}:${s.toFixed(2).padStart(5, '0')}`
}
