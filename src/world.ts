import type { CosmeticId } from './cosmetics'

export type PlatType = 'solid' | 'oneway' | 'moving' | 'crumble'
export type Theme = 'gutter' | 'filter' | 'overflow'
export type LevelId = 0 | 1 | 2

export type Platform = {
  x: number
  y: number
  w: number
  h: number
  type: PlatType
  vx: number
  originX: number
  originY: number
  axis: 'x' | 'y'
  range: number
  speed: number
  phase: number
  crumble: 'idle' | 'shake' | 'gone'
  timer: number
}

export type Rect = { x: number; y: number; w: number; h: number }

export type Orb = Rect & { got: boolean }
export type Checkpoint = Rect & { armed: boolean }
export type Sign = { x: number; y: number; text: string }
export type Prop = {
  kind:
    | 'antenna'
    | 'tank'
    | 'vent'
    | 'crane'
    | 'barrel'
    | 'barrelTip'
    | 'shroom'
    | 'web'
    | 'lamp'
    | 'nest'
    | 'grate'
    | 'chain'
  x: number
  y: number
}

export type Fan = Rect & { fx: number; fy: number }
export type DripSpout = { x: number; y: number; every: number; t: number }
export type Drip = { x: number; y: number; vy: number }
export type Crusher = Rect & {
  originY: number
  range: number
  speed: number
  phase: number
}

export type Smoke = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
}

export type Npc = {
  id: string
  x: number
  y: number
  facing: 1 | -1
  name: string
  lines: string[]
  gift?: CosmeticId
  look: CosmeticId
  talked: boolean
  smoke: Smoke[]
}

export type Secret = {
  id: CosmeticId
  x: number
  y: number
  w: number
  h: number
  got: boolean
}

export type Pop = {
  x: number
  y: number
  text: string
  life: number
  max: number
  color: string
}

export type Ring = {
  x: number
  y: number
  r: number
  life: number
  max: number
  color: string
}

export type World = {
  id: LevelId
  name: string
  subtitle: string
  theme: Theme
  w: number
  h: number
  killY: number
  spawn: { x: number; y: number }
  platforms: Platform[]
  spikes: Rect[]
  orbs: Orb[]
  checkpoints: Checkpoint[]
  goal: Rect
  signs: Sign[]
  props: Prop[]
  fans: Fan[]
  spouts: DripSpout[]
  drips: Drip[]
  crushers: Crusher[]
  npcs: Npc[]
  secrets: Secret[]
}

export const LEVELS: { id: LevelId; name: string; subtitle: string }[] = [
  { id: 0, name: 'The Gutters', subtitle: 'Learn the crawl' },
  { id: 1, name: 'The Filter', subtitle: 'Do not linger' },
  { id: 2, name: 'The Overflow', subtitle: 'Ride the flood' },
]

export function solid(x: number, y: number, w: number, h: number): Platform {
  return plat(x, y, w, h, 'solid')
}

export function oneway(x: number, y: number, w: number): Platform {
  return plat(x, y, w, 16, 'oneway')
}

export function moving(
  x: number,
  y: number,
  w: number,
  h: number,
  axis: 'x' | 'y',
  range: number,
  speed: number,
  phase = 0,
): Platform {
  const p = plat(x, y, w, h, 'moving')
  p.axis = axis
  p.range = range
  p.speed = speed
  p.phase = phase
  return p
}

export function crumble(x: number, y: number, w: number): Platform {
  return plat(x, y, w, 18, 'crumble')
}

function plat(x: number, y: number, w: number, h: number, type: PlatType): Platform {
  return {
    x,
    y,
    w,
    h,
    type,
    vx: 0,
    originX: x,
    originY: y,
    axis: 'x',
    range: 0,
    speed: 0,
    phase: 0,
    crumble: 'idle',
    timer: 0,
  }
}

export function aabb(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function platActive(p: Platform) {
  return p.crumble !== 'gone'
}

export function npc(
  id: string,
  x: number,
  y: number,
  facing: 1 | -1,
  name: string,
  lines: string[],
  look: CosmeticId,
  gift?: CosmeticId,
): Npc {
  return { id, x, y, facing, name, lines, look, gift, talked: false, smoke: [] }
}

export function stash(id: CosmeticId, x: number, y: number): Secret {
  return { id, x, y, w: 28, h: 24, got: false }
}

export function updateNpcSmoke(npcs: Npc[], dt: number) {
  for (const n of npcs) {
    const mouthX = n.x + n.facing * 16
    const mouthY = n.y - 27
    if (Math.random() < 0.45) {
      n.smoke.push({
        x: mouthX + (Math.random() - 0.5) * 4,
        y: mouthY + (Math.random() - 0.5) * 3,
        vx: -n.facing * (10 + Math.random() * 22),
        vy: -14 - Math.random() * 28,
        life: 0.55 + Math.random() * 0.4,
        max: 0.8,
        size: 3 + Math.random() * 5,
      })
    }
    for (const s of n.smoke) {
      s.life -= dt
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.vy -= 14 * dt
      s.vx *= 0.97
      s.size += 8 * dt
    }
    n.smoke = n.smoke.filter((s) => s.life > 0).slice(-40)
  }
}

export function resetCollectibles(world: World) {
  for (const o of world.orbs) o.got = false
  for (const c of world.checkpoints) c.armed = false
  world.drips = []
  for (const p of world.platforms) {
    if (p.type === 'crumble') {
      p.crumble = 'idle'
      p.timer = 0
    }
  }
}

export function updateMovers(world: World, dt: number) {
  updateMoving(world, dt)
  updateCrushers(world, dt)
}

export function updateHazards(world: World, dt: number, riding: Platform | null, body: Rect) {
  updateDrips(world, dt)
  updateCrumbles(world, dt, riding, body)
}

export function updateMoving(world: World, dt: number) {
  for (const p of world.platforms) {
    if (p.type !== 'moving') {
      p.vx = 0
      continue
    }
    const prevX = p.x
    p.phase += dt * p.speed
    const wave = (Math.sin(p.phase) + 1) / 2
    if (p.axis === 'x') p.x = p.originX + wave * p.range
    else p.y = p.originY + (wave - 0.5) * 2 * p.range
    p.vx = (p.x - prevX) / dt
  }
}

function updateCrushers(world: World, dt: number) {
  for (const c of world.crushers) {
    c.phase += dt * c.speed
    const t = ((c.phase % 1) + 1) % 1
    let k = 0
    if (t < 0.32) k = 0
    else if (t < 0.42) k = (t - 0.32) / 0.1
    else if (t < 0.58) k = 1
    else k = 1 - (t - 0.58) / 0.42
    c.y = c.originY + k * c.range
  }
}

function updateDrips(world: World, dt: number) {
  for (const s of world.spouts) {
    s.t += dt
    if (s.t >= s.every) {
      s.t -= s.every
      world.drips.push({ x: s.x, y: s.y, vy: 40 })
    }
  }
  for (const d of world.drips) {
    d.vy = Math.min(980, d.vy + 1600 * dt)
    d.y += d.vy * dt
  }
  world.drips = world.drips.filter((d) => {
    if (d.y > world.killY + 40) return false
    const box = { x: d.x, y: d.y, w: 10, h: 12 }
    for (const p of world.platforms) {
      if (!platActive(p) || p.type === 'oneway') continue
      if (aabb(box, p)) return false
    }
    return true
  })
}

function updateCrumbles(world: World, dt: number, riding: Platform | null, body: Rect) {
  if (riding && riding.type === 'crumble' && riding.crumble === 'idle') {
    riding.crumble = 'shake'
    riding.timer = 0.42
  }
  for (const p of world.platforms) {
    if (p.type !== 'crumble') continue
    if (p.crumble === 'idle') continue
    p.timer -= dt
    if (p.timer > 0) continue
    if (p.crumble === 'shake') {
      p.crumble = 'gone'
      p.timer = 1.7
    } else if (aabb(body, p)) {
      p.timer = 0.15
    } else {
      p.crumble = 'idle'
      p.timer = 0
    }
  }
}

export function makeWorld(
  id: LevelId,
  name: string,
  subtitle: string,
  theme: Theme,
  w: number,
  h: number,
  killY: number,
  spawn: { x: number; y: number },
  goal: Rect,
  bits: {
    platforms: Platform[]
    spikes: Rect[]
    orbs: Orb[]
    checkpoints: Checkpoint[]
    signs: Sign[]
    props: Prop[]
    fans?: Fan[]
    spouts?: DripSpout[]
    crushers?: Crusher[]
    npcs?: Npc[]
    secrets?: Secret[]
  },
): World {
  return {
    id,
    name,
    subtitle,
    theme,
    w,
    h,
    killY,
    spawn,
    platforms: bits.platforms,
    spikes: bits.spikes,
    orbs: bits.orbs,
    checkpoints: bits.checkpoints,
    goal,
    signs: bits.signs,
    props: bits.props,
    fans: bits.fans ?? [],
    spouts: bits.spouts ?? [],
    drips: [],
    crushers: bits.crushers ?? [],
    npcs: bits.npcs ?? [],
    secrets: bits.secrets ?? [],
  }
}
