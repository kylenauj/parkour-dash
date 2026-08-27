export class Input {
  left = false
  right = false
  up = false
  down = false
  jumpHeld = false
  jumpPressed = false
  dashPressed = false
  pausePressed = false
  talkPressed = false
  retryPressed = false

  private jumpQueued = false
  private dashQueued = false
  private pauseQueued = false
  private talkQueued = false
  private retryQueued = false
  private held = new Set<string>()

  constructor() {
    window.addEventListener('keydown', (e) => this.onKey(e, true))
    window.addEventListener('keyup', (e) => this.onKey(e, false))
    window.addEventListener('blur', () => this.clear())
  }

  bindTouch(root: HTMLElement) {
    const bind = (el: HTMLElement, code: string) => {
      const down = (e: Event) => {
        e.preventDefault()
        this.setCode(code, true)
      }
      const up = (e: Event) => {
        e.preventDefault()
        this.setCode(code, false)
      }
      el.addEventListener('pointerdown', down)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointerleave', up)
      el.addEventListener('pointercancel', up)
    }

    root.querySelectorAll<HTMLElement>('[data-touch]').forEach((btn) => {
      const action = btn.dataset.touch
      if (action === 'left') bind(btn, 'ArrowLeft')
      if (action === 'right') bind(btn, 'ArrowRight')
      if (action === 'jump') bind(btn, 'Space')
      if (action === 'dash') bind(btn, 'ShiftLeft')
      if (action === 'talk') bind(btn, 'KeyE')
    })
  }

  beginFrame() {
    this.jumpPressed = this.jumpQueued
    this.dashPressed = this.dashQueued
    this.pausePressed = this.pauseQueued
    this.talkPressed = this.talkQueued
    this.retryPressed = this.retryQueued
    this.jumpQueued = false
    this.dashQueued = false
    this.pauseQueued = false
    this.talkQueued = false
    this.retryQueued = false
  }

  get x(): number {
    return (this.right ? 1 : 0) - (this.left ? 1 : 0)
  }

  get y(): number {
    return (this.down ? 1 : 0) - (this.up ? 1 : 0)
  }

  private onKey(e: KeyboardEvent, down: boolean) {
    const code = e.code
    if (
      code === 'Space' ||
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight' ||
      code === 'KeyW' ||
      code === 'KeyA' ||
      code === 'KeyS' ||
      code === 'KeyD'
    ) {
      e.preventDefault()
    }
    this.setCode(code, down)
  }

  private setCode(code: string, down: boolean) {
    const was = this.held.has(code)
    if (down) this.held.add(code)
    else this.held.delete(code)

    this.left = this.hasAny('ArrowLeft', 'KeyA')
    this.right = this.hasAny('ArrowRight', 'KeyD')
    this.up = this.hasAny('ArrowUp', 'KeyW')
    this.down = this.hasAny('ArrowDown', 'KeyS')
    this.jumpHeld = this.hasAny('Space', 'ArrowUp', 'KeyW')

    if (down && !was) {
      if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') this.jumpQueued = true
      if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyJ' || code === 'KeyK') {
        this.dashQueued = true
      }
      if (code === 'Escape' || code === 'KeyP') this.pauseQueued = true
      if (code === 'KeyE' || code === 'KeyF' || code === 'Enter') this.talkQueued = true
      if (code === 'KeyR') this.retryQueued = true
    }
  }

  private hasAny(...codes: string[]) {
    return codes.some((c) => this.held.has(c))
  }

  private clear() {
    this.held.clear()
    this.left = this.right = this.up = this.down = false
    this.jumpHeld = false
  }
}
