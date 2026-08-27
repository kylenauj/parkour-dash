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
  if (id === 0) return ridge()
  if (id === 1) return gutters()
  if (id === 2) return filterBeds()
  if (id === 3) return overflow()
  if (id === 4) return flues()
  return grate()
}

/** Walk in under the left pipe, stand on a stoop, kick up, jump through the grate. */
function shaft(
  b: ReturnType<typeof kit>,
  left: number,
  floorY: number,
  grateY: number,
  exit: 'right' | 'left' = 'right',
  exitW = 280,
) {
  const gap = 128
  const pw = 26
  const right = left + pw + gap
  const span = pw * 2 + gap
  const top = grateY + 16
  const hang = floorY - 56
  const pipeH = Math.max(90, hang - top)

  b.s(left, top, pw, pipeH)
  b.s(right, top, pw, pipeH)
  b.s(right, hang, pw, floorY - hang + 190)

  const stoopW = pw + 58
  b.s(left - 12, floorY, stoopW, 26)

  b.k(left + stoopW - 12, floorY + 148, Math.max(40, span - stoopW + 12))
  b.s(left, floorY + 166, span, 48)

  b.o(left, grateY, span)
  if (exit === 'right') b.s(right + pw, grateY + 4, exitW, 28)
  else b.s(left - exitW, grateY + 4, exitW, 28)

  if (floorY - grateY > 320) {
    b.o(left + pw + 8, grateY + Math.floor((floorY - grateY) * 0.48), gap - 16)
  }
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

function ridge(): World {
  const b = kit()

  b.s(0, 620, 620, 380)
  b.n(70, 540, 'Lonely smoker. She’s at the top.')
  b.r(280, 560)
  b.p('tent', 80, 620)
  b.p('truck', 220, 620)
  b.p('barrel', 360, 620)
  b.p('barrelTip', 430, 620)
  b.p('pole', 520, 620)
  b.p('pine', 18, 620)
  b.p('pine', 118, 620)
  b.p('pine', 560, 620)
  b.p('grass', 160, 620)
  b.p('grass', 250, 620)
  b.p('grass', 480, 620)
  b.p('rock', 300, 620)
  b.npc(
    npc(
      'moss',
      490,
      620,
      -1,
      'Moss',
      [
        'You again. Cig’s still lit. Babe’s still at the top.',
        'Forest ends where the Pipe Line starts. Don’t get cute in the trees.',
        'Go on. She’s worse when she waits.',
      ],
      'wet',
    ),
  )

  b.s(680, 560, 160, 40)
  b.s(900, 500, 150, 40)
  b.s(1120, 560, 180, 40)
  b.r(940, 460)
  b.n(690, 500, 'Jump the rocks.')
  b.p('rock', 980, 500)
  b.p('grass', 1160, 560)

  b.s(1380, 620, 280, 380)
  b.o(1680, 540, 140)
  b.n(1400, 560, 'Down + jump drops through.')
  b.r(1720, 500)
  b.p('pine', 1480, 620)
  b.v(1520, 564)

  b.s(1900, 620, 200, 40)
  b.k(2100, 800, 200)
  b.s(2100, 818, 200, 40)
  b.s(2300, 580, 200, 40)
  b.n(1910, 560, 'Shift dashes the gap.')
  b.r(2180, 520)
  b.p('rock', 2340, 580)

  b.s(2580, 620, 240, 48)
  shaft(b, 2820, 620, 220, 'right', 260)
  b.n(2590, 560, 'Walk under. Hold in, jump.')
  b.r(2908, 420)
  b.p('pine', 2600, 620)
  b.v(3120, 168)

  b.s(3240, 224, 180, 40)
  b.s(3480, 300, 160, 40)
  b.s(3720, 380, 180, 40)
  b.s(3960, 460, 220, 40)
  b.n(3490, 240, 'Drop down toward the mouth.')
  b.r(3540, 260)
  b.r(4020, 420)


  b.s(4240, 520, 720, 480)
  b.p('mouth', 4560, 520)
  b.p('pole', 4320, 520)
  b.p('grass', 4400, 520)
  b.p('rock', 4700, 520)
  b.n(4280, 460, 'The Pipe Line. Crawl.')
  b.r(4480, 480)
  b.v(4300, 464)
  b.p('pine', 4880, 520)

  return makeWorld(
    0,
    'The Ridge',
    'Leave the trees',
    'woods',
    5200,
    1100,
    980,
    { x: 100, y: 540 },
    { x: 4620, y: 400, w: 90, h: 120 },
    b,
  )
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
        'Babe’s at the top of the line. That’s the whole crawl.',
        'Take the ash stain. Wear the lonely.',
      ],
      'ash',
      'ash',
    ),
  )

  b.s(20, 520, 120, 24)
  b.s(8, 430, 110, 24)
  b.r(40, 390)
  b.n(24, 390, 'Look up left of spawn — extra crumb on the ledges')

  b.s(1800, 500, 160, 40)
  b.s(2040, 430, 160, 40)
  b.s(2280, 360, 340, 48)
  b.n(2300, 300, 'Valve. Falls send you here.')
  b.v(2480, 304)
  b.r(2100, 370)
  b.p('antenna', 2540, 360)
  b.p('barrel', 2320, 360)
  b.p('web', 2284, 360)

  b.s(2680, 640, 260, 48)
  shaft(b, 2920, 640, 180, 'right', 320)
  b.n(2688, 580, 'Walk under the pipe. Hold into it, then jump. Kick up. Jump through the grate.')
  b.r(3000, 500)
  b.r(3000, 300)
  b.p('chain', 2920, 196)
  b.p('lamp', 3180, 184)

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
  b.o(6780, 340, 200)
  shaft(b, 6960, 340, 90, 'right', 240)
  b.n(6460, 360, 'Ride, walk in, kick up. Jump through the grate.')
  b.r(6830, 200)
  b.r(7220, 50)

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
    1,
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

  b.c(980, 640, 170)
  b.c(1135, 640, 170)
  b.c(1290, 640, 180)
  b.k(980, 900, 500)
  b.s(980, 918, 500, 40)
  b.s(1460, 640, 360, 48)
  b.n(990, 580, 'Run the plates. They dump if you linger.')
  b.v(1680, 584)
  b.r(1220, 580)
  b.p('grate', 1580, 640)
  b.p('nest', 1760, 640)
  b.p('web', 1564, 640)

  b.s(1940, 640, 1160, 48)
  b.s(1940, 180, 1160, 36)
  b.x(2140, 216, 80, 44, 350, 0.48, 0)
  b.x(2500, 216, 80, 44, 350, 0.48, 0.34)
  b.x(2860, 216, 80, 44, 350, 0.48, 0.68)
  b.n(1960, 580, 'Wait for a press to lift. Walk the gap. Dash if you mistime.')
  b.r(2320, 580)
  b.r(2680, 580)
  b.p('chain', 2140, 180)
  b.p('chain', 2500, 180)
  b.p('chain', 2860, 180)
  b.p('lamp', 2000, 180)
  b.v(3040, 504)

  b.s(3000, 560, 200, 40)
  b.s(3180, 470, 280, 40)
  shaft(b, 3480, 470, 150, 'right', 280)
  b.n(3188, 410, 'Walk under the rust. Hold into a pipe, jump, kick the other. Grate at the top.')
  b.r(3570, 400)
  b.r(3570, 240)
  b.v(3720, 98)
  b.p('antenna', 3760, 154)
  b.s(3660, 210, 180, 24)

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

  b.s(5120, 420, 200, 40)
  b.k(5320, 820, 220)
  b.s(5320, 838, 220, 40)
  b.x(5480, 160, 90, 40, 180, 0.7, 0.2)
  b.s(5540, 400, 260, 40)
  b.n(5130, 360, 'Jump the pit. Dash if you want extra.')
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
    2,
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
  b.s(2320, 80, 28, 760)
  b.s(2572, 80, 28, 820)
  b.o(2320, 52, 280)
  b.f(2350, 160, 220, 720, 0, -2520)
  b.s(2600, 200, 180, 28)
  b.n(2330, 840, 'Ride the updraft. Jump through the grate at the top.')
  b.r(2440, 500)
  b.r(2440, 260)
  b.v(2660, 144)
  b.p('antenna', 2480, 58)
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

  b.s(4000, 420, 300, 40)
  b.s(4280, 120, 26, 244)
  b.s(4434, 100, 26, 264)
  b.s(4588, 80, 26, 284)
  b.s(4588, 364, 26, 250)
  b.s(4280 - 12, 420, 90, 26)
  b.o(4280, 80, 334)
  b.s(4614, 84, 220, 28)
  b.k(4306, 702, 308)
  b.s(4280, 720, 334, 40)
  b.n(4010, 360, 'Walk in. Kick across the three stacks. Jump the grate.')
  b.r(4370, 340)
  b.r(4520, 260)
  b.r(4370, 160)
  b.v(4680, 28)
  b.p('chain', 4280, 80)
  b.p('chain', 4588, 80)

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
    3,
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

function lowPipe(b: ReturnType<typeof kit>, x: number, floorY: number, w: number) {
  b.s(x, floorY, w, 320)
  b.s(x, floorY - 230, w, 202)
}

function flues(): World {
  const b = kit()

  b.s(0, 640, 420, 360)
  b.n(70, 560, 'Hold down + dash. Slide-dash stays low.')
  b.r(280, 580)
  b.p('vent', 36, 640)
  b.p('barrel', 180, 640)
  b.p('barrelTip', 260, 640)
  b.p('web', 16, 640)
  b.npc(
    npc(
      'cinder',
      340,
      640,
      -1,
      'Cinder',
      [
        'Tall bugs eat ceiling. You are not tall if you do not want to be.',
        'Down, then dash. Keep the cig off the grate.',
      ],
      'ash',
    ),
  )

  lowPipe(b, 420, 640, 520)
  b.r(680, 604)
  b.n(430, 390, 'Stay low. Standing eats the flue.')

  b.s(940, 640, 180, 360)
  b.v(980, 584)
  b.p('lamp', 1040, 640)

  b.k(1120, 780, 240)
  b.s(1120, 798, 240, 40)
  b.s(1360, 640, 180, 360)
  b.n(950, 560, 'Wings out over the pit, then drop low again.')
  b.r(1240, 560)

  lowPipe(b, 1600, 640, 560)
  b.r(1860, 604)
  b.r(2040, 604)
  b.n(1610, 390, 'Chain slide-dashes. The flue is longer than one burst.')

  b.s(2160, 640, 200, 360)
  b.v(2200, 584)

  b.s(2360, 640, 240, 48)
  shaft(b, 2580, 640, 170, 'right', 300)
  b.n(2370, 580, 'Walk under. Hold into the pipe, jump, kick up.')
  b.r(2668, 420)
  b.r(2668, 240)
  b.p('chain', 2580, 186)

  b.s(3020, 166, 160, 28)
  lowPipe(b, 3180, 166, 520)
  b.r(3420, 130)
  b.n(3190, -80, 'High flue. Same trick.')
  b.v(3380, 110)

  b.s(3700, 166, 160, 28)
  b.s(3920, 300, 180, 40)
  b.s(4180, 420, 200, 40)
  b.x(4440, 120, 96, 40, 260, 0.82, 0.1)
  b.s(4400, 440, 200, 40)
  lowPipe(b, 4600, 440, 480)
  b.n(3930, 240, 'Slide-dash under the press.')
  b.r(4520, 380)
  b.r(4840, 404)
  b.v(4700, 384)
  b.p('grate', 4420, 440)

  b.s(5080, 440, 160, 40)
  b.m(5280, 360, 140, 26, 'x', 180, 1.2)
  b.s(5640, 300, 160, 40)
  b.c(5860, 260, 110)
  b.s(6040, 220, 180, 40)
  b.n(5090, 380, 'Ride, plate, last hop.')
  b.r(5340, 310)
  b.r(6100, 170)

  b.s(6280, 180, 520, 80)
  b.p('antenna', 6600, 180)
  b.p('barrel', 6400, 180)
  b.p('lamp', 6700, 180)
  b.p('web', 6284, 180)
  b.n(6320, 120, 'Grate’s next. Keep the ash.')
  b.v(6360, 124)

  return makeWorld(
    4,
    'The Flues',
    'Stay low',
    'flue',
    6960,
    1100,
    980,
    { x: 80, y: 560 },
    { x: 6620, y: 60, w: 70, h: 120 },
    b,
  )
}

function grate(): World {
  const b = kit()

  b.s(0, 680, 480, 400)
  b.n(70, 600, 'Last pipe. Everything you learned, in order.')
  b.r(320, 620)
  b.p('lamp', 40, 680)
  b.p('barrel', 180, 680)
  b.p('nest', 260, 680)
  b.npc(
    npc(
      'wick',
      400,
      680,
      -1,
      'Wick',
      [
        'Street’s loud. I stayed. Someone has to keep the last light.',
        'Kick, slide-dash, wings. In that order, if you want daylight.',
      ],
      'midnight',
    ),
  )

  b.s(520, 620, 260, 40)
  shaft(b, 760, 620, 190, 'right', 280)
  b.n(530, 560, 'Walk under. Hold into the pipe, jump, kick up.')
  b.r(848, 400)
  b.r(848, 250)
  b.v(1100, 138)
  b.p('chain', 760, 206)

  b.s(1140, 186, 140, 28)
  lowPipe(b, 1280, 186, 440)
  b.r(1480, 150)
  b.n(1290, -60, 'Slide-dash the street flue.')

  b.s(1720, 186, 160, 28)
  b.s(1960, 280, 160, 40)
  b.k(2120, 780, 280)
  b.s(2120, 798, 280, 40)
  b.s(2400, 300, 180, 40)
  b.n(1970, 220, 'Wings across. Do not walk it.')
  b.r(2240, 240)
  b.v(2460, 244)
  b.p('shroom', 2420, 300)

  b.s(2680, 280, 260, 40)
  b.s(2920, 60, 26, 164)
  b.s(3074, 50, 26, 174)
  b.s(3228, 40, 26, 184)
  b.s(3228, 224, 26, 220)
  b.s(2920 - 12, 280, 90, 26)
  b.o(2920, 40, 334)
  b.s(3254, 44, 200, 28)
  b.k(2948, 622, 308)
  b.s(2920, 640, 334, 40)
  b.n(2690, 220, 'Walk in. Three kicks. Through the grate.')
  b.r(3010, 220)
  b.r(3160, 160)
  b.r(3010, 100)
  b.v(3320, 0)
  b.p('chain', 2920, 40)
  b.p('chain', 3228, 40)

  b.c(3560, 200, 110)
  b.c(3740, 160, 110)
  b.c(3920, 200, 110)
  b.s(4140, 180, 180, 40)
  b.k(3560, 700, 740)
  b.s(3560, 718, 740, 40)
  b.n(3570, 140, 'Plates dump. Keep moving.')
  b.r(3780, 110)
  b.r(4200, 130)
  b.v(4180, 124)

  b.s(4440, 200, 160, 40)
  b.f(4640, 40, 240, 260, 420, -60)
  b.o(4880, 140, 120)
  lowPipe(b, 5080, 280, 400)
  b.n(4450, 140, 'Current, grate, then stay low.')
  b.r(4760, 100)
  b.r(5280, 244)
  b.v(5140, 224)

  b.s(5480, 280, 160, 40)
  b.x(5700, 40, 90, 36, 200, 0.88, 0.2)
  b.s(5860, 260, 180, 40)
  b.m(6120, 200, 130, 26, 'x', 160, 1.3)
  b.s(6480, 160, 560, 80)
  b.n(5490, 220, 'Press, ride, daylight.')
  b.r(5920, 210)
  b.r(6180, 150)
  b.r(6600, 110)
  b.p('antenna', 6840, 160)
  b.p('grate', 6500, 160)
  b.p('lamp', 6960, 160)
  b.p('web', 6484, 160)
  b.n(6520, 100, 'Babe Roach. Put the cig out or don’t.')
  b.v(6560, 104)
  b.npc(
    npc(
      'babe',
      6800,
      160,
      -1,
      'Babe Roach',
      [
        'Took you long enough, Pipe.',
        'Forest spit you out. I kept the grate warm.',
        'Come here. You can keep the cig. I like you smoky.',
      ],
      'babe',
      'babe',
    ),
  )

  return makeWorld(
    5,
    'The Grate',
    'Babe was waiting',
    'street',
    7200,
    1200,
    1080,
    { x: 80, y: 600 },
    { x: 6880, y: 40, w: 70, h: 120 },
    b,
  )
}
