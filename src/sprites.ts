import { bakePixels, type Pal } from './pixel'

const W = 32
const H = 36
const S = 2

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

/** Slim fedora, antennae, glowing eyes. */
const HEAD = [
  '..........A.......A.............',
  '...........a.....a..............',
  '............a...a...............',
  '............hHHHh...............',
  '...........hHHHHHh..............',
  '...........HHHHHHH..............',
  '...........2222222..............',
  '.........hHHHHHHHHHh............',
  '.........DDDDDDDDDDD............',
  '...........Eo1E1oE..............',
]

const JAW = ['...........DEEEEED.CCF..........']
const JAW_PLAIN = ['...........DEEEEED..............']

const NECK = ['............WWWWW...............']

const TORSO = [
  '............BBBBB...............',
  '...........PBbBBBbBP............',
  '...........PBbBBBbBP............',
  '...........PBb1BBbBP............',
  '...........PBbBBBbBP............',
  '............BbBBBbB.............',
  '............BbBBBbB.............',
  '............BBBBBBB.............',
  '............BBBBB...............',
]

const TORSO_LEAN = [
  '............BBBBB...............',
  '..........PBBbBBBbBP............',
  '.........PBBbBBBBbBP............',
  '.........PBb1BBBbBP.............',
  '..........PBbBBBbBP.............',
  '...........BbBBBbB..............',
  '...........BbBBBB...............',
  '...........BBBBB................',
  '............BBB.................',
]

const HIPS = ['............PPPPPPP.............']

/** Legs step one column per row so the limb stays connected. */
const LEGS_STAND = [
  '............PP...PP.............',
  '............LL...LL.............',
  '............LL...LL.............',
  '...........LL.....LL............',
  '...........LL.....LL............',
  '...........SS.....SS............',
  '..........SSS.....SSS...........',
]

const LEGS_POSE = [
  '............PP...PP.............',
  '............LL...LL.............',
  '............LL...LL.............',
  '...........LL....LLL............',
  '...........LL.....SSS...........',
  '..........SS....................',
  '.........SSS....................',
]

const LEGS_STRIDE_A = [
  '............PP...PP.............',
  '...........LL.....LL............',
  '..........LL.......LL...........',
  '.........LL.........LL..........',
  '........LL...........LL.........',
  '.......SS.............SS........',
  '......SSS.............SSS.......',
]

const LEGS_STRIDE_B = [
  '............PP...PP.............',
  '............LL...LL.............',
  '...........LL.....LL............',
  '...........LL.....LL............',
  '..........LL.......LL...........',
  '..........SS.......SS...........',
  '.........SSS.......SSS..........',
]

const LEGS_STRIDE_C = [
  '............PP...PP.............',
  '...........LL.....LL............',
  '..........LL.......LL...........',
  '.........LL.........LL..........',
  '.........LL..........LL.........',
  '........SS...........SS.........',
  '.......SSS...........SSS........',
]

const LEGS_TUCK = [
  '............PP...PP.............',
  '...........LL.....LL............',
  '..........LL.......LL...........',
  '..........LL.......LL...........',
  '.........LL.........LL..........',
  '.........SS.........SS..........',
  '........SSS.........SSS.........',
]

/** Both legs swept behind for the dash. */
const LEGS_TRAIL = [
  '............PP...PP.............',
  '...........LL.....LL............',
  '..........LL.....LL.............',
  '.........LL.....LL..............',
  '........LL.....LL...............',
  '.......SS.....SS................',
  '......SSS.....SSS...............',
]

const LEGS_KICK = [
  '............PP...PP.............',
  '...........LL.....LL............',
  '..........LL......LL............',
  '.........LL.......LL............',
  '........LL........LL............',
  '.......SS.........SS............',
  '......SSS.........SSS...........',
]

const LEGS_CLING = [
  '............PP...PP.............',
  '............LL...LL.............',
  '............LL....LL............',
  '...........LL.....LL............',
  '...........LL.....LL............',
  '..........SS......SS............',
  '.........SSS......SSS...........',
]

const IDLE = fit(rows(...HEAD, ...JAW, ...NECK, ...TORSO, ...HIPS, ...LEGS_STAND))

const HERO = fit(
  rows(
    '.................w..............',
    '................www.............',
    '...............ww...............',
    '...............w................',
    ...HEAD,
    ...JAW,
    ...NECK,
    ...TORSO,
    ...HIPS,
    ...LEGS_POSE,
  ),
)

const RUN_A = fit(rows(...HEAD, ...JAW, ...NECK, ...TORSO_LEAN, ...HIPS, ...LEGS_STRIDE_A))
const RUN_B = fit(rows(...HEAD, ...JAW, ...NECK, ...TORSO_LEAN, ...HIPS, ...LEGS_STRIDE_B))
const RUN_C = fit(rows(...HEAD, ...JAW, ...NECK, ...TORSO_LEAN, ...HIPS, ...LEGS_STRIDE_C))

const JUMP = fit(rows(...HEAD, ...JAW, ...NECK, ...TORSO_LEAN, ...HIPS, ...LEGS_TUCK))
const WALL = fit(rows(...HEAD, ...JAW, ...NECK, ...TORSO, ...HIPS, ...LEGS_CLING))
const KICK = fit(rows(...HEAD, ...JAW, ...NECK, ...TORSO_LEAN, ...HIPS, ...LEGS_KICK))

const SLIDE = fit(
  rows(
    '....A.....a.....................',
    '.....a....a.....................',
    '.......hHHHHHh..CCF.............',
    '......hHHHHHHHh.................',
    '......222222222.................',
    '....hHHHHHHHHHHHh...............',
    '....DDDDDDDDDDDDD...............',
    '......Eo1E1oE...................',
    '.......WWBBBBBBBBBB.............',
    '......BBbBBBBBBBBBBBb...........',
    '.....BBBBBBBBBBPPPPPPP..........',
    '.....BBBBBBBBLLLLLLLLLL.........',
    '......SS.............SSS........',
  ),
)

const DASH = fit(rows(...HEAD, ...JAW, ...NECK, ...TORSO_LEAN, ...HIPS, ...LEGS_TRAIL))

const SLIDE_DASH = fit(
  rows(
    '....A.....a.....................',
    '.....a....a.....................',
    '.......hHHHHHh..CCF.............',
    '......hHHHHHHHh.................',
    '......222222222.................',
    '....hHHHHHHHHHHHh...............',
    '....DDDDDDDDDDDDD...............',
    '......Eo1E1oE...................',
    '.......WWBBBBBBBBBB.............',
    '.....BBbBBBBBBBBBBBBb...........',
    '....BBBBBBBBBBPPPPPPPP..........',
    '....BBBBBBBBLLLLLLLLLLL.........',
    '.....SS..............SSS........',
  ),
)

const BABE = fit(
  rows(
    '..........M.......M.............',
    '...........m.....m..............',
    '...........MMMMMMM..............',
    '..........MHHHHHHHM.............',
    '..........HHHHHHHHH.............',
    '..........MHHHHHHHM.............',
    '...........Eo1E1oE..............',
    ...JAW_PLAIN,
    ...NECK,
    '............BBBBB...............',
    '...........PBbBBBbBP............',
    '...........PBb11BbBP............',
    '...........PBbBBBbBP............',
    '...........PBbBBBbBP............',
    '............BbBBBbB.............',
    '............BbBBBbB.............',
    '............BBBBBBB.............',
    '............BBBBB...............',
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
