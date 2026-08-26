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
  title: el('#title-screen'),
  pause: el('#pause-screen'),
  win: el('#win-screen'),
  winCopy: el('#win-copy'),
  winStats: el('#win-stats'),
  touch: el('#touch'),
})

el('#btn-play').addEventListener('click', () => game.playFromTitle())
el('#btn-resume').addEventListener('click', () => game.resume())
el('#btn-retry').addEventListener('click', () => game.retryCheckpoint())
el('#btn-quit').addEventListener('click', () => game.backToTitle())
el('#btn-again').addEventListener('click', () => game.playFromTitle())
el('#btn-title').addEventListener('click', () => game.backToTitle())

game.start()

function el(selector: string) {
  const node = document.querySelector<HTMLElement>(selector)
  if (!node) throw new Error(`Missing ${selector}`)
  return node
}
