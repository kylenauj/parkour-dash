export const PX = 2

export function snap(n: number) {
  return Math.floor(n / PX) * PX
}

export function prect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)))
}

export function crisp(ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = false
}

export type Pal = Record<string, string>

export function bakePixels(rows: string[], palette: Pal, scale: number) {
  const h = rows.length
  const w = rows[0]?.length ?? 0
  const pad = 1
  const c = document.createElement('canvas')
  c.width = (w + pad * 2) * scale
  c.height = (h + pad * 2) * scale
  const ctx = c.getContext('2d')
  if (!ctx) return c
  ctx.imageSmoothingEnabled = false
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const color = palette[rows[y][x]]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect((x + pad) * scale, (y + pad) * scale, scale, scale)
    }
  }
  return c
}
