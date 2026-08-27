import { VIEW_H, VIEW_W } from './const'
import { disk, diskShade, hash, mountainRange, pineTree } from './gfx'
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
    const y = Math.floor(hash(i, 2) * 280)
    const s = hash(i, 3) > 0.88 ? 2 : 1
    ctx.globalAlpha = 0.35 + hash(i, 4) * 0.55
    prect(ctx, x, y, s, s, hash(i, 5) > 0.7 ? '#d8e8ff' : '#f4f0e0')
  }
  ctx.globalAlpha = 1

  disk(ctx, 1040, 88, 52, 'rgba(255, 236, 200, 0.16)')
  disk(ctx, 1040, 88, 38, 'rgba(255, 244, 220, 0.22)')
  diskShade(ctx, 1040, 88, 28, '#fff6e0', '#e8d8b8', '#b0a088')
  disk(ctx, 1032, 82, 5, '#d0c4a4')
  disk(ctx, 1050, 96, 4, '#c8bc9c')
  disk(ctx, 1044, 78, 3, '#d8ccb0')

  ctx.save()
  ctx.globalAlpha = 0.07
  for (let i = 0; i < 7; i++) {
    ctx.translate(1040, 88)
    ctx.rotate(-0.18 - i * 0.08)
    prect(ctx, 0, -6, 720, 10 + i, '#ffe8c8')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }
  ctx.restore()

  mountainRange(
    ctx,
    430,
    w,
    [
      { x: 80, h: 110 },
      { x: 220, h: 180 },
      { x: 360, h: 130 },
      { x: 520, h: 210 },
      { x: 680, h: 150 },
      { x: 860, h: 240 },
      { x: 1040, h: 170 },
      { x: 1220, h: 200 },
      { x: 1400, h: 120 },
      { x: 1560, h: 160 },
    ],
    '#4a5c70',
    '#d8e4f0',
    '#6a7c90',
  )
  mountainRange(
    ctx,
    490,
    w,
    [
      { x: 40, h: 90 },
      { x: 180, h: 150 },
      { x: 340, h: 100 },
      { x: 500, h: 175 },
      { x: 700, h: 120 },
      { x: 900, h: 190 },
      { x: 1100, h: 140 },
      { x: 1300, h: 165 },
      { x: 1500, h: 100 },
    ],
    '#2e3e50',
    '#9ab0aa',
    '#465868',
  )
  mountainRange(
    ctx,
    560,
    w,
    [
      { x: 0, h: 70 },
      { x: 140, h: 130 },
      { x: 280, h: 85 },
      { x: 460, h: 155 },
      { x: 640, h: 95 },
      { x: 820, h: 145 },
      { x: 1020, h: 110 },
      { x: 1220, h: 160 },
      { x: 1420, h: 90 },
      { x: 1580, h: 120 },
    ],
    '#1a2836',
    undefined,
    '#2a3a48',
  )

  mist(ctx, 470, 70, 'rgba(220, 200, 180, 0.12)')
  mist(ctx, 540, 80, 'rgba(30, 40, 55, 0.28)')
  return c
}

function woodsMid() {
  const { c, ctx } = sheet()
  if (!ctx) return c
  mist(ctx, 420, 140, 'rgba(18, 28, 38, 0.35)')
  const palettes = [
    { trunk: '#1a1410', bark: '#3a2a20', mid: '#152018', lit: '#2a3a28', dark: '#0a100c' },
    { trunk: '#181210', bark: '#2a2018', mid: '#101810', lit: '#243028', dark: '#080c08' },
    { trunk: '#1c1612', bark: '#32281e', mid: '#18241c', lit: '#304838', dark: '#0c140e' },
  ]
  for (let i = 0; i < 28; i++) {
    const x = 8 + i * 58 + (i % 3) * 10
    const s = 0.38 + (i % 5) * 0.07
    pineTree(ctx, x, 580 + (i % 2) * 8, s, palettes[i % 3])
  }
  mist(ctx, 520, 60, 'rgba(40, 50, 60, 0.18)')
  return c
}

function woodsNear() {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  const palettes = [
    { trunk: '#14100c', bark: '#2a2018', mid: '#0e1810', lit: '#1c2c1c', dark: '#060a08' },
    { trunk: '#12100c', bark: '#241c14', mid: '#0c1410', lit: '#182418', dark: '#040806' },
  ]
  for (let i = 0; i < 14; i++) {
    pineTree(ctx, 30 + i * 118, 610, 0.82 + (i % 3) * 0.12, palettes[i % 2])
  }
  for (let i = 0; i < 5; i++) {
    const x = 90 + i * 300
    prect(ctx, x + 12, 18, 7, 110, '#2a323c')
    prect(ctx, x + 14, 18, 2, 110, '#8a9aaa')
    prect(ctx, x + 12, 18, 7, 2, '#c8d4e0')
    prect(ctx, x, 12, 32, 10, '#1a2028')
    prect(ctx, x + 24, 30, 42, 5, '#1a2028')
    prect(ctx, x + 58, 24, 14, 12, '#e8f4ff')
    prect(ctx, x + 62, 28, 6, 4, '#fff')
    ctx.globalAlpha = 0.12
    prect(ctx, x + 20, 28, 90, 140, '#d0e4ff')
    ctx.globalAlpha = 1
  }
  return c
}

function woodsFore() {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  for (let i = 0; i < 18; i++) {
    const x = i * 92
    const h = 48 + (i % 5) * 16
    prect(ctx, x, VIEW_H - h, 100, h, '#05070a')
    pineLayerSil(ctx, x + 28, VIEW_H - h - 70, 34, 78, '#05070a')
    if (i % 2 === 0) prect(ctx, x + 40, VIEW_H - h - 28, 10, 28, '#080c10')
  }
  for (let i = 0; i < 20; i++) {
    prect(ctx, 24 + i * 82, 0, 4, 22 + (i % 4) * 16, '#05070a')
    if (i % 3 === 0) {
      prect(ctx, 20 + i * 82, 18 + (i % 4) * 16, 18, 3, '#05070a')
      prect(ctx, 28 + i * 82, 22 + (i % 4) * 16, 3, 14, '#05070a')
    }
  }
  return c
}

function pineLayerSil(
  ctx: CanvasRenderingContext2D,
  cx: number,
  top: number,
  half: number,
  h: number,
  col: string,
) {
  for (let r = 0; r < h; r++) {
    const w = 1 + (r / h) * half
    prect(ctx, cx - w, top + r, w * 2, 1, col)
  }
}

function mist(ctx: CanvasRenderingContext2D, y: number, h: number, col: string) {
  ctx.fillStyle = col
  ctx.fillRect(0, y, VIEW_W + 360, h)
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
        if (on) {
          ctx.globalAlpha = 0.16
          prect(ctx, x + 12 + col * 24, top + 20 + row * 28, 16, 20, p.glow)
          ctx.globalAlpha = 1
        }
      }
    }
    if (i % 2 === 0) {
      prect(ctx, x + bw - 22, top - 70, 16, 70, p.pipe)
      prect(ctx, x + bw - 22, top - 70, 16, 3, p.hi)
      ctx.globalAlpha = 0.2
      disk(ctx, x + bw - 14, top - 86, 16, p.glow)
      disk(ctx, x + bw - 8, top - 102, 12, p.glow)
      ctx.globalAlpha = 1
    }
  }
  mist(ctx, 500, 90, 'rgba(8, 10, 14, 0.4)')
  return c
}

function pipeMid(theme: Theme) {
  const { c, ctx } = sheet()
  if (!ctx) return c
  const p = pal(theme)
  for (let i = 0; i < 14; i++) {
    const x = i * 118
    prect(ctx, x + 22, 40, 18, 620, p.pipe)
    prect(ctx, x + 25, 40, 5, 620, p.hi)
    prect(ctx, x + 22, 40, 18, 3, p.skyWin)
    prect(ctx, x, 220, 110, 12, p.pipe)
    prect(ctx, x, 220, 110, 3, p.hi)
    prect(ctx, x + 8, 380, 90, 10, p.pipe)
    prect(ctx, x + 36, 220, 8, 12, '#1a1c18')
    prect(ctx, x + 38, 223, 4, 6, p.glow)
  }
  return c
}

function pipeNear(theme: Theme) {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  const p = pal(theme)
  for (let x = 0; x < c.width; x += 20) {
    if ((x / 20) % 3 === 0) prect(ctx, x, 0, 3, 70 + (x % 40), '#0c1014')
  }
  for (let i = 0; i < 8; i++) {
    const x = 50 + i * 190
    prect(ctx, x + 6, 22, 8, 36, p.glow)
    prect(ctx, x + 2, 16, 16, 10, '#1a2024')
    prect(ctx, x + 8, 26, 4, 8, '#fff4d0')
    ctx.globalAlpha = 0.14
    prect(ctx, x - 16, 24, 60, 100, p.glow)
    ctx.globalAlpha = 1
  }
  return c
}

function pipeFore(theme: Theme) {
  const { c, ctx } = sheet(220)
  if (!ctx) return c
  const col = theme === 'street' ? '#05040a' : '#06080a'
  for (let i = 0; i < 18; i++) {
    prect(ctx, i * 92, 0, 5, 36 + (i % 4) * 18, col)
    if (i % 2 === 0) prect(ctx, i * 92 + 4, 28 + (i % 4) * 18, 22, 4, col)
    prect(ctx, 16 + i * 92, VIEW_H - 56, 70, 56, col)
    prect(ctx, 28 + i * 92, VIEW_H - 72, 18, 20, col)
  }
  return c
}
