import './style.css'
import { Game } from './game'

const canvas = document.querySelector<HTMLCanvasElement>('#game')!
const game = new Game(canvas, {
  hud: el('#hud'),
  time: el('#hud-time'),
  orbs: el('#hud-orbs'),
  deaths: el('#hud-deaths'),
  hint: el('#hud-hint'),
  dash: el('#dash-pip'),
  level: el('#hud-level'),
  title: el('#title-screen'),
  pause: el('#pause-screen'),
  win: el('#win-screen'),
  winEyebrow: el('#win-eyebrow'),
  winCopy: el('#win-copy'),
  winStats: el('#win-stats'),
  btnNext: el('#btn-next'),
  toast: el('#level-toast'),
  toastNum: el('#toast-num'),
  toastName: el('#toast-name'),
  talk: el('#talk'),
  talkWho: el('#talk-who'),
  talkLine: el('#talk-line'),
  unlock: el('#unlock'),
  unlockName: el('#unlock-name'),
  titleLooks: el('#title-looks'),
  pauseLooks: el('#pause-looks'),
  heroArt: el('#hero-art') as HTMLCanvasElement,
  portrait: el('#hud-portrait') as HTMLCanvasElement,
  touch: el('#touch'),
})

el('#btn-play').addEventListener('click', () => game.playFromTitle())
el('#btn-resume').addEventListener('click', () => game.resume())
el('#btn-retry').addEventListener('click', () => game.retryCheckpoint())
el('#btn-quit').addEventListener('click', () => game.backToTitle())
el('#btn-again').addEventListener('click', () => game.replay())
el('#btn-next').addEventListener('click', () => game.nextPipe())
el('#btn-title').addEventListener('click', () => game.backToTitle())

document.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = Number(btn.dataset.level)
    if (id >= 0 && id <= 5) game.playLevel(id as 0 | 1 | 2 | 3 | 4 | 5)
  })
})

game.start()

function el(selector: string) {
  const node = document.querySelector<HTMLElement>(selector)
  if (!node) throw new Error(`Missing ${selector}`)
  return node
}
