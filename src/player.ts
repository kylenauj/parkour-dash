import {
  ACCEL_AIR,
  ACCEL_GROUND,
  COYOTE,
  CORNER,
  DASH_END_KEEP,
  DASH_SPEED,
  DASH_TIME,
  FAST_FALL,
  FRICTION,
  GRAVITY,
  JUMP_BUFFER,
  JUMP_CUT_GRAVITY,
  JUMP_VEL,
  MAX_FALL,
  PLAYER_H,
  PLAYER_SLIDE_H,
  PLAYER_W,
  RUN_SPEED,
  SLIDE_DASH_SPEED,
  SLIDE_DASH_TIME,
  SLIDE_FRICTION,
  WALL_CONTROL_LOCK,
  WALL_COYOTE,
  WALL_JUMP_X,
  WALL_JUMP_Y,
  WALL_LOCK,
  WALL_SLIDE_SPEED,
} from './const'
import type { Input } from './input'
import type { Platform, World } from './world'
import { aabb, platActive } from './world'

export type Ghost = { x: number; y: number; h: number; life: number }

export type Smoke = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
}

export class Player {
  x = 0
  y = 0
  vx = 0
  vy = 0
  w = PLAYER_W
  h = PLAYER_H
  facing = 1
  onGround = false
  onWall = 0
  sliding = false
  dashing = false
  slideDash = false
  canDash = true
  wallKickT = 0
  squish = 1
  coyote = 0
  jumpBuf = 0
  dashT = 0
  wallLock = 0
  wallCoyote = 0
  wallMemory = 0
  lastWall = 0
  controlLock = 0
  dropT = 0
  ghosts: Ghost[] = []
  smoke: Smoke[] = []
  riding: Platform | null = null
  justLanded = false
  landSpeed = 0
  justJumped = false
  jumpedFromWall = false
  justDashed = false
  busy = false
  dead = false
  spawnX = 0
  spawnY = 0

  spawnAt(x: number, y: number) {
    this.setSpawn(x, y)
    this.resetToSpawn()
  }

  setSpawn(x: number, y: number) {
    this.spawnX = x
    this.spawnY = y
  }

  resetToSpawn() {
    this.x = this.spawnX
    this.y = this.spawnY
    this.vx = 0
    this.vy = 0
    this.h = PLAYER_H
    this.sliding = false
    this.dashing = false
    this.slideDash = false
    this.canDash = true
    this.wallKickT = 0
    this.onGround = false
    this.onWall = 0
    this.dashT = 0
    this.coyote = 0
    this.wallCoyote = 0
    this.wallMemory = 0
    this.lastWall = 0
    this.controlLock = 0
    this.jumpBuf = 0
    this.dead = false
    this.ghosts = []
    this.smoke = []
  }

  get cx() {
    return this.x + this.w / 2
  }

  get cy() {
    return this.y + this.h / 2
  }

  get bottom() {
    return this.y + this.h
  }

  update(dt: number, input: Input, world: World) {
    this.justLanded = false
    this.justJumped = false
    this.jumpedFromWall = false
    this.justDashed = false
    this.wallKickT = Math.max(0, this.wallKickT - dt)
    this.wallLock = Math.max(0, this.wallLock - dt)
    this.controlLock = Math.max(0, this.controlLock - dt)
    this.dropT = Math.max(0, this.dropT - dt)
    this.wallCoyote = Math.max(0, this.wallCoyote - dt)
    this.squish += (1 - this.squish) * Math.min(1, dt * 12)

    if (input.jumpPressed) this.jumpBuf = JUMP_BUFFER
    else this.jumpBuf = Math.max(0, this.jumpBuf - dt)

    this.handleDash(input)
    this.handleSlide(input, world)

    if (!this.dashing && this.controlLock <= 0) this.accelerate(input, dt)

    if (this.dashing) {
      this.dashT -= dt
      if (this.dashT <= 0) {
        const wasSlide = this.slideDash
        this.dashing = false
        this.slideDash = false
        this.vx *= DASH_END_KEEP
        this.vy = wasSlide ? 0 : this.vy * DASH_END_KEEP
      } else if (this.slideDash) {
        this.vy = 0
      }
    } else {
      this.applyGravity(input, dt)
    }

    if (!this.dashing) {
      for (const fan of world.fans) {
        if (aabb(this, fan)) {
          this.vx += fan.fx * dt
          this.vy += fan.fy * dt
        }
      }
    }

    this.vy = Math.max(-920, Math.min(MAX_FALL, this.vy))
    this.vx = Math.max(-980, Math.min(980, this.vx))

    this.tryJump(input)

    if (this.riding && this.onGround) this.x += this.riding.vx * dt

    this.move(world, this.vx * dt, this.vy * dt)

    if (this.onGround) {
      this.coyote = COYOTE
      this.canDash = true
    } else {
      this.coyote = Math.max(0, this.coyote - dt)
    }

    if (this.dashing) {
      this.ghosts.push({ x: this.x, y: this.y, h: this.h, life: 0.24 })
    }
    for (const g of this.ghosts) g.life -= dt
    this.ghosts = this.ghosts.filter((g) => g.life > 0)
    this.updateSmoke(dt)
  }

  get mouthX() {
    return this.cx + this.facing * 16
  }

  get mouthY() {
    return this.y + (this.sliding ? this.h * 0.45 : 11)
  }

  private updateSmoke(dt: number) {
    const moving = Math.abs(this.vx) > 40 || this.dashing || !this.onGround
    if (moving) {
      const n = this.dashing ? 4 : 2
      for (let i = 0; i < n; i++) {
        this.smoke.push({
          x: this.mouthX + (Math.random() - 0.5) * 6,
          y: this.mouthY + (Math.random() - 0.5) * 4,
          vx: -this.facing * (18 + Math.random() * 40) + this.vx * 0.12,
          vy: -20 - Math.random() * 50,
          life: 0.45 + Math.random() * 0.4,
          max: 0.7,
          size: 4 + Math.random() * 6,
        })
      }
    } else if (Math.random() < 0.35) {
      this.smoke.push({
        x: this.mouthX,
        y: this.mouthY,
        vx: -this.facing * 8,
        vy: -16,
        life: 0.5,
        max: 0.5,
        size: 3,
      })
    }
    for (const s of this.smoke) {
      s.life -= dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.vy -= 18 * dt
      s.vx *= 0.96
      s.size += 10 * dt
    }
    this.smoke = this.smoke.filter((s) => s.life > 0).slice(-90)
  }

  private handleDash(input: Input) {
    if (this.busy) return
    if (!input.dashPressed || !this.canDash || this.dashing) return
    const low = this.sliding || (this.onGround && input.down)
    if (low) {
      const dir = input.x !== 0 ? input.x : this.facing
      this.facing = dir > 0 ? 1 : -1
      this.sliding = true
      this.slideDash = true
      this.setHeight(PLAYER_SLIDE_H)
      this.vx = this.facing * SLIDE_DASH_SPEED
      this.vy = 0
      this.dashing = true
      this.canDash = false
      this.dashT = SLIDE_DASH_TIME
      this.justDashed = true
      return
    }
    let dx = input.x
    let dy = input.up ? -1 : input.down ? 1 : 0
    if (dx === 0 && dy === 0) dx = this.facing
    const mag = Math.hypot(dx, dy) || 1
    this.vx = (dx / mag) * DASH_SPEED
    this.vy = (dy / mag) * DASH_SPEED
    this.dashing = true
    this.slideDash = false
    this.canDash = false
    this.dashT = DASH_TIME
    this.justDashed = true
    this.sliding = false
    this.setHeight(PLAYER_H)
    if (dx !== 0) this.facing = dx > 0 ? 1 : -1
  }

  private handleSlide(input: Input, world: World) {
    if (this.slideDash) return
    const want = this.onGround && input.down && Math.abs(this.vx) > 70 && !this.dashing
    if (want && !this.sliding) {
      this.sliding = true
      this.setHeight(PLAYER_SLIDE_H)
    }
    if (this.sliding && (!input.down || !this.onGround || Math.abs(this.vx) < 40)) {
      if (this.canStand(world)) {
        this.sliding = false
        this.setHeight(PLAYER_H)
      }
    }
  }

  private accelerate(input: Input, dt: number) {
    if (this.busy) {
      if (this.onGround) this.vx = approach(this.vx, 0, FRICTION * dt)
      return
    }
    const target = input.x * RUN_SPEED
    if (input.x !== 0) this.facing = input.x > 0 ? 1 : -1
    const accel = this.onGround ? ACCEL_GROUND : ACCEL_AIR
    if (input.x !== 0) {
      this.vx = approach(this.vx, target, accel * dt)
    } else if (this.onGround) {
      const fric = this.sliding ? SLIDE_FRICTION : FRICTION
      this.vx = approach(this.vx, 0, fric * dt)
    }
  }

  private applyGravity(input: Input, dt: number) {
    const clinging = this.onWall !== 0 && this.vy > 0 && this.wallLock <= 0
    if (clinging) {
      this.vy = Math.min(this.vy + GRAVITY * 0.25 * dt, WALL_SLIDE_SPEED)
      return
    }
    let g = GRAVITY
    if (this.vy < 0 && !input.jumpHeld) g *= JUMP_CUT_GRAVITY
    if (input.down && this.vy > 80) g *= FAST_FALL
    this.vy = Math.min(this.vy + g * dt, MAX_FALL)
  }

  private tryJump(input: Input) {
    if (this.jumpBuf <= 0 || this.dashing || this.busy) return

    if (this.onGround && input.down) {
      const ridingOneWay = this.riding?.type === 'oneway'
      if (ridingOneWay) {
        this.dropT = 0.18
        this.y += 4
        this.onGround = false
        this.jumpBuf = 0
        this.coyote = 0
        return
      }
    }

    const wallDir = this.onWall !== 0 ? this.onWall : this.wallCoyote > 0 ? this.wallMemory : 0
    const climbStart = this.onGround && wallDir !== 0 && input.x === wallDir
    if (wallDir !== 0 && this.wallLock <= 0 && (!this.onGround || climbStart)) {
      this.vx = -wallDir * WALL_JUMP_X
      this.vy = WALL_JUMP_Y
      this.facing = -wallDir
      this.jumpBuf = 0
      this.coyote = 0
      this.wallCoyote = 0
      this.lastWall = wallDir
      this.wallLock = WALL_LOCK
      this.controlLock = WALL_CONTROL_LOCK
      this.justJumped = true
      this.jumpedFromWall = true
      this.wallKickT = 0.18
      this.sliding = false
      this.setHeight(PLAYER_H)
      this.squish = 1.25
      return
    }

    if (this.onGround || this.coyote > 0) {
      this.vy = JUMP_VEL
      this.jumpBuf = 0
      this.coyote = 0
      this.onGround = false
      this.justJumped = true
      this.sliding = false
      this.setHeight(PLAYER_H)
      this.squish = 1.22
    }
  }

  private setHeight(h: number) {
    const feet = this.bottom
    this.h = h
    this.y = feet - this.h
  }

  private canStand(world: World) {
    const feet = this.bottom
    const test = { x: this.x, y: feet - PLAYER_H, w: this.w, h: PLAYER_H }
    for (const p of world.platforms) {
      if (p.type === 'oneway' || !platActive(p)) continue
      if (aabb(test, p)) return false
    }
    return true
  }

  private move(world: World, dx: number, dy: number) {
    this.onWall = 0
    this.riding = null
    this.onGround = false
    this.moveAxis(world, dx, 0)
    this.moveAxis(world, 0, dy)
    this.detectWalls(world)
    if (this.onWall !== 0) {
      this.wallCoyote = WALL_COYOTE
      this.wallMemory = this.onWall
    }
  }

  private detectWalls(world: World) {
    const y = this.y + 6
    const h = Math.max(8, this.h - 12)
    const right = { x: this.x + this.w, y, w: 5, h }
    const left = { x: this.x - 5, y, w: 5, h }
    const hitR = this.solidAt(world, right)
    const hitL = this.solidAt(world, left)
    let wall = 0
    if (hitR && hitL) wall = this.vx >= 0 ? 1 : -1
    else if (hitR) wall = 1
    else if (hitL) wall = -1
    if (this.wallLock > 0 && wall === this.lastWall) wall = 0
    this.onWall = wall
  }

  private moveAxis(world: World, dx: number, dy: number) {
    const prevBottom = this.bottom
    this.x += dx
    this.y += dy

    for (const p of world.platforms) {
      if (!platActive(p) || !aabb(this, p)) continue
      const oneWay = p.type === 'oneway'
      if (oneWay) {
        if (dx !== 0 || dy <= 0 || this.dropT > 0) continue
        if (prevBottom > p.y + 6) continue
      }

      if (dx > 0) {
        this.x = p.x - this.w
        this.vx = Math.min(this.vx, 0)
        if (!this.onGround) this.onWall = 1
      } else if (dx < 0) {
        this.x = p.x + p.w
        this.vx = Math.max(this.vx, 0)
        if (!this.onGround) this.onWall = -1
      } else if (dy > 0) {
        this.y = p.y - this.h
        this.landSpeed = this.vy
        if (!this.onGround && this.vy > 280) this.justLanded = true
        this.vy = 0
        this.onGround = true
        this.riding = p
        this.squish = Math.min(this.squish, 0.78)
      } else if (dy < 0) {
        const shifted = this.cornerCorrect(world, p)
        if (!shifted) {
          this.y = p.y + p.h
          this.vy = 0
        }
      }
    }
  }

  private cornerCorrect(world: World, blocked: Platform) {
    for (const dir of [1, -1]) {
      for (let i = 1; i <= CORNER; i++) {
        const test = { x: this.x + dir * i, y: this.y, w: this.w, h: this.h }
        if (!aabb(test, blocked) && !this.solidAt(world, test)) {
          this.x += dir * i
          return true
        }
      }
    }
    return false
  }

  private solidAt(world: World, r: { x: number; y: number; w: number; h: number }) {
    return world.platforms.some((p) => p.type !== 'oneway' && platActive(p) && aabb(r, p))
  }
}

function approach(v: number, target: number, delta: number) {
  if (v < target) return Math.min(v + delta, target)
  return Math.max(v - delta, target)
}
