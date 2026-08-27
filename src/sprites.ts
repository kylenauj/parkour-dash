import { bakePixels, type Pal } from './pixel'

const W = 44
const H = 56
const S = 1

function pal(base: Pal): Pal {
  return {
    k: base.B ?? '#314838',
    n: base.P ?? '#4a3020',
    r: base.S ?? '#140e08',
    w: base.E ?? '#f0e8c8',
    '1': base.v ?? '#fff4c0',
    '2': base.D ?? '#3a1e0c',
    ...base,
  }
}

/** Trailing dots are implied, so only the inked prefix of a row is written. */
function rows(...lines: string[]) {
  return lines.map((line) => line.replace(/ /g, '.').padEnd(W, '.').slice(0, W))
}

/** Bottom-align the art so the last inked row is the character's feet. */
function fit(art: string[]) {
  const trimmed = [...art]
  while (trimmed.length && /^\.+$/.test(trimmed[trimmed.length - 1] ?? '')) trimmed.pop()
  while (trimmed.length < H) trimmed.unshift('.'.repeat(W))
  return trimmed.slice(-H)
}

const ANTENNAE = [
  '............A..................A',
  '.............a................a',
  '..............a..............a',
  '...............a............a',
  '................a..........a',
  '.................a........a',
]

/** Fedora: crown with a dent, a band, and a wide brim that curls at the tips. */
const HAT = [
  '.................hHHHHHHHHh',
  '................hHHHHHHHHHHh',
  '...............hHHHHHHHHHHHHh',
  '...............hHHDDHHHHDDHHh',
  '...............hHHHHHHHHHHHHh',
  '..............hHHHHHHHHHHHHHHh',
  '..............2222222222222222',
  '..............22DDDDDDDDDD2222',
  '...........hHHHHHHHHHHHHHHHHHHHHh',
  '..........hHHHHHHHHHHHHHHHHHHHHHHh',
  '..........DDDDDDDDDDDDDDDDDDDDDDDD',
]

const FACE = [
  '..........h.....EEEEEEEEEEEE.....h',
  '................EEoooEEoooEE',
  '................EEo11oEo11oE',
  '................EEoooEEoooEE',
  '................EEEEEEEEEEEE',
]

const JAW_CIG = [
  '.................DEEEEEEEED..CCCCF',
  '..................DEEEEEED',
]

const JAW = [
  '.................DEEEEEEEED',
  '..................DEEEEEED',
]

const COLLAR = [
  '................WWWWWWWWWWWW',
  '...............WWbBBBBBBBBbWW',
]

/** Coat: lapel columns, two button pairs, arms as the outer columns. */
const COAT = [
  '..............PBbBBBBBBBBBBbBP',
  '..............PBbBBBBBBBBBBbBP',
  '..............PBbBBBB11BBBBbBP',
  '..............PBbBBBBBBBBBBbBP',
  '..............PBbBBBBBBBBBBbBP',
  '..............PBbBBBB11BBBBbBP',
  '.............PPBbBBBBBBBBBBbBPP',
  '.............PP.BbBBBBBBBBbB.PP',
  '................BbBBBBBBBBbB',
  '................BBBBBBBBBBBB',
  '.................BBBBBBBBBB',
  '.................BBBBBBBBBB',
]

const COAT_LEAN = [
  '...............PBbBBBBBBBBBBbBP',
  '..............PBbBBBBBBBBBBBbBP',
  '.............PBbBBBB11BBBBBbBP',
  '............PBbBBBBBBBBBBBbBP',
  '...........PPBbBBBBBBBBBBbBP',
  '...........PP.BbBBBB11BBbBP',
  '..............BbBBBBBBBBbB',
  '..............BBBBBBBBBBBB',
  '...............BBBBBBBBBB',
  '...............BBBBBBBBB',
  '................BBBBBBB',
  '................BBBBBB',
]

const HIPS = ['.................PPPPPPPPPP']

const LEGS_STAND = [
  '..................PPP...PPP',
  '..................LLL...LLL',
  '..................LLL...LLL',
  '..................LLL...LLL',
  '.................LLL.....LLL',
  '.................LLL.....LLL',
  '.................LLL.....LLL',
  '.................LLL.....LLL',
  '................LLL.......LLL',
  '................LLL.......LLL',
  '...............SSSS......SSSS',
  '..............SSSSS.....SSSSS',
]

const LEGS_POSE = [
  '..................PPP...PPP',
  '..................LLL...LLL',
  '..................LLL...LLL',
  '..................LLL...LLL',
  '.................LLL....LLL',
  '.................LLL...LLLL',
  '.................LLL..LLLL',
  '.................LLL.SSSSS',
  '................LLL',
  '................LLL',
  '...............SSSS',
  '..............SSSSS',
]

const LEGS_STRIDE_A = [
  '..................PPP...PPP',
  '.................LLL.....LLL',
  '................LLL.......LLL',
  '...............LLL.........LLL',
  '..............LLL...........LLL',
  '.............LLL.............LLL',
  '............LLL...............LLL',
  '...........LLL.................LLL',
  '..........LLL...................LLL',
  '.........LLL.....................LLL',
  '........SSSS.....................SSSS',
  '.......SSSSS.....................SSSSS',
]

const LEGS_STRIDE_B = [
  '..................PPP...PPP',
  '..................LLL...LLL',
  '.................LLL.....LLL',
  '.................LLL.....LLL',
  '................LLL.......LLL',
  '...............LLL.........LLL',
  '..............LLL...........LLL',
  '..............LLL...........LLL',
  '.............LLL.............LLL',
  '.............LLL.............LLL',
  '............SSSS.............SSSS',
  '...........SSSSS.............SSSSS',
]

const LEGS_STRIDE_C = [
  '..................PPP...PPP',
  '.................LLL.....LLL',
  '................LLL.......LLL',
  '...............LLL.........LLL',
  '..............LLL..........LLL',
  '.............LLL............LLL',
  '............LLL..............LLL',
  '...........LLL...............LLL',
  '..........LLL.................LLL',
  '..........LLL.................LLL',
  '.........SSSS.................SSSS',
  '........SSSSS.................SSSSS',
]

const LEGS_TUCK = [
  '..................PPP...PPP',
  '.................LLL.....LLL',
  '................LLL.......LLL',
  '................LLL.......LLL',
  '...............LLL.........LLL',
  '...............LLL.........LLL',
  '..............LLL...........LLL',
  '..............LLL...........LLL',
  '.............LLL.............LLL',
  '.............LLL.............LLL',
  '............SSSS.............SSSS',
  '...........SSSSS.............SSSSS',
]

/** Both legs swept behind for the dash. */
const LEGS_TRAIL = [
  '..................PPP...PPP',
  '.................LLL....LLL',
  '................LLL....LLL',
  '...............LLL....LLL',
  '..............LLL....LLL',
  '.............LLL....LLL',
  '............LLL....LLL',
  '...........LLL....LLL',
  '..........LLL....LLL',
  '.........LLL....LLL',
  '........SSSS...SSSS',
  '.......SSSSS..SSSSS',
]

const LEGS_KICK = [
  '..................PPP...PPP',
  '.................LLL.....LLL',
  '................LLL......LLL',
  '...............LLL.......LLL',
  '..............LLL........LLL',
  '.............LLL.........LLL',
  '............LLL..........LLL',
  '...........LLL...........LLL',
  '..........LLL............LLL',
  '.........LLL.............LLL',
  '........SSSS............SSSS',
  '.......SSSSS...........SSSSS',
]

const LEGS_CLING = [
  '..................PPP...PPP',
  '..................LLL...LLL',
  '..................LLL....LLL',
  '.................LLL.....LLL',
  '.................LLL.....LLL',
  '.................LLL......LLL',
  '................LLL.......LLL',
  '................LLL.......LLL',
  '...............LLL........LLL',
  '...............LLL........LLL',
  '..............SSSS.......SSSS',
  '.............SSSSS......SSSSS',
]

const IDLE = fit(rows(...ANTENNAE, ...HAT, ...FACE, ...JAW_CIG, ...COLLAR, ...COAT, ...HIPS, ...LEGS_STAND))

const HERO = fit(
  rows(
    '.....................w',
    '....................www',
    '...................ww',
    '...................w',
    ...ANTENNAE,
    ...HAT,
    ...FACE,
    ...JAW_CIG,
    ...COLLAR,
    ...COAT,
    ...HIPS,
    ...LEGS_POSE,
  ),
)

const RUN_A = fit(rows(...ANTENNAE, ...HAT, ...FACE, ...JAW_CIG, ...COLLAR, ...COAT_LEAN, ...HIPS, ...LEGS_STRIDE_A))
const RUN_B = fit(rows(...ANTENNAE, ...HAT, ...FACE, ...JAW_CIG, ...COLLAR, ...COAT_LEAN, ...HIPS, ...LEGS_STRIDE_B))
const RUN_C = fit(rows(...ANTENNAE, ...HAT, ...FACE, ...JAW_CIG, ...COLLAR, ...COAT_LEAN, ...HIPS, ...LEGS_STRIDE_C))

const JUMP = fit(rows(...ANTENNAE, ...HAT, ...FACE, ...JAW_CIG, ...COLLAR, ...COAT_LEAN, ...HIPS, ...LEGS_TUCK))
const WALL = fit(rows(...ANTENNAE, ...HAT, ...FACE, ...JAW_CIG, ...COLLAR, ...COAT, ...HIPS, ...LEGS_CLING))
const KICK = fit(rows(...ANTENNAE, ...HAT, ...FACE, ...JAW_CIG, ...COLLAR, ...COAT_LEAN, ...HIPS, ...LEGS_KICK))
const DASH = fit(rows(...ANTENNAE, ...HAT, ...FACE, ...JAW_CIG, ...COLLAR, ...COAT_LEAN, ...HIPS, ...LEGS_TRAIL))

/** Low profile: hat tipped forward, body stretched along the ground. */
const SLIDE = fit(
  rows(
    '......A.........a',
    '.......a.......a',
    '........a.....a',
    '.........hHHHHHHHHh',
    '........hHHHHHHHHHHh',
    '........hHHDDHHHHDDh',
    '.......hHHHHHHHHHHHHh',
    '.......222222222222',
    '....hHHHHHHHHHHHHHHHHh...CCCCF',
    '....DDDDDDDDDDDDDDDDDD',
    '.........EEoooEEoooEE',
    '.........EEo11oEo11oE',
    '.........EEEEEEEEEEEE',
    '..........WWWWWWWWWW',
    '........WWbBBBBBBBBBBBBBBBB',
    '.......PBbBBBBBBBBBBBBBBBBBBb',
    '.......PBbBBBBBBBBBBPPPPPPPPPP',
    '........BBBBBBBBBBLLLLLLLLLLLL',
    '.........BBBBBBBB..LLLLLLLLLL',
    '......SSSSS................SSSSS',
  ),
)

const SLIDE_DASH = SLIDE

const BABE = fit(
  rows(
    '............M..................M',
    '.............m................m',
    '..............m..............m',
    '...............m............m',
    '................mMMMMMMMMMMm',
    '...............MMMMMMMMMMMMMM',
    '..............MMHHHHHHHHHHHHMM',
    '..............MHHHHHHHHHHHHHHM',
    '.............MMHHHHHHHHHHHHHHMM',
    '.............MHHHHHHHHHHHHHHHHM',
    '..............MHHHHHHHHHHHHHHM',
    '................EEEEEEEEEEEE',
    '................EEoooEEoooEE',
    '................EEo11oEo11oE',
    '................EEoooEEoooEE',
    '................EEEEEEEEEEEE',
    ...JAW,
    ...COLLAR,
    ...COAT,
    ...HIPS,
    ...LEGS_POSE,
  ),
)

export type SpriteBank = {
  idle: HTMLCanvasElement
  hero: HTMLCanvasElement
  run: HTMLCanvasElement[]
  jump: HTMLCanvasElement
  wall: HTMLCanvasElement
  kick: HTMLCanvasElement
  slide: HTMLCanvasElement
  dash: HTMLCanvasElement
  slideDash: HTMLCanvasElement
}

export function bakeBank(base: Pal): SpriteBank {
  const p = pal(base)
  return {
    idle: bakePixels(IDLE, p, S),
    hero: bakePixels(HERO, p, S),
    run: [bakePixels(RUN_A, p, S), bakePixels(RUN_B, p, S), bakePixels(RUN_C, p, S), bakePixels(RUN_B, p, S)],
    jump: bakePixels(JUMP, p, S),
    wall: bakePixels(WALL, p, S),
    kick: bakePixels(KICK, p, S),
    slide: bakePixels(SLIDE, p, S),
    dash: bakePixels(DASH, p, S),
    slideDash: bakePixels(SLIDE_DASH, p, S),
  }
}

export function bakeBabe(base: Pal) {
  return bakePixels(BABE, pal(base), S)
}

export const SPRITE_W = (W + 2) * S
export const SPRITE_H = (H + 2) * S
