export class AudioBus {
  private ctx: AudioContext | null = null
  muted = false

  resume() {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  jump() {
    this.blip(420, 180, 0.07, 'square', 0.08)
  }

  wallJump() {
    this.blip(520, 240, 0.08, 'square', 0.09)
  }

  dash() {
    this.blip(180, 880, 0.12, 'sawtooth', 0.07)
  }

  land(heavy: boolean) {
    this.noise(heavy ? 0.08 : 0.04, heavy ? 0.12 : 0.06)
  }

  slide() {
    this.noise(0.05, 0.04)
  }

  orb() {
    this.blip(880, 1320, 0.1, 'sine', 0.07)
    this.blip(1320, 1760, 0.08, 'sine', 0.05, 0.04)
  }

  checkpoint() {
    this.blip(520, 780, 0.1, 'triangle', 0.07)
    this.blip(780, 1040, 0.12, 'triangle', 0.06, 0.06)
  }

  death() {
    this.blip(240, 70, 0.22, 'sawtooth', 0.1)
  }

  win() {
    this.blip(520, 660, 0.12, 'square', 0.07)
    this.blip(660, 780, 0.12, 'square', 0.07, 0.1)
    this.blip(780, 1040, 0.18, 'square', 0.08, 0.2)
  }

  private blip(
    from: number,
    to: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    delay = 0,
  ) {
    if (this.muted || !this.ctx) return
    const t0 = this.ctx.currentTime + delay
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(from, t0)
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + dur)
    g.gain.setValueAtTime(gain, t0)
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
    osc.connect(g).connect(this.ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  }

  private noise(dur: number, gain: number) {
    if (this.muted || !this.ctx) return
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const src = this.ctx.createBufferSource()
    const g = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 700
    src.buffer = buffer
    g.gain.value = gain
    src.connect(filter).connect(g).connect(this.ctx.destination)
    src.start()
  }
}
