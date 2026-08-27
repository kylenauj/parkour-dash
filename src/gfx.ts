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
  ctx.globalAlpha = 0.1
  disk(ctx, cx, cy, r + 18, '#b6ccf0')
  ctx.globalAlpha = 0.16
  disk(ctx, cx, cy, r + 8, '#cfe0ff')
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
    disk(ctx, cx + ox * r, cy + oy * r, Math.max(1, cr * r), '#b8ae94')
    disk(ctx, cx + ox * r - 1, cy + oy * r - 1, Math.max(1, cr * r * 0.55), '#f4eee0')
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

/** Drooping conifer skirt: wide at the bottom, needles flicking off the lower edge. */
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
    const w = Math.max(1, half * (0.18 + t * 0.82))
    const y = Math.round(top + r)
    ctx.fillStyle = cols.mid
    ctx.fillRect(Math.round(x - w), y, Math.round(w * 2), 1)
    /** Moon sits upper-right: shade the left, rim the right. */
    ctx.fillStyle = cols.dark
    ctx.fillRect(Math.round(x - w), y, Math.max(1, Math.round(w * 0.38)), 1)
    if (r % 3 === 0) {
      ctx.fillStyle = cols.lit
      ctx.fillRect(Math.round(x + w * 0.42), y, Math.max(1, Math.round(w * 0.5)), 1)
    }
    if (r % 4 === 0) {
      ctx.fillStyle = 'rgba(210, 226, 245, 0.28)'
      ctx.fillRect(Math.round(x + w - 1), y, 1, 1)
    }
    /** Near-black underside on the last rows of the skirt. */
    if (r > drop - 4) {
      ctx.fillStyle = '#060a08'
      ctx.fillRect(Math.round(x - w * 0.72), y, Math.round(w * 1.44), 1)
    }
  }

  /** Needle spurs break the tier's lower silhouette. */
  const base = Math.round(top + drop)
  for (let i = 0; i < 7; i++) {
    const u = (i + 0.5) / 7
    const at = x - half + u * half * 2
    const len = 2 + Math.round(hash(Math.round(at), base) * 4)
    const outward = at < x ? -1 : 1
    ctx.fillStyle = outward > 0 ? cols.lit : cols.dark
    ctx.fillRect(Math.round(at), base - 1, 1, len)
    if (hash(base, Math.round(at)) > 0.55) {
      ctx.fillStyle = cols.mid
      ctx.fillRect(Math.round(at + outward), base - 2, 1, len - 1)
    }
  }
  for (const side of [-1, 1]) {
    const spur = Math.max(2, Math.round(half * 0.2))
    ctx.fillStyle = cols.mid
    ctx.fillRect(Math.round(x + side * half - (side < 0 ? spur : 0)), base - 2, spur, 2)
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
  const height = 232 * s
  const trunkBase = Math.max(3, Math.round(6 * s))

  prect(ctx, x - trunkBase * 1.6, ground - 3, trunkBase * 3.2, 5, cols.trunk)
  for (const side of [-1, 1]) {
    const rw = trunkBase * (1.6 + hash(x, side) * 1.4)
    prect(ctx, side < 0 ? x - rw : x, ground - 2, rw, 4, cols.trunk)
    prect(ctx, side < 0 ? x - rw : x, ground, rw * 0.7, 2, cols.dark)
  }

  for (let i = 0; i < height * 0.9; i++) {
    const y = Math.round(ground - i)
    const w = Math.max(trunkBase * 0.4, trunkBase * (1 - i / (height * 1.4)))
    ctx.fillStyle = cols.trunk
    ctx.fillRect(Math.round(x - w / 2), y, Math.max(1, Math.round(w)), 1)
    ctx.fillStyle = cols.dark
    ctx.fillRect(Math.round(x + w / 2 - 1), y, 1, 1)
    /** 1px bark flecks so the exposed trunk is not a flat bar. */
    if (hash(i, x) > 0.72) {
      ctx.fillStyle = cols.bark
      ctx.fillRect(Math.round(x - w / 2 + hash(x, i) * Math.max(1, w - 1)), y, 1, 1)
    }
  }

  /** Gaps between tiers leave the trunk visible, as in the reference. */
  const tiers = Math.max(10, Math.round(15 * Math.min(1.5, s)))
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1)
    const top = ground - height * (0.95 - t * 0.83)
    const half = (4 + t * t * 24 + t * 11) * s
    const drop = (11 + t * 13) * s
    branchTier(ctx, x, top, half, drop, cols)
  }

  /** Spire overlaps the top tier so it never floats free. */
  const crown = ground - height * 0.95
  prect(ctx, x - 1, crown - 6 * s, 2, 12 * s, cols.mid)
  prect(ctx, x - 1, crown - 6 * s, 1, 8 * s, cols.lit)
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
    /** Three octaves so the ridge breaks into spurs instead of a clean edge. */
    const o1 = (noise(x, 0, 120) - 0.5) * ridge * 2.2
    const o2 = (noise(x, 17, 34) - 0.5) * ridge * 1.1
    const o3 = (noise(x, 41, 9) - 0.5) * ridge * 0.45
    heights.push(Math.max(8, base + o1 + o2 + o3))
  }

  for (let x = 0; x < width; x++) {
    const h = heights[x]
    const topY = Math.round(baseY - h)
    const slope = (heights[Math.min(width - 1, x + 4)] ?? h) - (heights[Math.max(0, x - 4)] ?? h)
    prect(ctx, x, topY, 1, baseY - topY + 10, fill)

    /** Facet planes: broad noise splits each slope into rock faces. */
    const facet = noise(x, 63, 90)
    if (facet > 0.62) prect(ctx, x, topY + h * 0.22, 1, h * 0.5, lit)
    else if (facet < 0.34) prect(ctx, x, topY + h * 0.3, 1, h * 0.55, dark)
    if (noise(x, 88, 26) > 0.72) prect(ctx, x, topY + h * 0.45, 1, h * 0.35, dark)

    /** Moon sits high on the right, so slopes falling to the right catch light. */
    if (slope < -0.5) prect(ctx, x, topY, 1, Math.min(12, 6 + h * 0.05), lit)
    else if (slope > 0.5) prect(ctx, x, topY, 1, Math.min(10, 5 + h * 0.04), dark)

    if (snow && snowLine !== undefined && topY < snowLine) {
      const above = snowLine - topY
      /** Snow runs down gullies, so depth follows a ragged per-column noise. */
      const gully = noise(x, 5, 21)
      const tongue = noise(x, 29, 7)
      let depth = above * (0.16 + gully * 0.42)
      if (tongue > 0.78) depth += above * 0.5
      depth = Math.min(h * 0.62, depth)
      if (depth > 1) {
        prect(ctx, x, topY, 1, depth, snow)
        if (snowShade && slope > 0.5) prect(ctx, x, topY, 1, depth * 0.55, snowShade)
        if (snowShade && gully < 0.3) prect(ctx, x, topY + depth - 2, 1, 2, snowShade)
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

/** Cool 1–2px rim on the moon-facing (top-right) edge of a surface. */
export function moonRim(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h = 2,
) {
  const rx = Math.round(x + w * 0.52)
  const rw = Math.max(1, Math.round(w * 0.48))
  ctx.fillStyle = 'rgba(210, 226, 245, 0.28)'
  ctx.fillRect(rx, Math.round(y), rw, 1)
  ctx.fillStyle = 'rgba(210, 226, 245, 0.12)'
  ctx.fillRect(rx + Math.floor(rw * 0.2), Math.round(y) + 1, Math.max(1, Math.round(rw * 0.7)), 1)
  if (h > 2) {
    ctx.fillStyle = 'rgba(210, 226, 245, 0.16)'
    ctx.fillRect(Math.round(x + w - 2), Math.round(y), 1, Math.min(Math.round(h), 36))
  }
}

/** Curved, branching roots in clumps of 2–4. Lengths 20–160px. */
export function roots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  cols: { root: string; shade: string; leaf?: string },
  density = 16,
  maxLen = 46,
) {
  let i = x + 4
  while (i < x + w - 4) {
    if (noise(i, y, 72) < 0.38) {
      i += density * 0.7
      continue
    }
    const clump = 2 + Math.floor(hash(i, y) * 3)
    for (let r = 0; r < clump; r++) {
      const ox = i + r * (3 + hash(i, r + 2) * 6)
      const thick = 1 + Math.floor(hash(r, i + 4) * 2.4)
      const len = Math.min(160, 20 + hash(i + r, y) * Math.max(24, maxLen))
      let cx = ox
      let cy = y
      let dx = (hash(ox, y + 1) - 0.5) * 0.75
      let branched = false
      for (let t = 0; t < len; t++) {
        dx += (hash(ox + t * 0.7, y + 3) - 0.5) * 0.13
        cx += dx
        cy += 1
        ctx.fillStyle = t < 10 ? cols.root : t > len * 0.62 ? cols.shade : cols.root
        ctx.fillRect(Math.round(cx), Math.round(cy), thick, 1)
        if (!branched && t > 16 && t < len * 0.7 && hash(ox, t + 9) > 0.84) {
          branched = true
          let bx = cx
          let by = cy
          let bdx = hash(t, ox) > 0.5 ? 0.65 : -0.65
          const blen = 12 + hash(t, y + 8) * 40
          const bt = Math.max(1, thick - 1)
          for (let b = 0; b < blen; b++) {
            bdx += (hash(b + ox, t) - 0.5) * 0.1
            bx += bdx
            by += 1
            ctx.fillStyle = cols.shade
            ctx.fillRect(Math.round(bx), Math.round(by), bt, 1)
          }
        }
      }
      if (cols.leaf && hash(ox, y) > 0.74) {
        ctx.fillStyle = cols.leaf
        ctx.fillRect(Math.round(cx) - 1, Math.round(cy - 5), 3, 2)
      }
    }
    i += density * (1.5 + hash(i, y + 1) * 2.4)
  }
}

/** Stones 3–16px, clustered, grey-brown. Darken toward the cliff base. */
export function boulders(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cols: { face: string; lit: string; shade: string },
  _step = 26,
) {
  void _step
  const n = Math.floor(w * h * 0.0023)
  for (let i = 0; i < n; i++) {
    const gx = x + 5 + hash(x + i * 3.1, y) * Math.max(8, w - 16)
    const gy = y + 8 + hash(y + i * 5.7, x) * Math.max(6, h - 14)
    if (noise(gx, gy, 46) < 0.36 && hash(i, x + 2) < 0.5) continue
    const cluster = hash(i, y + 2) > 0.48 ? 2 + Math.floor(hash(i, 9) * 3) : 1
    const depth = Math.min(1, Math.max(0, (gy - y) / Math.max(1, h)))
    for (let k = 0; k < cluster; k++) {
      const sx = Math.round(gx + (hash(i, k + 3) - 0.5) * 12)
      const sy = Math.round(gy + (hash(k, i + 7) - 0.5) * 8)
      const bw = Math.round(3 + hash(i, k + 11) * 13)
      const bh = Math.round(3 + hash(i, k + 13) * 9)
      let face = cols.face
      let lit = cols.lit
      let shade = cols.shade
      if (depth > 0.38) {
        face = '#2a261c'
        lit = '#3a3428'
        shade = '#12100c'
      }
      if (depth > 0.68) {
        face = '#1c1812'
        lit = '#2a241c'
        shade = '#0a0906'
      }
      if (hash(i, k) > 0.55) {
        face = depth > 0.5 ? '#26241e' : '#3a382e'
        lit = depth > 0.5 ? '#3c3a32' : '#525044'
      }
      ctx.fillStyle = face
      ctx.fillRect(sx, sy, bw, bh)
      ctx.fillStyle = lit
      ctx.fillRect(sx + Math.max(1, bw - 3), sy, Math.min(3, bw), Math.max(1, Math.floor(bh * 0.45)))
      ctx.fillStyle = shade
      ctx.fillRect(sx, sy + bh - 1, bw, 1)
      if (hash(k, sy) > 0.8) {
        ctx.fillStyle = '#2a4030'
        ctx.fillRect(sx + 1, sy + bh - 2, Math.max(1, bw * 0.4), 2)
      }
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
