import { VIEW_H, VIEW_W } from './const'
import { fog, hash, moon, mountains, pineLayer, pineTree } from './gfx'
import { crisp, prect } from './pixel'
import type { Theme } from './world'

export type LayerPack = {
  far: HTMLCanvasElement
  mid: HTMLCanvasElement
  near: HTMLCanvasElement
  fore: HTMLCanvasElement
}

export function bakePack(theme: Theme): LayerPack {
  if (theme === 'woods') {
    return { far: woodsFar(), mid: woodsMid(), near: woodsNear(), fore: woodsFore() }
  }
  return { far: pipeFar(theme), mid: pipeMid(theme), near: pipeNear(theme), fore: pipeFore(theme) }
}

function sheet(extra = 360) {
  const c = document.createElement('canvas')
  c.width = VIEW_W + extra
  c.height = VIEW_H
  const ctx = c.getContext('2d')
  if (ctx) crisp(ctx)
  return { c, ctx }
}

function woodsFar() {
  const { c, ctx } = sheet()
  if (!ctx) return c
  const w = c.width

  for (let i = 0; i < 90; i++) {
    const x = Math.floor(hash(i, 1) * w)
    const y = 8 + Math.floor(hash(i, 2) * 280)
    ctx.globalAlpha = 0.12 + hash(i, 4) * 0.22
    prect(ctx, x, y, 1, 1, '#8aa0c4')
  }
  for (let i = 0; i < 48; i++) {
    const x = Math.floor(hash(i, 11) * w)
    const y = 10 + Math.floor(hash(i, 12) * 250)
    ctx.globalAlpha = 0.4 + hash(i, 14) * 0.35
    prect(ctx, x, y, 1, 1, '#c8d8f4')
  }
  for (let i = 0; i < 16; i++) {
    const x = Math.floor(hash(i, 21) * w)
    const y = 12 + Math.floor(hash(i, 22) * 220)
    ctx.globalAlpha = 0.72 + hash(i, 24) * 0.28
    prect(ctx, x, y, hash(i, 23) > 0.55 ? 2 : 1, 1, '#fff8e8')
  }
  ctx.globalAlpha = 1

  const hg = ctx.createRadialGradient(w * 0.7, 330, 30, w * 0.52, 410, 460)
  hg.addColorStop(0, 'rgba(186, 204, 230, 0.18)')
  hg.addColorStop(0.4, 'rgba(80, 102, 148, 0.1)')
  hg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = hg
  ctx.fillRect(0, 210, w, 280)

  moon(ctx, 1168, 78, 24)

  mountains(ctx, {
    width: w,
    baseY: 452,
    peaks: [
      { x: 30, h: 74 },
      { x: 130, h: 150 },
      { x: 230, h: 88 },
      { x: 340, h: 178 },
      { x: 470, h: 96 },
      { x: 600, h: 232 },
      { x: 740, h: 110 },
      { x: 860, h: 196 },
      { x: 1000, h: 104 },
      { x: 1130, h: 214 },
      { x: 1270, h: 98 },
      { x: 1400, h: 172 },
      { x: 1540, h: 92 },
    ],
    fill: '#3c5070',
    lit: '#4e6488',
    dark: '#2c3c58',
    snow: '#e4ecfb',
    snowShade: '#9fb4d6',
    snowLine: 300,
    ridge: 10,
  })
  fog(ctx, 386, 84, w, '#33486c')

  mountains(ctx, {
    width: w,
    baseY: 486,
    peaks: [
      { x: 0, h: 58 },
      { x: 120, h: 122 },
      { x: 250, h: 70 },
      { x: 390, h: 148 },
      { x: 540, h: 78 },
      { x: 690, h: 158 },
      { x: 840, h: 84 },
      { x: 990, h: 140 },
      { x: 1140, h: 76 },
      { x: 1300, h: 150 },
      { x: 1460, h: 82 },
      { x: 1600, h: 120 },
    ],
    fill: '#2c3e5c',
    lit: '#3a4e70',
    dark: '#22304a',
    snow: '#bccbe4',
    snowShade: '#8296b4',
    snowLine: 356,
    ridge: 8,
  })
  fog(ctx, 428, 76, w, '#2b3e60')
  return c
}

/** Valley canopy: dense pine rows fading into haze. */
function woodsMid() {
  const { c, ctx } = sheet()
  if (!ctx) return c
  const w = c.width
  const rows: { y: number; scale: number; step: number; col: string; dark: string; mist: number }[] = [
    { y: 484, scale: 0.22, step: 9, col: '#3a5075', dark: '#334666', mist: 0.95 },
    { y: 514, scale: 0.3, step: 12, col: '#31456a', dark: '#2a3c5c', mist: 0.8 },
    { y: 550, scale: 0.42, step: 16, col: '#28395a', dark: '#22314e', mist: 0.66 },
    { y: 592, scale: 0.6, step: 21, col: '#1f2d49', dark: '#19253c', mist: 0.5 },
    { y: 640, scale: 0.84, step: 28, col: '#182338', dark: '#121b2c', mist: 0.34 },
    { y: 696, scale: 1.12, step: 37, col: '#111a29', dark: '#0b121d', mist: 0.2 },
    { y: 760, scale: 1.45, step: 48, col: '#0c1320', dark: '#070c15', mist: 0.1 },
  ]
  for (const row of rows) {
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i * row.step < w + 60; i++) {
        const x = -30 + i * row.step + pass * row.step * 0.5 + (hash(i + pass * 7, row.y) - 0.5) * row.step
        const h = (26 + hash(i + pass * 3, row.y + 1) * 54) * (0.5 + row.scale)
        pineLayer(ctx, x, row.y - h, 3 + row.scale * 9, h, pass ? row.dark : row.col, row.col, row.dark)
      }
    }
    ctx.globalAlpha = row.mist
    fog(ctx, row.y - 30, 52, w, '#3d5680')
    ctx.globalAlpha = 1
  }
  return c
}

function woodsNear() {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  const cols = {
    trunk: '#2a1e14',
    bark: '#42301e',
    mid: '#182b1f',
    lit: '#325238',
    dark: '#0a1310',
  }
  /** Anchored inside the sheet so foliage is always on screen with the trunk. */
  for (let i = 0; i < 9; i++) {
    pineTree(ctx, 60 + i * 180, VIEW_H - 4, 0.66 + (i % 3) * 0.1, cols)
  }
  return c
}

function woodsFore() {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  const cols = {
    trunk: '#100c08',
    bark: '#1c1610',
    mid: '#0c1610',
    lit: '#16241a',
    dark: '#050806',
  }
  pineTree(ctx, 44, VIEW_H + 60, 1.25, cols)
  pineTree(ctx, 210, VIEW_H + 96, 1.05, cols)
  pineTree(ctx, VIEW_W - 120, VIEW_H + 70, 1.2, cols)
  pineTree(ctx, VIEW_W + 90, VIEW_H + 50, 1.1, cols)
  return c
}

function pal(theme: Theme) {
  if (theme === 'filter') {
    return { skyWin: '#ffb060', body: '#1a0c08', glow: '#ff8a30', pipe: '#2a1810', hi: '#8a5a30', roof: '#3a1810' }
  }
  if (theme === 'overflow') {
    return { skyWin: '#5ef0d8', body: '#061018', glow: '#40d0c0', pipe: '#142428', hi: '#3a6a68', roof: '#0a2830' }
  }
  if (theme === 'street') {
    return { skyWin: '#c8b0ff', body: '#0c0a14', glow: '#a090e0', pipe: '#181420', hi: '#4a4060', roof: '#181428' }
  }
  if (theme === 'flue') {
    return { skyWin: '#ff7040', body: '#140806', glow: '#ff6030', pipe: '#24140c', hi: '#8a4020', roof: '#2a1008' }
  }
  return { skyWin: '#7cff3a', body: '#0c140e', glow: '#6ad060', pipe: '#1c2420', hi: '#3a4a40', roof: '#142018' }
}

function pipeFar(theme: Theme) {
  const { c, ctx } = sheet()
  if (!ctx) return c
  const p = pal(theme)
  const w = c.width
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.2 + hash(i, 8) * 0.4
    prect(ctx, Math.floor(hash(i, 1) * w), Math.floor(hash(i, 2) * 220), 1, 1, p.skyWin)
  }
  ctx.globalAlpha = 1

  for (let i = 0; i < 9; i++) {
    const x = 30 + i * 175
    const h = 240 + (i % 4) * 70
    const bw = 90 + (i % 3) * 18
    const top = 720 - h - 60
    prect(ctx, x, top, bw, h, p.body)
    prect(ctx, x, top, bw, 8, p.roof)
    prect(ctx, x + 4, top + 8, 3, h - 8, p.hi)
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 3; col++) {
        const on = hash(i * 11 + row * 3 + col, 4) > 0.42
        prect(ctx, x + 14 + col * 24, top + 22 + row * 28, 12, 16, on ? p.glow : '#0a0c10')
      }
    }
    if (i % 2 === 0) {
      prect(ctx, x + bw - 22, top - 70, 16, 70, p.pipe)
      prect(ctx, x + bw - 22, top - 70, 16, 3, p.hi)
    }
  }
  return c
}

function pipeMid(theme: Theme) {
  const { c, ctx } = sheet()
  if (!ctx) return c
  const p = pal(theme)
  for (let i = 0; i < 14; i++) {
    const x = i * 118
    prect(ctx, x + 22, 80, 18, 580, p.pipe)
    prect(ctx, x + 25, 80, 5, 580, p.hi)
    prect(ctx, x, 240, 110, 12, p.pipe)
    prect(ctx, x, 240, 110, 3, p.hi)
    prect(ctx, x + 8, 400, 90, 10, p.pipe)
    prect(ctx, x + 38, 243, 4, 6, p.glow)
  }
  return c
}

function pipeNear(theme: Theme) {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  const p = pal(theme)
  for (let i = 0; i < 6; i++) {
    const x = 80 + i * 240
    prect(ctx, x + 8, VIEW_H - 160, 6, 160, p.pipe)
    prect(ctx, x + 10, VIEW_H - 160, 2, 160, p.hi)
    prect(ctx, x + 4, VIEW_H - 168, 14, 8, '#1a2024')
    prect(ctx, x + 8, VIEW_H - 164, 6, 6, p.glow)
  }
  return c
}

function pipeFore(theme: Theme) {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  const col = theme === 'street' ? '#05040a' : '#06080a'
  for (let i = 0; i < 14; i++) {
    prect(ctx, 20 + i * 110, VIEW_H - 44, 80, 44, col)
  }
  return c
}
