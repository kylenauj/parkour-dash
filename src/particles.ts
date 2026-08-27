export type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  color: string
  drag: number
}

export class Particles {
  items: Particle[] = []

  emit(x: number, y: number, n: number, color: string, speed: number, size = 3) {
    this.emitDir(x, y, n, color, speed, 0, Math.PI * 2, size)
  }

  emitDir(
    x: number,
    y: number,
    n: number,
    color: string,
    speed: number,
    angle: number,
    spread: number,
    size = 3,
  ) {
    for (let i = 0; i < n; i++) {
      const a = angle + (Math.random() - 0.5) * spread
      const s = speed * (0.35 + Math.random() * 0.75)
      this.items.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.25 + Math.random() * 0.35,
        max: 0.45,
        size: size * (0.6 + Math.random() * 0.8),
        color,
        drag: 2.4,
      })
    }
  }

  burstUp(x: number, y: number, n: number, color: string) {
    for (let i = 0; i < n; i++) {
      this.items.push({
        x: x + (Math.random() - 0.5) * 18,
        y,
        vx: (Math.random() - 0.5) * 90,
        vy: -40 - Math.random() * 80,
        life: 0.28 + Math.random() * 0.2,
        max: 0.4,
        size: 2 + Math.random() * 2,
        color,
        drag: 3,
      })
    }
  }

  update(dt: number) {
    for (const p of this.items) {
      p.life -= dt
      p.vx *= Math.max(0, 1 - p.drag * dt)
      p.vy *= Math.max(0, 1 - p.drag * dt)
      p.vy += 420 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
    }
    this.items = this.items.filter((p) => p.life > 0)
  }
}
