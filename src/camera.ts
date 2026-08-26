import { VIEW_H, VIEW_W } from './const'

export class Camera {
  x = 0
  y = 0
  shake = 0
  private trauma = 0

  follow(px: number, py: number, vx: number, lookY: number, worldW: number, worldH: number, dt: number) {
    const targetX = px - VIEW_W * 0.38 + vx * 0.18
    const targetY = py - VIEW_H * 0.58 + lookY
    const k = 1 - Math.pow(0.001, dt)
    this.x += (targetX - this.x) * k
    this.y += (targetY - this.y) * k
    this.x = clamp(this.x, 0, Math.max(0, worldW - VIEW_W))
    this.y = clamp(this.y, 0, Math.max(0, worldH - VIEW_H))
    this.trauma = Math.max(0, this.trauma - dt * 2.4)
    this.shake = this.trauma * this.trauma
  }

  bump(amount: number) {
    this.trauma = Math.min(1, this.trauma + amount)
  }

  offset(): { x: number; y: number } {
    if (this.shake <= 0) return { x: 0, y: 0 }
    const mag = this.shake * 12
    return { x: (Math.random() - 0.5) * mag, y: (Math.random() - 0.5) * mag }
  }
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}
