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

  for (let i = 0; i < 150; i++) {
    const x = Math.floor(hash(i, 1) * w)
    const y = 6 + Math.floor(hash(i, 2) * 300)
    ctx.globalAlpha = 0.2 + hash(i, 4) * 0.6
    prect(ctx, x, y, hash(i, 3) > 0.93 ? 2 : 1, 1, hash(i, 7) > 0.75 ? '#fff8e8' : '#c8d8f4')
  }
  ctx.globalAlpha = 1

  moon(ctx, 1168, 78, 24)

  mountains(ctx, {
    width: w,
    baseY: 452,
    peaks: [
      { x: 40, h: 96 },
      { x: 200, h: 150 },
      { x: 360, h: 120 },
      { x: 520, h: 205 },
      { x: 700, h: 240 },
      { x: 880, h: 165 },
      { x: 1030, h: 205 },
      { x: 1210, h: 150 },
      { x: 1380, h: 190 },
      { x: 1560, h: 130 },
    ],
    fill: '#3c5070',
    lit: '#4e6488',
    dark: '#2c3c58',
    snow: '#c8d8ee',
    snowShade: '#8fa4c4',
    snowLine: 300,
    ridge: 10,
  })
  fog(ctx, 400, 70, w, '#2a3c5c')

  mountains(ctx, {
    width: w,
    baseY: 486,
    peaks: [
      { x: 0, h: 74 },
      { x: 170, h: 122 },
      { x: 340, h: 92 },
      { x: 520, h: 148 },
      { x: 740, h: 108 },
      { x: 950, h: 162 },
      { x: 1150, h: 116 },
      { x: 1350, h: 146 },
      { x: 1560, h: 96 },
    ],
    fill: '#2c3e5c',
    lit: '#3a4e70',
    dark: '#22304a',
    snow: '#a8bcd8',
    snowShade: '#7c90b0',
    snowLine: 366,
    ridge: 8,
  })
  fog(ctx, 440, 64, w, '#22324e')
  return c
}

/** Valley canopy: dense pine rows fading into haze. */
function woodsMid() {
  const { c, ctx } = sheet()
  if (!ctx) return c
  const w = c.width
  const rows: { y: number; scale: number; step: number; col: string; dark: string }[] = [
    { y: 512, scale: 0.3, step: 15, col: '#22334c', dark: '#1a2840' },
    { y: 548, scale: 0.4, step: 19, col: '#1c2c42', dark: '#152238' },
    { y: 590, scale: 0.52, step: 24, col: '#182636', dark: '#111c2a' },
    { y: 638, scale: 0.66, step: 30, col: '#131f2c', dark: '#0c1620' },
    { y: 694, scale: 0.82, step: 38, col: '#0e1822', dark: '#080f16' },
  ]
  for (const row of rows) {
    for (let i = 0; i * row.step < w + 40; i++) {
      const x = -20 + i * row.step + (hash(i, row.y) - 0.5) * row.step * 0.8
      const h = (34 + hash(i, row.y + 1) * 34) * (0.6 + row.scale)
      pineLayer(ctx, x, row.y - h, 4 + row.scale * 9, h, row.col, row.col, row.dark)
    }
    fog(ctx, row.y - 14, 30, w, '#1e3050')
  }
  return c
}

function woodsNear() {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  const cols = {
    trunk: '#241a12',
    bark: '#3a2a1c',
    mid: '#16281e',
    lit: '#2a4630',
    dark: '#0c1610',
  }
  for (let i = 0; i < 9; i++) {
    pineTree(ctx, 60 + i * 180, VIEW_H + 26, 0.62 + (i % 3) * 0.1, cols)
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
