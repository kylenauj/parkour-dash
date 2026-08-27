import { VIEW_H, VIEW_W } from './const'
import { crisp, PX, prect } from './pixel'
import type { Theme } from './world'

export type LayerPack = {
  far: HTMLCanvasElement
  mid: HTMLCanvasElement
  near: HTMLCanvasElement
  fore: HTMLCanvasElement
}

export function bakePack(theme: Theme): LayerPack {
  return {
    far: theme === 'woods' ? woodsFar() : pipeFar(theme),
    mid: theme === 'woods' ? woodsMid() : pipeMid(theme),
    near: theme === 'woods' ? woodsNear() : pipeNear(theme),
    fore: theme === 'woods' ? woodsFore() : pipeFore(theme),
  }
}

function sheet(extra = 320) {
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
  for (let i = 0; i < 7; i++) {
    const x = i * 240
    const h = 180 + (i % 3) * 40
    mountain(ctx, x, 280, 280, h, '#3a4a58')
    mountain(ctx, x + 80, 320, 220, h - 30, '#2a3848')
  }
  ctx.fillStyle = 'rgba(180, 200, 220, 0.18)'
  ctx.fillRect(0, 420, c.width, 80)
  return c
}

function woodsMid() {
  const { c, ctx } = sheet()
  if (!ctx) return c
  for (let i = 0; i < 16; i++) {
    pine(ctx, 20 + i * 110, 520, 0.55 + (i % 3) * 0.12, '#1a2830')
  }
  ctx.fillStyle = 'rgba(20, 30, 40, 0.35)'
  ctx.fillRect(0, 500, c.width, 80)
  return c
}

function woodsNear() {
  const { c, ctx } = sheet(200)
  if (!ctx) return c
  for (let i = 0; i < 10; i++) {
    pine(ctx, 40 + i * 160, 560, 0.85 + (i % 2) * 0.1, i % 2 === 0 ? '#152018' : '#101810')
  }
  for (let i = 0; i < 6; i++) {
    prect(ctx, 90 + i * 220, 40, 8, 28, '#c8d0d8')
    prect(ctx, 86 + i * 220, 32, 16, 8, '#1a2028')
    ctx.globalAlpha = 0.12
    prect(ctx, 70 + i * 220, 40, 48, 80, '#d8e8ff')
    ctx.globalAlpha = 1
  }
  return c
}

function woodsFore() {
  const { c, ctx } = sheet(200)
  if (!ctx) return c
  for (let i = 0; i < 20; i++) {
    const x = i * 80
    prect(ctx, x, VIEW_H - 36, 70, 36, '#080c10')
    prect(ctx, x + 8, VIEW_H - 48, 18, 16, '#0c1410')
    if (i % 3 === 0) prect(ctx, x + 20, 0, 6, 40 + (i % 2) * 20, '#06080c')
  }
  return c
}

function mountain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: string) {
  prect(ctx, x + w * 0.2, y, w * 0.6, h, col)
  prect(ctx, x, y + h * 0.35, w, h * 0.65, col)
  prect(ctx, x + w * 0.42, y - 16, w * 0.16, 20, '#8a9aaa')
}

function pine(ctx: CanvasRenderingContext2D, x: number, ground: number, s: number, col: string) {
  const h = 140 * s
  prect(ctx, x + 10 * s, ground - h - 20, 8 * s, h + 20, '#1a1410')
  prect(ctx, x - 18 * s, ground - h, 56 * s, 28 * s, col)
  prect(ctx, x - 10 * s, ground - h - 24, 40 * s, 24 * s, col)
  prect(ctx, x - 2 * s, ground - h - 44, 24 * s, 22 * s, col)
}

function pipeFar(theme: Theme) {
  const { c, ctx } = sheet()
  if (!ctx) return c
  const body = theme === 'filter' ? '#1a0c08' : theme === 'overflow' ? '#061018' : theme === 'street' ? '#0c0a14' : '#0c140e'
  const glow = theme === 'filter' ? '#ff8a30' : theme === 'overflow' ? '#40d0c0' : theme === 'street' ? '#a090e0' : '#7cff3a'
  for (let i = 0; i < 9; i++) {
    const x = 40 + i * 160
    prect(ctx, x, 180, 120, 400, body)
    prect(ctx, x + 20, 200, 80, 160, '#070a08')
    prect(ctx, x + 36, 240, 48, 80, glow)
    ctx.globalAlpha = 0.16
    ctx.fillRect(x + 36, 240, 48, 80)
    ctx.globalAlpha = 1
  }
  return c
}

function pipeMid(theme: Theme) {
  const { c, ctx } = sheet()
  if (!ctx) return c
  const pipe = theme === 'filter' ? '#241810' : theme === 'overflow' ? '#142428' : theme === 'street' ? '#181420' : '#1c2420'
  const hi = theme === 'filter' ? '#6a4a30' : theme === 'overflow' ? '#3a5a58' : theme === 'street' ? '#4a4060' : '#3a4a40'
  for (let i = 0; i < 14; i++) {
    const x = i * 110
    prect(ctx, x + 20, 120, 16, 520, pipe)
    prect(ctx, x + 24, 120, 4, 520, hi)
    prect(ctx, x, 280, 90, 12, pipe)
    prect(ctx, x, 280, 90, 4, hi)
  }
  return c
}

function pipeNear(theme: Theme) {
  const { c, ctx } = sheet(200)
  if (!ctx) return c
  const drip = theme === 'filter' ? '#ffb040' : theme === 'overflow' ? '#7ef0e0' : theme === 'street' ? '#c8b0ff' : '#ffe080'
  for (let x = 0; x < c.width; x += 32) {
    for (let y = 0; y < 80; y += 16) {
      if ((x + y) % 64 === 0) prect(ctx, x, y, 4, 80, '#12161a')
    }
  }
  for (let i = 0; i < 8; i++) {
    prect(ctx, 80 + i * 180, 40, 8, 24, drip)
    prect(ctx, 76 + i * 180, 32, 16, 8, '#2a2e28')
    ctx.globalAlpha = 0.14
    prect(ctx, 60 + i * 180, 36, 48, 70, drip)
    ctx.globalAlpha = 1
  }
  return c
}

function pipeFore(theme: Theme) {
  const { c, ctx } = sheet(200)
  if (!ctx) return c
  const col = theme === 'street' ? '#06050c' : '#0a0e0a'
  ctx.globalAlpha = 0.5
  for (let i = 0; i < 18; i++) {
    prect(ctx, i * 90, 0, 4, 50 + (i % 3) * 20, col)
    prect(ctx, 30 + i * 90, VIEW_H - 40, 50, 40, col)
  }
  ctx.globalAlpha = 1
  return c
}

export { PX }
