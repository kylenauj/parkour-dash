import { prect } from './pixel'

export function hash(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

export function disk(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  const rr = r * r
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(Math.max(0, rr - y * y)))
    if (w > 0) prect(ctx, cx - w, cy + y, w * 2, 1, color)
  }
}

export function diskShade(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  lit: string,
  mid: string,
  dark: string,
) {
  disk(ctx, cx, cy, r, mid)
  disk(ctx, cx - r * 0.18, cy - r * 0.18, r * 0.78, lit)
  const cut = r * 0.72
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)))
    const shade = Math.floor(w * 0.38)
    if (y > -cut * 0.15) prect(ctx, cx + w - shade, cy + y, shade, 1, dark)
  }
}

/** Upward triangle foliage: point at (cx, top), base width `half * 2`, height `h`. */
export function pineLayer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  top: number,
  half: number,
  h: number,
  mid: string,
  lit: string,
  dark: string,
) {
  for (let r = 0; r < h; r++) {
    const t = r / Math.max(1, h - 1)
    const jag = Math.floor((hash(cx + r, top) - 0.5) * 7)
    const w = Math.max(1, 1 + t * half + jag)
    const y = top + r
    prect(ctx, cx - w, y, w * 2, 1, mid)
    if (r % 2 === 0) prect(ctx, cx - w, y, Math.max(1, w * 0.28), 1, lit)
    prect(ctx, cx + w * 0.5, y, Math.max(1, w * 0.5), 1, dark)
  }
}

export function pineTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  ground: number,
  scale: number,
  cols: { trunk: string; bark: string; mid: string; lit: string; dark: string },
) {
  const s = scale
  const trunkW = Math.max(4, 7 * s)
  const trunkH = 70 * s
  prect(ctx, x - trunkW / 2, ground - trunkH, trunkW, trunkH, cols.trunk)
  prect(ctx, x - trunkW / 2, ground - trunkH, 2, trunkH, cols.bark)
  for (let i = 0; i < 4; i++) {
    prect(ctx, x - trunkW / 2 + 1, ground - trunkH + 10 + i * 14 * s, trunkW - 2, 2, cols.dark)
  }
  const layers = 5
  for (let i = 0; i < layers; i++) {
    const half = (16 + i * 11) * s
    const h = (26 + i * 2) * s
    const top = ground - (48 + (layers - i) * 26) * s
    pineLayer(ctx, x, top, half, h, cols.mid, cols.lit, cols.dark)
  }
}

export function mountainRange(
  ctx: CanvasRenderingContext2D,
  yBase: number,
  width: number,
  peaks: { x: number; h: number }[],
  fill: string,
  snow?: string,
  face?: string,
) {
  const pts = [{ x: -40, h: peaks[0]?.h ?? 80 }, ...peaks, { x: width + 40, h: peaks[peaks.length - 1]?.h ?? 80 }]
  let prev = 1
  for (let x = 0; x < width; x++) {
    while (prev < pts.length - 1 && pts[prev].x < x) prev++
    const a = pts[prev - 1]
    const b = pts[prev]
    const t = (x - a.x) / Math.max(1, b.x - a.x)
    const h = a.h + (b.h - a.h) * t
    prect(ctx, x, yBase - h, 1, h + 8, fill)
    if (hash(x, Math.floor(h)) > 0.72) prect(ctx, x, yBase - h * 0.45, 1, 3, face ?? fill)
    if (face && b.h > a.h) prect(ctx, x, yBase - h, 1, Math.min(18, h * 0.16), face)
    if (snow && h > 90) {
      const cap = Math.min(18, (h - 90) * 0.35)
      prect(ctx, x, yBase - h, 1, cap, snow)
    }
  }
}

export function stamp(
  ctx: CanvasRenderingContext2D,
  tile: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (w <= 0 || h <= 0) return
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  const tw = tile.width
  const th = tile.height
  const ox = ((x % tw) + tw) % tw
  const oy = ((y % th) + th) % th
  const startX = x - ox
  const startY = y - oy
  for (let ty = startY; ty < y + h; ty += th) {
    for (let tx = startX; tx < x + w; tx += tw) {
      ctx.drawImage(tile, tx, ty)
    }
  }
  ctx.restore()
}
