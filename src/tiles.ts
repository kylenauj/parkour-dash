import { hash } from './gfx'
import type { Theme } from './world'

export type GroundSkin = {
  body: HTMLCanvasElement
  wall: HTMLCanvasElement
  pipe: HTMLCanvasElement
  grass: boolean
  cols: {
    hi: string
    rim: string
    shade: string
    grass: string
    grass2: string
    grassTip: string
    moss: string
    rivet: string
  }
}

export function bakeGround(theme: Theme): GroundSkin {
  if (theme === 'woods') {
    return {
      body: dirtTile('#2a241c', '#1c1814', '#14110e', '#3a3428', '#4a4030', '#6a6048'),
      wall: strataTile('#2a322c', '#1c241e', '#121814', '#3a4638'),
      pipe: pipeTile('#2a3238', '#3a444c', '#8a9aaa', '#12161a'),
      grass: true,
      cols: {
        hi: '#6a7068',
        rim: '#8a9088',
        shade: '#080a0c',
        grass: '#1a2818',
        grass2: '#2e4624',
        grassTip: '#5a7a40',
        moss: '#243828',
        rivet: '#6a6050',
      },
    }
  }
  if (theme === 'filter' || theme === 'flue') {
    return {
      body: plateTile('#4a2a18', '#3a1e10', '#241408', '#6a4030', '#c49060'),
      wall: strataTile('#3a2218', '#2a1810', '#140c08', '#5a3020'),
      pipe: pipeTile('#4a2a18', '#6a4030', '#e0b090', '#140c08'),
      grass: false,
      cols: {
        hi: '#ffd0a0',
        rim: '#ffe8c8',
        shade: '#100804',
        grass: '#4a2818',
        grass2: '#8a4a20',
        grassTip: '#d08040',
        moss: '#5a3018',
        rivet: '#e0b080',
      },
    }
  }
  if (theme === 'overflow') {
    return {
      body: plateTile('#1a3034', '#122428', '#0a181c', '#2a4a4e', '#80c0c0'),
      wall: strataTile('#1a3034', '#122428', '#081014', '#2a4a4e'),
      pipe: pipeTile('#1a3034', '#2a4a4e', '#b0e0e0', '#081014'),
      grass: false,
      cols: {
        hi: '#d8ffff',
        rim: '#f0ffff',
        shade: '#040c10',
        grass: '#1a4040',
        grass2: '#2a6868',
        grassTip: '#80e0e0',
        moss: '#1a4848',
        rivet: '#a0e0e0',
      },
    }
  }
  if (theme === 'street') {
    return {
      body: plateTile('#1a1824', '#12101a', '#0c0a12', '#2a2838', '#9088b0'),
      wall: strataTile('#1a1824', '#12101a', '#08060c', '#2a2838'),
      pipe: pipeTile('#1a1824', '#2a2838', '#b0a8d0', '#08060c'),
      grass: false,
      cols: {
        hi: '#e0d8ff',
        rim: '#f4f0ff',
        shade: '#06040a',
        grass: '#201828',
        grass2: '#483868',
        grassTip: '#c0b0ff',
        moss: '#2a2038',
        rivet: '#b0a8d0',
      },
    }
  }
  return {
    body: plateTile('#1c2220', '#161c1a', '#0c100e', '#2a322c', '#8a9088'),
    wall: strataTile('#1c2220', '#161c1a', '#0a0e0c', '#2a322c'),
    pipe: pipeTile('#1c2220', '#3a4038', '#b8c4bc', '#0a0e0c'),
    grass: true,
    cols: {
      hi: '#e0ece4',
      rim: '#f4fff8',
      shade: '#060806',
      grass: '#1a2a18',
      grass2: '#3a5a28',
      grassTip: '#7cff3a',
      moss: '#1a3a18',
      rivet: '#a0a898',
    },
  }
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (ctx) ctx.imageSmoothingEnabled = false
  return { c, ctx }
}

function dirtTile(a: string, b: string, c: string, pebble: string, pebble2: string, dry: string) {
  const { c: tile, ctx } = canvas(48, 32)
  if (!ctx) return tile
  ctx.fillStyle = b
  ctx.fillRect(0, 0, 48, 32)
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 48; x++) {
      const n = hash(x * 3, y * 5)
      if (n > 0.72) ctx.fillStyle = a
      else if (n < 0.18) ctx.fillStyle = c
      else continue
      ctx.fillRect(x, y, 1, 1)
    }
  }
  for (let i = 0; i < 9; i++) {
    const x = Math.floor(hash(i, 2) * 44)
    const y = 6 + Math.floor(hash(i, 9) * 22)
    ctx.fillStyle = hash(i, 4) > 0.5 ? pebble : pebble2
    ctx.fillRect(x, y, 3 + (i % 2), 2)
    ctx.fillStyle = dry
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.fillStyle = c
  ctx.fillRect(4, 18, 18, 1)
  ctx.fillRect(22, 11, 14, 1)
  return tile
}

function plateTile(a: string, b: string, c: string, seam: string, bolt: string) {
  const { c: tile, ctx } = canvas(48, 24)
  if (!ctx) return tile
  ctx.fillStyle = b
  ctx.fillRect(0, 0, 48, 24)
  ctx.fillStyle = a
  ctx.fillRect(0, 0, 48, 11)
  ctx.fillStyle = c
  ctx.fillRect(0, 22, 48, 2)
  ctx.fillStyle = seam
  ctx.fillRect(0, 11, 48, 1)
  ctx.fillRect(23, 0, 1, 24)
  for (let i = 0; i < 4; i++) {
    const x = 6 + i * 12
    ctx.fillStyle = bolt
    ctx.fillRect(x, 4, 3, 3)
    ctx.fillRect(x, 16, 3, 3)
    ctx.fillStyle = a
    ctx.fillRect(x, 4, 1, 1)
    ctx.fillRect(x, 16, 1, 1)
  }
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = c
    ctx.fillRect(Math.floor(hash(i, 7) * 46), 2 + Math.floor(hash(i, 3) * 18), 8, 1)
  }
  return tile
}

function strataTile(a: string, b: string, c: string, band: string) {
  const { c: tile, ctx } = canvas(24, 48)
  if (!ctx) return tile
  ctx.fillStyle = b
  ctx.fillRect(0, 0, 24, 48)
  for (let y = 0; y < 48; y += 8) {
    ctx.fillStyle = y % 16 === 0 ? a : band
    ctx.fillRect(0, y, 24, 3)
    ctx.fillStyle = c
    ctx.fillRect(18, y, 6, 8)
  }
  ctx.fillStyle = a
  ctx.fillRect(0, 0, 3, 48)
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = c
    ctx.fillRect(4, 4 + i * 6, 10, 1)
  }
  return tile
}

function pipeTile(body: string, mid: string, hi: string, shade: string) {
  const { c: tile, ctx } = canvas(32, 16)
  if (!ctx) return tile
  ctx.fillStyle = body
  ctx.fillRect(0, 0, 32, 16)
  ctx.fillStyle = hi
  ctx.fillRect(0, 0, 32, 2)
  ctx.fillStyle = mid
  ctx.fillRect(0, 2, 32, 4)
  ctx.fillStyle = shade
  ctx.fillRect(0, 13, 32, 3)
  ctx.fillStyle = hi
  ctx.fillRect(0, 3, 32, 1)
  ctx.fillStyle = mid
  ctx.fillRect(14, 0, 4, 16)
  ctx.fillStyle = hi
  ctx.fillRect(14, 2, 4, 2)
  return tile
}
