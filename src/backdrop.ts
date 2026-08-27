import { VIEW_H, VIEW_W } from './const'
import { disk, hash, mountainRange, pineLayer, pineTree } from './gfx'
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

  for (let i = 0; i < 70; i++) {
    const x = Math.floor(hash(i, 1) * w)
    const y = 8 + Math.floor(hash(i, 2) * 220)
    ctx.globalAlpha = 0.25 + hash(i, 4) * 0.45
    prect(ctx, x, y, hash(i, 3) > 0.9 ? 2 : 1, 1, '#d8e4f4')
  }
  ctx.globalAlpha = 1

  disk(ctx, 1120, 72, 16, '#e4dcc4')
  disk(ctx, 1116, 68, 6, '#f4eee0')
  prect(ctx, 1126, 76, 3, 2, '#c8c0a8')
  prect(ctx, 1114, 80, 2, 2, '#c0b89c')

  mountainRange(
    ctx,
    390,
    w,
    [
      { x: 60, h: 70 },
      { x: 210, h: 130 },
      { x: 380, h: 90 },
      { x: 560, h: 150 },
      { x: 760, h: 100 },
      { x: 960, h: 160 },
      { x: 1180, h: 110 },
      { x: 1400, h: 140 },
      { x: 1580, h: 80 },
    ],
    '#2a3848',
    '#8a9aaa',
    '#3a4c5c',
  )
  ridgePines(ctx, 390, 0.22, '#1c2834')
  mountainRange(
    ctx,
    470,
    w,
    [
      { x: 0, h: 60 },
      { x: 160, h: 110 },
      { x: 340, h: 70 },
      { x: 540, h: 130 },
      { x: 760, h: 85 },
      { x: 980, h: 140 },
      { x: 1200, h: 90 },
      { x: 1420, h: 120 },
      { x: 1600, h: 70 },
    ],
    '#1a2634',
    undefined,
    '#283848',
  )
  ridgePines(ctx, 470, 0.32, '#121c28')
  return c
}

function ridgePines(ctx: CanvasRenderingContext2D, yBase: number, scale: number, col: string) {
  for (let i = 0; i < 40; i++) {
    const x = 20 + i * 42
    const h = (18 + (i % 5) * 10) * (0.8 + scale)
    pineLayer(ctx, x, yBase - h - 8, 7 + (i % 3) * 3, h, col, col, '#0c1218')
  }
}

function woodsMid() {
  const { c, ctx } = sheet()
  if (!ctx) return c
  const palettes = [
    { trunk: '#14100c', bark: '#2a2018', mid: '#152018', lit: '#243428', dark: '#0a100c' },
    { trunk: '#12100c', bark: '#241c14', mid: '#101810', lit: '#1c2a1c', dark: '#080c08' },
    { trunk: '#16120e', bark: '#2c2418', mid: '#18241c', lit: '#2a3a28', dark: '#0c140e' },
  ]
  for (let i = 0; i < 26; i++) {
    const x = -10 + i * 64
    const s = 1.15 + (i % 4) * 0.18
    pineTree(ctx, x, VIEW_H + 20, s, palettes[i % 3])
  }
  return c
}

function woodsNear() {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  const palettes = [
    { trunk: '#0e0c0a', bark: '#1c1610', mid: '#0c1410', lit: '#182218', dark: '#060806' },
    { trunk: '#0c0a08', bark: '#181410', mid: '#0a100c', lit: '#141c14', dark: '#040604' },
  ]
  for (let i = 0; i < 12; i++) {
    pineTree(ctx, -20 + i * 140, VIEW_H + 30, 1.55 + (i % 3) * 0.22, palettes[i % 2])
  }
  return c
}

function woodsFore() {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  for (let i = 0; i < 16; i++) {
    const x = i * 100
    const h = 36 + (i % 4) * 14
    prect(ctx, x, VIEW_H - h, 110, h, '#05070a')
    pineLayer(ctx, x + 36, VIEW_H - h - 54, 28, 58, '#05070a', '#080c10', '#030406')
  }
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
