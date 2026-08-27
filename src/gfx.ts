import { prect } from './pixel'

export type PineCols = {
  trunk: string
  bark: string
  mid: string
  lit: string
  dark: string
}

export function hash(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

export function noise(x: number, y: number, scale: number) {
  const xs = x / scale
  const ys = y / scale
  const x0 = Math.floor(xs)
  const y0 = Math.floor(ys)
  const tx = xs - x0
  const ty = ys - y0
  const a = hash(x0, y0)
  const b = hash(x0 + 1, y0)
  const c = hash(x0, y0 + 1)
  const d = hash(x0 + 1, y0 + 1)
  const sx = tx * tx * (3 - 2 * tx)
  const sy = ty * ty * (3 - 2 * ty)
  return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy
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

export function moon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.globalAlpha = 0.07
  disk(ctx, cx, cy, r + 10, '#b6ccf0')
  ctx.globalAlpha = 0.1
  disk(ctx, cx, cy, r + 4, '#cfe0ff')
  ctx.globalAlpha = 1
  disk(ctx, cx, cy, r, '#e8e4d0')
  disk(ctx, cx - r * 0.12, cy - r * 0.14, r * 0.86, '#f8f4e4')
  disk(ctx, cx - r * 0.3, cy - r * 0.3, r * 0.5, '#fffdf4')
  const craters: [number, number, number][] = [
    [-0.3, 0.32, 0.16],
    [0.34, -0.24, 0.12],
    [0.1, 0.5, 0.1],
    [-0.5, -0.16, 0.09],
    [0.46, 0.3, 0.08],
  ]
  for (const [ox, oy, cr] of craters) {
    disk(ctx, cx + ox * r, cy + oy * r, Math.max(1, cr * r), '#ded8c4')
    disk(ctx, cx + ox * r - 1, cy + oy * r - 1, Math.max(1, cr * r * 0.6), '#efe9d8')
  }
}

/** Flat silhouette triangle, for distant tree bands. */
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
    const jag = Math.floor((hash(cx + r, top) - 0.5) * 5)
    const w = Math.max(1, 1 + t * half + jag)
    const y = top + r
    prect(ctx, cx - w, y, w * 2, 1, mid)
    if (r % 3 === 0) prect(ctx, cx + w * 0.4, y, Math.max(1, w * 0.55), 1, lit)
    prect(ctx, cx - w, y, Math.max(1, w * 0.3), 1, dark)
  }
}

/** Drooping conifer skirt: wide at the bottom, tips flicking outward. */
function branchTier(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  half: number,
  drop: number,
  cols: PineCols,
) {
  for (let r = 0; r < drop; r++) {
    const t = r / Math.max(1, drop - 1)
    const w = Math.max(1, half * (0.22 + t * 0.78))
    const y = Math.round(top + r)
    prect(ctx, x - w, y, w * 2, 1, cols.mid)
    prect(ctx, x + w * 0.28, y, Math.max(1, w * 0.72), 1, cols.dark)
    if (r % 2 === 0) prect(ctx, x - w, y, Math.max(1, w * 0.42), 1, cols.lit)
  }
  const tip = Math.round(top + drop)
  const w = half
  for (const side of [-1, 1]) {
    const spur = Math.max(2, half * 0.22)
    prect(ctx, x + side * w - (side < 0 ? spur : 0), tip - 1, spur, 2, cols.mid)
    prect(ctx, x + side * w - (side < 0 ? spur : 0), tip - 1, spur, 1, side < 0 ? cols.lit : cols.dark)
  }
}

export function pineTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  ground: number,
  scale: number,
  cols: PineCols,
) {
  const s = scale
  const height = 168 * s
  const trunkBase = Math.max(3, Math.round(5 * s))

  prect(ctx, x - trunkBase * 1.6, ground - 3, trunkBase * 3.2, 5, cols.trunk)
  for (const side of [-1, 1]) {
    const rw = trunkBase * (1.6 + hash(x, side) * 1.4)
    prect(ctx, side < 0 ? x - rw : x, ground - 2, rw, 4, cols.trunk)
    prect(ctx, side < 0 ? x - rw : x, ground, rw * 0.7, 2, cols.dark)
  }

  for (let i = 0; i < height * 0.92; i++) {
    const y = ground - i
    const w = Math.max(trunkBase * 0.42, trunkBase * (1 - i / (height * 1.5)))
    prect(ctx, x - w / 2, y, Math.max(1, w), 1, cols.trunk)
    prect(ctx, x + w / 2 - 1, y, 1, 1, cols.dark)
    if (i % 11 === 0) prect(ctx, x - w / 2, y, Math.max(1, w * 0.4), 1, cols.bark)
  }

  const tiers = Math.max(9, Math.round(14 * Math.min(1.5, s)))
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1)
    const top = ground - height * (0.93 - t * 0.79)
    const half = (4 + t * t * 20 + t * 10) * s
    const drop = (14 + t * 16) * s
    branchTier(ctx, x, top, half, drop, cols)
  }
  prect(ctx, x - 1, ground - height - 5 * s, 2, 7 * s, cols.mid)
}

export function mountains(
  ctx: CanvasRenderingContext2D,
  opts: {
    width: number
    baseY: number
    peaks: { x: number; h: number }[]
    fill: string
    lit: string
    dark: string
    snow?: string
    snowShade?: string
    snowLine?: number
    ridge?: number
  },
) {
  const { width, baseY, peaks, fill, lit, dark, snow, snowShade, snowLine, ridge = 8 } = opts
  const pts = [
    { x: -60, h: peaks[0]?.h ?? 80 },
    ...peaks,
    { x: width + 60, h: peaks[peaks.length - 1]?.h ?? 80 },
  ]
  let seg = 1
  const heights: number[] = []
  for (let x = 0; x < width; x++) {
    while (seg < pts.length - 1 && pts[seg].x < x) seg++
    const a = pts[seg - 1]
    const b = pts[seg]
    const t = (x - a.x) / Math.max(1, b.x - a.x)
    const base = a.h + (b.h - a.h) * t
    heights.push(base + (noise(x, 0, 34) - 0.5) * ridge + (noise(x, 9, 7) - 0.5) * ridge * 0.5)
  }

  for (let x = 0; x < width; x++) {
    const h = heights[x]
    const topY = Math.round(baseY - h)
    const slope = (heights[Math.min(width - 1, x + 4)] ?? h) - (heights[Math.max(0, x - 4)] ?? h)
    prect(ctx, x, topY, 1, baseY - topY + 10, fill)

    /** Moon sits high on the right, so slopes falling to the right catch light. */
    if (slope < -0.5) prect(ctx, x, topY, 1, Math.min(26, 8 + h * 0.12), lit)
    else if (slope > 0.5) prect(ctx, x, topY, 1, Math.min(22, 6 + h * 0.1), dark)

    if (snow && snowLine !== undefined && topY < snowLine) {
      const above = snowLine - topY
      const depth = Math.min(h * 0.2, above * (0.22 + noise(x, 3, 16) * 0.26))
      if (depth > 1) {
        prect(ctx, x, topY, 1, depth, snow)
        if (snowShade && slope > 0.5) prect(ctx, x, topY, 1, depth * 0.6, snowShade)
      }
    }
  }
}

export function fog(ctx: CanvasRenderingContext2D, y: number, h: number, w: number, color: string) {
  for (let i = 0; i < h; i++) {
    const t = i / h
    ctx.globalAlpha = Math.sin(t * Math.PI) * 0.55
    prect(ctx, 0, y + i, w, 1, color)
  }
  ctx.globalAlpha = 1
}

/** Dangling roots and vines under a soil lip. */
export function roots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  cols: { root: string; shade: string; leaf?: string },
  density = 16,
  maxLen = 46,
) {
  for (let i = x + 2; i < x + w - 2; i += density) {
    const seed = hash(i, y)
    /** Coarse gate first so roots hang in clumps instead of a picket fence. */
    if (noise(i, y, 90) < 0.44 || seed < 0.34) continue
    const len = 24 + seed * maxLen
    let rx = i
    const drift = (hash(i, y + 5) - 0.5) * 0.5
    for (let d = 0; d < len; d++) {
      rx += drift * (d / len) + (hash(i + d, y) > 0.82 ? 0.6 : 0)
      const thick = d > len * 0.5 ? 1 : 2
      prect(ctx, rx, y + d, thick, 1, d > len * 0.6 ? cols.shade : cols.root)
    }
    if (cols.leaf && seed > 0.7) {
      prect(ctx, rx - 2, y + len * 0.4, 3, 2, cols.leaf)
      prect(ctx, rx + 1, y + len * 0.62, 3, 2, cols.leaf)
    }
  }
}

/** Embedded stones for cliff faces. */
export function boulders(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cols: { face: string; lit: string; shade: string },
  step = 26,
) {
  for (let by = y + 10; by < y + h - 6; by += step) {
    for (let bx = x + 8; bx < x + w - 10; bx += step) {
      const seed = hash(bx, by)
      if (seed < 0.6) continue
      const r = 3 + Math.floor(seed * 10)
      const ox = bx + (hash(bx, by + 3) - 0.2) * step * 1.4
      const oy = by + (hash(by, bx + 5) - 0.2) * step * 1.2
      disk(ctx, ox, oy, r, cols.face)
      disk(ctx, ox - 1, oy - 1, Math.max(1, r * 0.42), cols.lit)
      prect(ctx, ox - r + 1, oy + r - 1, r * 2 - 2, 2, cols.shade)
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
