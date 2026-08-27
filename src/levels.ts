import {
  crumble,
  makeWorld,
  moving,
  npc,
  oneway,
  solid,
  stash,
  type Crusher,
  type DripSpout,
  type Fan,
  type LevelId,
  type Npc,
  type Orb,
  type Platform,
  type Prop,
  type Rect,
  type Secret,
  type Sign,
  type World,
} from './world'

export function createWorld(id: LevelId = 0): World {
  if (id === 1) return filterBeds()
  if (id === 2) return overflow()
  return gutters()
}

function kit() {
  const platforms: Platform[] = []
  const spikes: Rect[] = []
  const orbs: Orb[] = []
  const checkpoints: { x: number; y: number; w: number; h: number; armed: boolean }[] = []
  const signs: Sign[] = []
  const props: Prop[] = []
  const fans: Fan[] = []
  const spouts: DripSpout[] = []
  const crushers: Crusher[] = []
  const npcs: Npc[] = []
  const secrets: Secret[] = []

  return {
    platforms,
    spikes,
    orbs,
    checkpoints,
    signs,
    props,
    fans,
    spouts,
    crushers,
    npcs,
    secrets,
    s: (x: number, y: number, w: number, h: number) => platforms.push(solid(x, y, w, h)),
    o: (x: number, y: number, w: number) => platforms.push(oneway(x, y, w)),
    m: (
      x: number,
      y: number,
      w: number,
      h: number,
      axis: 'x' | 'y',
      range: number,
      speed: number,
      phase = 0,
    ) => platforms.push(moving(x, y, w, h, axis, range, speed, phase)),
    c: (x: number, y: number, w: number) => platforms.push(crumble(x, y, w)),
    k: (x: number, y: number, w: number) => spikes.push({ x, y, w, h: 18 }),
    r: (x: number, y: number) => orbs.push({ x, y, w: 16, h: 16, got: false }),
    v: (x: number, y: number) => checkpoints.push({ x, y, w: 28, h: 56, armed: false }),
    n: (x: number, y: number, text: string) => signs.push({ x, y, text }),
    p: (kind: Prop['kind'], x: number, y: number) => props.push({ kind, x, y }),
    f: (x: number, y: number, w: number, h: number, fx: number, fy: number) =>
      fans.push({ x, y, w, h, fx, fy }),
    d: (x: number, y: number, every: number, t = 0) => spouts.push({ x, y, every, t }),
    x: (x: number, y: number, w: number, h: number, range: number, speed: number, phase = 0) =>
      crushers.push({ x, y, w, h, originY: y, range, speed, phase }),
    npc: (n: Npc) => npcs.push(n),
    stash: (s: Secret) => secrets.push(s),
  }
}

function gutters(): World {
  const b = kit()

  b.s(0, 640, 480, 360)
  b.s(560, 640, 220, 360)
  b.s(860, 600, 200, 400)
  b.s(1140, 640, 280, 360)
  b.s(1500, 560, 220, 80)
  b.n(90, 560, 'Skitter the gutter. Jump the breaks.')
  b.r(640, 580)
  b.r(940, 540)
  b.p('vent', 36, 640)
  b.p('barrel', 200, 640)
  b.p('barrelTip', 320, 640)
  b.p('shroom', 430, 640)
  b.p('web', 16, 640)
  b.p('lamp', 880, 600)
  b.p('nest', 1280, 640)
  b.npc(
    npc(
      'nix',
      390,
      640,
      -1,
      'Nix',
      [
        'Hey. Got a light? Nah, keep yours. That one is lucky.',
        'You dash with the wings out. Looks stupid. Looks fast.',
        'Take the ash stain. Wear the crawl.',
      ],
      'ash',
      'ash',
    ),
  )

  b.s(20, 520, 120, 24)
  b.s(8, 430, 110, 24)
  b.r(40, 390)
  b.n(24, 390, 'Someone stashed a crumb up here')

  b.s(1800, 500, 160, 40)
  b.s(2040, 430, 160, 40)
  b.s(2280, 360, 340, 48)
  b.n(2300, 300, 'Valve. Falls send you here.')
  b.v(2480, 304)
  b.r(2100, 370)
  b.p('antenna', 2540, 360)
  b.p('barrel', 2320, 360)
  b.p('web', 2284, 360)

  b.s(2680, 640, 240, 48)
  b.s(2920, 180, 28, 400)
  b.s(3058, 168, 28, 500)
  b.k(2948, 782, 110)
  b.s(2920, 800, 166, 70)
  b.s(3038, 168, 360, 32)
  b.n(2688, 580, 'Touch a pipe, then jump. No need to hold in.')
  b.r(3000, 480)
  b.r(3000, 300)
  b.p('chain', 2920, 180)
  b.p('lamp', 3180, 168)

  b.o(3400, 280, 120)
  b.o(3590, 220, 120)
  b.s(3780, 420, 380, 48)
  b.v(3920, 364)
  b.r(3640, 170)
  b.n(3800, 360, 'Down + jump drops through grates')
  b.p('crane', 4040, 420)
  b.p('barrelTip', 3880, 420)
  b.p('shroom', 3770, 420)

  b.s(4240, 420, 640, 48)
  b.s(4380, 300, 280, 92)
  b.s(4780, 300, 140, 92)
  b.n(4260, 360, 'Hold down to slide the low pipe')
  b.r(4500, 396)
  b.p('vent', 4260, 420)
  b.p('grate', 4520, 300)

  b.s(5020, 500, 220, 48)
  b.s(5540, 500, 180, 48)
  b.s(6040, 460, 280, 48)
  b.k(5240, 780, 300)
  b.k(5720, 780, 320)
  b.s(5240, 798, 300, 40)
  b.s(5720, 798, 320, 40)
  b.n(5030, 440, 'Dash (Shift / J) — wings out, across the drain')
  b.r(5380, 430)
  b.r(5880, 390)
  b.v(6160, 404)
  b.p('tank', 6120, 460)
  b.p('shroom', 5040, 500)
  b.p('nest', 5600, 500)

  b.m(6460, 420, 140, 28, 'x', 180, 1.15)
  b.o(6780, 340, 110)
  b.o(6780, 240, 110)
  b.s(6960, 180, 32, 360)
  b.s(7100, 120, 32, 420)
  b.s(6960, 80, 172, 28)
  b.k(6992, 548, 108)
  b.s(6960, 566, 172, 40)
  b.n(6460, 360, 'Ride, then kick up the stack')
  b.r(6830, 200)
  b.r(7060, 40)

  b.s(7400, 220, 180, 40)
  b.c(7640, 300, 100)
  b.s(7820, 300, 120, 40)
  b.m(8020, 240, 120, 28, 'y', 90, 1.3)
  b.s(8280, 200, 460, 80)
  b.p('antenna', 8560, 200)
  b.p('barrel', 8400, 200)
  b.p('barrel', 8468, 200)
  b.p('web', 8284, 200)
  b.p('lamp', 8680, 200)
  b.r(7700, 250)
  b.v(8340, 144)
  b.n(8300, 140, 'Filter gate — crawl on')
  b.npc(
    npc(
      'soot',
      8480,
      200,
      -1,
      'Soot',
      [
        'Gate’s open if you are. I am not. Break is eternal.',
        'If you pick the place clean, the shell blushes. Pride thing.',
      ],
      'stock',
    ),
  )

  return makeWorld(
    0,
    'The Gutters',
    'Learn the crawl',
    'gutter',
    8900,
    1100,
    980,
    { x: 80, y: 560 },
    { x: 8580, y: 80, w: 70, h: 120 },
    b,
  )
}

function filterBeds(): World {
  const b = kit()

  b.s(0, 700, 520, 400)
  b.s(640, 680, 240, 48)
  b.k(520, 900, 120)
  b.s(520, 918, 120, 40)
  b.n(80, 620, 'Filter beds. Rust eats anything that waits.')
  b.r(720, 620)
  b.p('tank', 40, 700)
  b.p('barrel', 180, 700)
  b.p('barrelTip', 260, 700)
  b.p('lamp', 400, 700)
  b.p('vent', 660, 680)
  b.npc(
    npc(
      'gilt',
      320,
      700,
      1,
      'Gilt',
      [
        'Presses keep time. I keep smoke. Fair trade.',
        'Goldleaf is rust that learned manners. Yours if you want it.',
      ],
      'goldleaf',
      'goldleaf',
    ),
  )
  b.s(16, 560, 130, 24)
  b.s(8, 418, 130, 24)
  b.stash(stash('midnight', 28, 394))
  b.r(70, 378)
  b.n(20, 390, 'A stash nobody claimed')

  b.c(980, 640, 120)
  b.c(1160, 640, 120)
  b.c(1340, 640, 120)
  b.k(980, 900, 500)
  b.s(980, 918, 500, 40)
  b.s(1560, 640, 300, 48)
  b.n(990, 580, 'Do not linger on the plates')
  b.v(1680, 584)
  b.r(1220, 580)
  b.p('grate', 1580, 640)
  b.p('nest', 1760, 640)
  b.p('web', 1564, 640)

  b.s(1940, 640, 980, 48)
  b.s(1940, 180, 980, 36)
  b.x(2140, 216, 88, 44, 385, 0.72, 0)
  b.x(2480, 216, 88, 44, 385, 0.72, 0.33)
  b.x(2820, 216, 88, 44, 385, 0.72, 0.66)
  b.n(1960, 580, 'Time the presses. Dash if you mistime.')
  b.r(2320, 580)
  b.r(2660, 580)
  b.p('chain', 2140, 180)
  b.p('chain', 2480, 180)
  b.p('chain', 2820, 180)
  b.p('lamp', 2000, 180)

  b.s(3000, 560, 180, 40)
  b.s(3260, 470, 140, 40)
  b.s(3480, 160, 28, 430)
  b.s(3628, 140, 28, 500)
  b.k(3508, 762, 120)
  b.s(3480, 780, 176, 50)
  b.s(3480, 120, 176, 28)
  b.n(3008, 500, 'Kick the rust stack')
  b.r(3568, 420)
  b.r(3568, 240)
  b.v(3520, 64)
  b.p('antenna', 3580, 120)

  b.m(3820, 280, 140, 26, 'x', 220, 1.05)
  b.m(4220, 360, 140, 26, 'y', 90, 1.15, 0.4)
  b.o(4560, 300, 110)
  b.s(4760, 400, 260, 40)
  b.n(3820, 220, 'Ride the trays')
  b.r(4280, 300)
  b.r(4600, 250)
  b.v(4880, 344)
  b.p('crane', 4900, 400)
  b.p('barrel', 4800, 400)

  b.s(5120, 420, 180, 40)
  b.k(5300, 820, 300)
  b.s(5300, 838, 300, 40)
  b.x(5400, 160, 90, 40, 210, 0.9, 0.2)
  b.s(5600, 400, 240, 40)
  b.n(5130, 360, 'Dash the pit. The press does not wait.')
  b.r(5440, 270)
  b.p('shroom', 5140, 420)
  b.p('tank', 5840, 400)

  b.c(6120, 360, 100)
  b.c(6300, 280, 100)
  b.c(6120, 200, 100)
  b.c(6300, 120, 100)
  b.s(6520, 100, 300, 40)
  b.k(6120, 700, 400)
  b.s(6120, 718, 400, 40)
  b.n(6130, 320, 'Climb fast. Plates dump.')
  b.r(6160, 70)
  b.r(6640, 50)
  b.v(6600, 44)
  b.p('lamp', 6560, 100)
  b.p('web', 6524, 100)

  b.s(6920, 180, 200, 40)
  b.m(7200, 140, 130, 26, 'x', 160, 1.35)
  b.s(7560, 120, 520, 80)
  b.p('antenna', 7900, 120)
  b.p('barrel', 7700, 120)
  b.p('barrelTip', 7770, 120)
  b.p('grate', 7580, 120)
  b.p('lamp', 8000, 120)
  b.r(7260, 90)
  b.n(7580, 60, 'Overflow hatch')

  return makeWorld(
    1,
    'The Filter',
    'Do not linger',
    'filter',
    8240,
    1200,
    1080,
    { x: 80, y: 620 },
    { x: 7900, y: 0, w: 70, h: 120 },
    b,
  )
}

function overflow(): World {
  const b = kit()

  b.s(0, 760, 860, 420)
  b.f(280, 480, 520, 280, 520, -40)
  b.n(80, 680, 'Overflow current. Let it carry you.')
  b.r(500, 700)
  b.p('vent', 40, 760)
  b.p('barrel', 160, 760)
  b.p('nest', 240, 760)
  b.p('lamp', 700, 760)
  b.p('shroom', 800, 760)
  b.npc(
    npc(
      'brine',
      140,
      760,
      1,
      'Brine',
      [
        'Current’s a liar. It carries you until it doesn’t.',
        'You’re already wet. Might as well look it.',
      ],
      'wet',
      'wet',
    ),
  )

  b.s(960, 720, 180, 40)
  b.s(1220, 680, 160, 40)
  b.s(1480, 700, 150, 40)
  b.s(1720, 640, 160, 40)
  b.s(1980, 680, 200, 40)
  b.d(1280, 120, 1.15, 0)
  b.d(1520, 80, 0.95, 0.4)
  b.d(1760, 100, 1.05, 0.2)
  b.d(1900, 90, 0.85, 0.7)
  b.k(1140, 980, 900)
  b.s(1140, 998, 900, 40)
  b.n(980, 660, 'Acid drips. Dash through a drop.')
  b.r(1540, 640)
  b.r(1780, 580)
  b.v(2040, 624)
  b.p('chain', 1280, 120)
  b.p('chain', 1760, 100)
  b.p('web', 1984, 680)

  b.s(2320, 900, 280, 48)
  b.s(2320, 80, 28, 820)
  b.s(2572, 80, 28, 820)
  b.s(2320, 52, 280, 28)
  b.f(2350, 160, 220, 720, 0, -2520)
  b.s(2600, 200, 180, 28)
  b.n(2330, 840, 'Ride the updraft. Jump if you stall.')
  b.r(2440, 500)
  b.r(2440, 260)
  b.v(2660, 144)
  b.p('antenna', 2480, 52)
  b.p('lamp', 2680, 200)
  b.npc(
    npc(
      'vex',
      2488,
      52,
      -1,
      'Vex',
      [
        'Took you long enough. Most of us stop at the sludge.',
        'Ruby’s a warning color. Predators hate a cocky bug.',
        'Wear it. Then get out. I like the quiet.',
      ],
      'ruby',
      'ruby',
    ),
  )

  b.s(2880, 240, 160, 40)
  b.s(3200, 280, 140, 40)
  b.c(3480, 260, 110)
  b.s(3720, 300, 160, 40)
  b.d(3100, 40, 0.9, 0.1)
  b.d(3340, 20, 1.1, 0.5)
  b.d(3580, 40, 0.8, 0.3)
  b.k(3040, 860, 800)
  b.s(3040, 878, 800, 40)
  b.n(2890, 180, 'Dash the curtain')
  b.r(3260, 220)
  b.r(3520, 200)
  b.p('shroom', 2900, 240)

  b.s(4000, 420, 200, 40)
  b.s(4280, 140, 28, 420)
  b.s(4430, 120, 28, 480)
  b.s(4580, 100, 28, 540)
  b.s(4280, 80, 328, 28)
  b.k(4308, 702, 272)
  b.s(4280, 720, 328, 40)
  b.n(4010, 360, 'Three stacks. Keep kicking.')
  b.r(4370, 360)
  b.r(4520, 280)
  b.r(4370, 160)
  b.v(4320, 24)
  b.p('chain', 4280, 80)
  b.p('chain', 4580, 80)

  b.s(4780, 200, 160, 40)
  b.c(5000, 240, 110)
  b.c(5180, 200, 110)
  b.x(5360, 40, 90, 36, 220, 0.78, 0.15)
  b.s(5520, 260, 180, 40)
  b.k(4960, 700, 680)
  b.s(4960, 718, 680, 40)
  b.n(4790, 140, 'Plates, then a press')
  b.r(5220, 150)
  b.r(5600, 210)
  b.v(5580, 204)
  b.p('grate', 5540, 260)
  b.p('nest', 5640, 260)

  b.m(5820, 240, 140, 26, 'x', 180, 1.2)
  b.f(6040, 80, 260, 280, 380, -80)
  b.o(6280, 180, 120)
  b.s(6500, 280, 150, 40)
  b.s(6740, 200, 140, 40)
  b.m(6980, 160, 130, 26, 'y', 80, 1.25, 0.5)
  b.s(7280, 140, 200, 40)
  b.n(5830, 180, 'Current, grate, last hop')
  b.r(6320, 130)
  b.r(6800, 140)
  b.r(7340, 90)

  b.s(7560, 180, 560, 80)
  b.p('antenna', 7920, 180)
  b.p('barrel', 7700, 180)
  b.p('web', 7564, 180)
  b.p('lamp', 8040, 180)
  b.p('grate', 7580, 180)
  b.n(7600, 120, 'Street grate. Daylight.')
  b.v(7640, 124)

  return makeWorld(
    2,
    'The Overflow',
    'Ride the flood',
    'overflow',
    8280,
    1200,
    1080,
    { x: 80, y: 680 },
    { x: 7960, y: 60, w: 70, h: 120 },
    b,
  )
}
