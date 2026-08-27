export const PX = 4

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
  ctx.fillRect(snap(x), snap(y), Math.max(PX, snap(w + PX - 1)), Math.max(PX, snap(h + PX - 1)))
}

export function crisp(ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = false
}

export function bakePixels(rows: string[], palette: Record<string, string>, scale: number) {
  const h = rows.length
  const w = rows[0]?.length ?? 0
  const c = document.createElement('canvas')
  c.width = w * scale
  c.height = h * scale
  const ctx = c.getContext('2d')
  if (!ctx) return c
  ctx.imageSmoothingEnabled = false
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x]
      const color = palette[ch]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(x * scale, y * scale, scale, scale)
    }
  }
  return c
}
