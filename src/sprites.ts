import { bakePixels, type Pal } from './pixel'

const W = 32
const H = 32
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

/** Fedora, antennae, glowing eyes, lit cigarette. */
const HEAD = [
  '..........A..........A..........',
  '...........a........a...........',
  '............a......a............',
  '...........hHHHHHHHh............',
  '..........hHHHHHHHHHh...........',
  '..........HHHHHHHHHHH...........',
  '..........2222222222D...........',
  '........hHHHHHHHHHHHHHh.........',
  '........DDDDDDDDDDDDDDD.........',
  '..........Eo1EEEE1oE............',
  '..........DEEEEEEED.CCF.........',
  '...........WWWWWWW..............',
]

const HEAD_LOW = [
  '..........A..........A..........',
  '...........a........a...........',
  '...........hHHHHHHHh............',
  '..........hHHHHHHHHHh...........',
  '..........2222222222D...........',
  '........hHHHHHHHHHHHHHh.........',
  '........DDDDDDDDDDDDDDD.........',
  '..........Eo1EEEE1oE............',
  '..........DEEEEEEED.CCF.........',
  '...........WWWWWWW..............',
]

const TORSO = [
  '.........WBBBBBBBBBW............',
  '........PBBbBBBBBBBbBP..........',
  '........PBBbBBBBBBBbBP..........',
  '........PBB1BBBBBBBbBP..........',
  '.........BBbBBBBBBBbB...........',
  '.........BBBBBBBBBBBB...........',
  '..........BBBBBBBBBB............',
]

const TORSO_LEAN = [
  '..........WBBBBBBBBBW...........',
  '........PBBbBBBBBBBBbBP.........',
  '.......PBBbBBBBBBBBBbBP.........',
  '.......PBB1BBBBBBBBbBP..........',
  '........BBbBBBBBBBbB............',
  '........BBBBBBBBBBB.............',
  '.........BBBBBBBBB..............',
]

const HIPS = ['..........PPPPPPPPPP............']

const LEGS_STAND = [
  '..........LL......LL............',
  '..........LL......LL............',
  '.........SSS......SSS...........',
]

const LEGS_POSE = [
  '..........LL......LL............',
  '..........LL.....LL.............',
  '.........SSS....SSSS............',
]

const LEGS_STRIDE_A = [
  '........LLL........LL...........',
  '.......LL...........LL..........',
  '......SSS............SSS........',
]

const LEGS_STRIDE_B = [
  '..........LL......LL............',
  '.........LL........LL...........',
  '........SSS........SSS..........',
]

const LEGS_STRIDE_C = [
  '.......LL...........LL..........',
  '........LLL........LL...........',
  '......SSS............SSS........',
]

const LEGS_TUCK = [
  '.........LL........LL...........',
  '........LL..........LL..........',
  '.......SS............SS.........',
]

const LEGS_KICK = [
  '......LLL............LL.........',
  '.....LL...............LLL.......',
  '....SSS.................SSS.....',
]

const LEGS_CLING = [
  '..........LL.......LL...........',
  '...........LL.......LL..........',
  '..........SSS.......SSS.........',
]

const IDLE = fit(rows(...HEAD, ...TORSO, ...HIPS, ...LEGS_STAND))

const HERO = fit(
  rows(
    '................w...............',
    '...............www..............',
    '..............ww................',
    '..............w.................',
    ...HEAD,
    ...TORSO,
    ...HIPS,
    ...LEGS_POSE,
  ),
)

const RUN_A = fit(rows(...HEAD_LOW, ...TORSO_LEAN, ...HIPS, ...LEGS_STRIDE_A))
const RUN_B = fit(rows(...HEAD_LOW, ...TORSO_LEAN, ...HIPS, ...LEGS_STRIDE_B))
const RUN_C = fit(rows(...HEAD_LOW, ...TORSO_LEAN, ...HIPS, ...LEGS_STRIDE_C))

const JUMP = fit(rows(...HEAD_LOW, ...TORSO_LEAN, ...HIPS, ...LEGS_TUCK))
const WALL = fit(rows(...HEAD_LOW, ...TORSO, ...HIPS, ...LEGS_CLING))
const KICK = fit(rows(...HEAD_LOW, ...TORSO_LEAN, ...HIPS, ...LEGS_KICK))

const SLIDE = fit(
  rows(
    '.....A....a.....................',
    '......a..a......................',
    '.......hHHHHHHHh.CCF............',
    '.......2222222D.................',
    '.....hHHHHHHHHHHh...............',
    '.....DDDDDDDDDDD................',
    '.......Eo1EE1oE.................',
    '......WWBBBBBBBBBBBBB...........',
    '.....BBbBBBBBBBBBBBBBb..........',
    '....BBBBBBBBBBBPPPPPPPP.........',
    '....BBBBBBBBBBLLLLLLLL..........',
    '.....SSS.............SSS........',
  ),
)

const DASH = fit(
  rows(
    '..........A..........A..........',
    '...........a........a...........',
    '...........hHHHHHHHh............',
    '..........hHHHHHHHHHh...........',
    '..........2222222222D...........',
    '.....v..hHHHHHHHHHHHHHh.........',
    '....Mm..DDDDDDDDDDDDDDD.........',
    '...Mv.....Eo1EEEE1oE............',
    '....Mm....DEEEEEEED.CCF.........',
    '.....v.....WWWWWWW..............',
    '....mM...WBBBBBBBBBW............',
    '...Mv...PBBbBBBBBBBBbBP.........',
    '....mM..PBBbBBBBBBBBBbBP........',
    '.....v..PBB1BBBBBBBBbBP.........',
    '........BBbBBBBBBBbB............',
    '........BBBBBBBBBBB.............',
    '.........BBBBBBBBB..............',
    ...HIPS,
    ...LEGS_TUCK,
  ),
)

const SLIDE_DASH = fit(
  rows(
    '.....A....a.....................',
    '......a..a......................',
    '..v....hHHHHHHHh.CCF............',
    '.mM....2222222D.................',
    'Mv...hHHHHHHHHHHh...............',
    '.mM..DDDDDDDDDDD................',
    '..v....Eo1EE1oE.................',
    '.mM...WWBBBBBBBBBBBBB...........',
    'Mv...BBbBBBBBBBBBBBBBb..........',
    '.mM.BBBBBBBBBBBPPPPPPPP.........',
    '..v.BBBBBBBBBBLLLLLLLL..........',
    '.....SSS.............SSS........',
  ),
)

const BABE = fit(
  rows(
    '..........M..........M..........',
    '...........m........m...........',
    '..........MMMMMMMMMMM...........',
    '.........MHHHHHHHHHHHM..........',
    '.........HHHHHHHHHHHHH..........',
    '.........HHHHHHHHHHHHH..........',
    '..........Eo1EEEE1oE............',
    '..........DEEEEEEED.............',
    '...........WWWWWWW..............',
    '.........WBBBBBBBBBW............',
    '........PBBbBBBBBBBbBP..........',
    '........PBBbBB11BBBbBP..........',
    '........PBBbBBBBBBBbBP..........',
    '.........BBbBBBBBBBbB...........',
    '.........BBBBBBBBBBBB...........',
    '..........BBBBBBBBBB............',
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
