export type PlatType = 'solid' | 'oneway' | 'moving'

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
}

export type Rect = { x: number; y: number; w: number; h: number }

export type Orb = Rect & { got: boolean }
export type Checkpoint = Rect & { armed: boolean }
export type Sign = { x: number; y: number; text: string }
export type Prop = { kind: 'antenna' | 'tank' | 'vent' | 'crane'; x: number; y: number }

export type World = {
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
}

function solid(x: number, y: number, w: number, h: number): Platform {
  return plat(x, y, w, h, 'solid')
}

function oneway(x: number, y: number, w: number): Platform {
  return plat(x, y, w, 16, 'oneway')
}

function moving(
  x: number,
  y: number,
  w: number,
  h: number,
  axis: 'x' | 'y',
  range: number,
  speed: number,
): Platform {
  const p = plat(x, y, w, h, 'moving')
  p.axis = axis
  p.range = range
  p.speed = speed
  return p
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
  }
}

export function createWorld(): World {
  const platforms: Platform[] = []
  const spikes: Rect[] = []
  const orbs: Orb[] = []
  const checkpoints: Checkpoint[] = []
  const signs: Sign[] = []
  const props: Prop[] = []

  const addOrb = (x: number, y: number) => orbs.push({ x, y, w: 16, h: 16, got: false })
  const addCheck = (x: number, y: number) => checkpoints.push({ x, y, w: 28, h: 56, armed: false })
  const spikeRow = (x: number, y: number, w: number) => spikes.push({ x, y, w, h: 18 })

  // --- 1. Opening roofs ---
  platforms.push(solid(0, 640, 460, 360))
  platforms.push(solid(540, 640, 200, 360))
  platforms.push(solid(820, 600, 190, 400))
  platforms.push(solid(1090, 640, 250, 360))
  platforms.push(solid(1420, 560, 210, 80))
  signs.push({ x: 120, y: 560, text: 'Skitter and jump the pipes' })
  addOrb(620, 580)
  addOrb(900, 540)
  props.push({ kind: 'vent', x: 80, y: 640 })
  props.push({ kind: 'tank', x: 300, y: 640 })

  // --- 2. Rising steps ---
  platforms.push(solid(1710, 500, 150, 40))
  platforms.push(solid(1940, 430, 150, 40))
  platforms.push(solid(2170, 360, 300, 48))
  signs.push({ x: 2180, y: 300, text: 'Checkpoint — keep moving' })
  addCheck(2320, 304)
  addOrb(2010, 370)
  props.push({ kind: 'antenna', x: 2410, y: 360 })

  // --- 3. Pipe stack (doorway under left riser, climb out the top) ---
  platforms.push(solid(2540, 640, 220, 48))
  platforms.push(solid(2760, 180, 28, 400))
  platforms.push(solid(2898, 168, 28, 500))
  spikeRow(2788, 782, 110)
  platforms.push(solid(2760, 800, 166, 70))
  platforms.push(solid(2878, 168, 350, 32))
  signs.push({ x: 2548, y: 580, text: 'Touch a pipe, then jump — no need to hold in' })
  addOrb(2840, 480)
  addOrb(2840, 300)

  // --- 4. Girder hops + oneway ---
  platforms.push(oneway(3220, 280, 120))
  platforms.push(oneway(3410, 220, 120))
  platforms.push(solid(3600, 420, 360, 48))
  addCheck(3720, 364)
  addOrb(3460, 170)
  signs.push({ x: 3620, y: 360, text: 'Hold down + jump to drop through' })
  props.push({ kind: 'crane', x: 3860, y: 420 })

  // --- 5. Slide tunnel ---
  platforms.push(solid(4040, 420, 620, 48))
  platforms.push(solid(4180, 300, 260, 92))
  platforms.push(solid(4560, 300, 140, 92))
  signs.push({ x: 4060, y: 360, text: 'Hold down to slide under' })
  addOrb(4300, 396)

  // --- 6. Dash canyon ---
  platforms.push(solid(4760, 500, 220, 48))
  platforms.push(solid(5280, 500, 180, 48))
  platforms.push(solid(5780, 460, 260, 48))
  spikeRow(4980, 780, 300)
  spikeRow(5460, 780, 320)
  platforms.push(solid(4980, 798, 300, 40))
  platforms.push(solid(5460, 798, 320, 40))
  signs.push({ x: 4770, y: 440, text: 'Dash (Shift / J) across the drain' })
  addOrb(5160, 430)
  addOrb(5620, 390)
  addCheck(5900, 404)

  // --- 7. Moving crane + vertical mix ---
  platforms.push(moving(6180, 420, 140, 28, 'x', 180, 1.15))
  platforms.push(oneway(6500, 340, 110))
  platforms.push(oneway(6500, 240, 110))
  platforms.push(solid(6680, 180, 32, 360))
  platforms.push(solid(6820, 120, 32, 420))
  platforms.push(solid(6680, 80, 172, 28))
  spikeRow(6712, 548, 108)
  platforms.push(solid(6680, 566, 172, 40))
  signs.push({ x: 6180, y: 360, text: 'Ride, then kick up the pipe stack' })
  addOrb(6550, 200)
  addOrb(6780, 40)

  // --- 8. Final sprint ---
  platforms.push(solid(7120, 220, 180, 40))
  platforms.push(solid(7380, 300, 140, 40))
  platforms.push(moving(7600, 260, 120, 28, 'y', 90, 1.3))
  platforms.push(solid(7860, 200, 420, 80))
  props.push({ kind: 'antenna', x: 8120, y: 200 })
  addOrb(7440, 250)
  addCheck(7900, 144)
  signs.push({ x: 7880, y: 140, text: 'The open drain' })

  return {
    w: 8400,
    h: 1100,
    killY: 980,
    spawn: { x: 80, y: 560 },
    platforms,
    spikes,
    orbs,
    checkpoints,
    goal: { x: 8120, y: 80, w: 70, h: 120 },
    signs,
    props,
  }
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

export function aabb(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function resetCollectibles(world: World) {
  for (const o of world.orbs) o.got = false
  for (const c of world.checkpoints) c.armed = false
}
