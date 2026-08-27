import { bakePixels, type Pal } from './pixel'

const W = 24
const H = 24
const S = 2

function pal(base: Pal): Pal {
  return {
    k: base.B ?? '#314838',
    n: base.P ?? '#4a3020',
    r: base.S ?? '#140e08',
    w: base.E ?? '#f0e8c8',
    ...base,
  }
}

function rows(...lines: string[]) {
  return lines.map((line) => line.replace(/ /g, '.').padEnd(W, '.').slice(0, W))
}

function padBottom(art: string[]) {
  while (art.length < H) art.push('.'.repeat(W))
  return art.slice(0, H)
}

/** Standing, cig out, both boots planted. */
const IDLE = padBottom(
  rows(
    '........................',
    '.......aa...............',
    '......a..a..............',
    '.....HHHHHH.............',
    '....HhEoEhHC............',
    '....HHEEEHH.F...........',
    '.....HHHHHH.............',
    '.....WBBBBW.............',
    '....BBBBBBBB............',
    '...BbBBBBBBb............',
    '...B..BBB..b............',
    '......BBBB..............',
    '.....PPPPPP.............',
    '....PP.PP.PP............',
    '.....L....L.............',
    '.....L....L.............',
    '.....S....S.............',
    '....SS....SS............',
  ),
)

/** Title pose — one boot planted, the other kicked up, smoke curl. */
const HERO = padBottom(
  rows(
    '..........m.............',
    '.......aa.M.............',
    '......a..am.............',
    '.....HHHHHH.............',
    '....HhEoEhHC............',
    '....HHEEEHH.F...........',
    '.....HHHHHH.............',
    '....WBBBBBW.............',
    '...BBBBBBBBB............',
    '..Bb.BBBBB.b............',
    '..B...BBB..b............',
    '......BBBB..............',
    '.....PPPPPP.............',
    '....PP.PP.PPP...........',
    '.....L....PP............',
    '.....L.....L............',
    '....SS......L...........',
    '.............S..........',
    '............SS..........',
  ),
)

const RUN_A = padBottom(
  rows(
    '........................',
    '.......aa...............',
    '......a..a..............',
    '.....HHHHHH.............',
    '....HhEoEhHC............',
    '....HHEEEHH.F...........',
    '.....HHHHHH.............',
    '.....WBBBBW.............',
    '....BBBBBBBB............',
    '...BbBBBBBBb............',
    '..L..BBBB..L............',
    '.L....BB....L...........',
    '.....PPPPPP.............',
    '....PP....PP............',
    '...L........L...........',
    '..L..........L..........',
    '..S..........S..........',
    '.SS..........SS.........',
  ),
)

const RUN_B = padBottom(
  rows(
    '........................',
    '.......aa...............',
    '......a..a..............',
    '.....HHHHHH.............',
    '....HhEoEhHC............',
    '....HHEEEHH.F...........',
    '.....HHHHHH.............',
    '.....WBBBBW.............',
    '....BBBBBBBB............',
    '...BbBBBBBBb............',
    '...B..BBB..b............',
    '......BBBB..............',
    '.....PPPPPP.............',
    '....PP.PP.PP............',
    '.....L....L.............',
    '.....L....L.............',
    '.....S....S.............',
    '....SS....SS............',
  ),
)

const RUN_C = padBottom(
  rows(
    '........................',
    '.......aa...............',
    '......a..a..............',
    '.....HHHHHH.............',
    '....HhEoEhHC............',
    '....HHEEEHH.F...........',
    '.....HHHHHH.............',
    '.....WBBBBW.............',
    '....BBBBBBBB............',
    '...BbBBBBBBb............',
    '..L..BBBB..L............',
    '...L..BB..L.............',
    '.....PPPPPP.............',
    '......PP.PP.............',
    '.....L....LL............',
    '....L......L............',
    '....S......S............',
    '...SS......SS...........',
  ),
)

const JUMP = padBottom(
  rows(
    '......aa................',
    '.....a..a...............',
    '....HHHHHH..............',
    '...HhEoEhHC.............',
    '...HHEEEHH.F............',
    '....HHHHHH..............',
    '....WBBBBW..............',
    '...BBBBBBBB.............',
    '..BbBBBBBBb.............',
    '.L..BBBBB..L............',
    'L....BBB....L...........',
    '.....PPPPP..............',
    '....PP...PP.............',
    '...L.......L............',
    '..L.........L...........',
    '.S...........S..........',
    'SS...........SS.........',
  ),
)

/** Cling — body hugged toward the facing wall. */
const WALL = padBottom(
  rows(
    '........................',
    '.........aa.............',
    '........a..a............',
    '.......HHHHHH...........',
    '......HhEoEhHC..........',
    '......HHEEEHH.F.........',
    '.......HHHHHH...........',
    '.......WBBBBW...........',
    '......BBBBBBBB..........',
    '.....BbBBBBBBb..........',
    '.....B..BBB..b..........',
    '........BBBB............',
    '.......PPPPPP...........',
    '......PP.PP.P...........',
    '.....L.....L............',
    '....L......L............',
    '....S...................',
    '...SS...................',
  ),
)

/** Kick off the wall — trailing leg, arms out. */
const KICK = padBottom(
  rows(
    '......aa................',
    '.....a..a...............',
    '....HHHHHH..............',
    '...HhEoEhHC.............',
    '...HHEEEHH.F............',
    '....HHHHHH..............',
    '..L.WBBBBW.L............',
    '.L.BBBBBBBB.L...........',
    'L.BbBBBBBBb..L..........',
    '...B.BBB.b..............',
    '.....BBBB...............',
    '....PPPPPP..............',
    '...PP....PP.............',
    '..L........L............',
    '.L..........L...........',
    'S............S..........',
    'SS...........SS.........',
  ),
)

const SLIDE = padBottom(
  rows(
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '..aa....................',
    '.a..a.HHHHHHC...........',
    '.....HhEoEhH.F..........',
    '.....HHEEEHH............',
    '....WBBBBBBBBBBB........',
    '...BBBBBBBBBBBBB........',
    '..BbBBBBBBBBPPPP........',
    '..B....BBB.PPPPP........',
    'SS...............SS.....',
  ),
)

const DASH = padBottom(
  rows(
    '......aa................',
    '.....a..a...............',
    '....HHHHHH..............',
    '...HhEoEhHC.............',
    '..mHHEEEHH.F............',
    '.Mm.HHHHHH.mM...........',
    'Mv.WBBBBBW.vM...........',
    'v.BBBBBBBBB.v...........',
    '..BbBBBBBBb.............',
    '..B..BBB..b.............',
    '.....BBBB...............',
    '....PPPPPP..............',
    '...PP....PP.............',
    '..L........L............',
    '.L..........L...........',
    '.S..........S...........',
    'SS..........SS..........',
  ),
)

const SLIDE_DASH = padBottom(
  rows(
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    'mM......................',
    '.v.aa...................',
    '..a..aHHHHHHCmm.........',
    '......HhEoEhH.FMM.......',
    '......HHEEEHH...v.......',
    '....WBBBBBBBBBBBB.......',
    '...BBBBBBBBBBBBBB.......',
    '..BbBBBBBBBBPPPPP.......',
    '.vB....BBB.PPPPPP.......',
    'SS.................SS...',
  ),
)

/** Babe Roach — waiting at the top of the line. */
const BABE = padBottom(
  rows(
    '.........mm.............',
    '.......aaMMa............',
    '......a..aa.............',
    '.....HHHHHH.............',
    '....HhEoEhH.............',
    '....HHEEEHH.............',
    '.....HHHHHH.............',
    '....WBBBBBW.............',
    '...BBBBBBBBB............',
    '..Bb.BBBBB.b............',
    '...B..BBB..b............',
    '......BBBB..............',
    '.....PPPPPP.............',
    '....PP.PP.PP............',
    '.....L....PPP...........',
    '.....L.....L............',
    '....SS......L...........',
    '.............S..........',
    '............SS..........',
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

export const SPRITE_W = W * S
export const SPRITE_H = H * S
