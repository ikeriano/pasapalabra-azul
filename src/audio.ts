import { asset } from './asset'
/**
 * Audio rules (user requirement):
 *  - ACIERTO sound (sfx-a.mp3) plays ONLY from playAcierto(), called ONLY when an answer is evaluated correct.
 *  - FALLO sound (sfx-b.mp3) plays ONLY from playFallo(), called ONLY when an answer is evaluated wrong.
 *  - PASAPALABRA plays NO sound. Nothing is ever played randomly.
 *  - Nothing starts before the first user gesture (autoplay policy).
 */
import { store } from './store'

type Scene = 'menu' | 'game' | 'none'
const MUSIC: Record<Exclude<Scene, 'none'>, { src: string; vol: number }> = {
  menu: { src: asset('audio/track-large-13mb.mp3'), vol: 0.35 },
  game: { src: asset('audio/track-medium.mp3'), vol: 0.3 }
}
const SFX = { ok: asset('audio/sfx-a.mp3'), bad: asset('audio/sfx-b.mp3') }

class AudioManager {
  private unlocked = false
  private scene: Scene = 'none'
  private els: Partial<Record<'menu' | 'game', HTMLAudioElement>> = {}
  private ctx: AudioContext | null = null
  private buffers: Partial<Record<'ok' | 'bad', AudioBuffer>> = {}
  private fallback: Partial<Record<'ok' | 'bad', HTMLAudioElement>> = {}

  init() {
    const unlock = () => {
      window.removeEventListener('pointerdown', unlock, true)
      window.removeEventListener('keydown', unlock, true)
      this.unlock()
    }
    window.addEventListener('pointerdown', unlock, true)
    window.addEventListener('keydown', unlock, true)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pauseAll()
      else this.applyScene()
    })
  }
  get isUnlocked() { return this.unlocked }

  private unlock() {
    if (this.unlocked) return
    this.unlocked = true
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AC) {
        this.ctx = new AC()
        void this.ctx.resume()
        ;(['ok', 'bad'] as const).forEach(async (k) => {
          try {
            const res = await fetch(SFX[k])
            const buf = await res.arrayBuffer()
            this.buffers[k] = await this.ctx!.decodeAudioData(buf)
          } catch {}
        })
      }
    } catch {}
    ;(['ok', 'bad'] as const).forEach((k) => {
      const a = new Audio(SFX[k])
      a.preload = 'auto'
      this.fallback[k] = a
    })
    this.applyScene()
  }

  setScene(s: Scene) {
    if (this.scene === s) return
    this.scene = s
    this.applyScene()
  }

  private music(k: 'menu' | 'game') {
    let el = this.els[k]
    if (!el) {
      el = new Audio(MUSIC[k].src)
      el.loop = true
      el.preload = 'auto'
      el.volume = MUSIC[k].vol
      this.els[k] = el
    }
    return el
  }

  private pauseAll() {
    Object.values(this.els).forEach((e) => e?.pause())
  }

  applyScene() {
    if (!this.unlocked || document.hidden) return
    const on = store.get().music
    ;(['menu', 'game'] as const).forEach((k) => {
      if (k === this.scene && on) {
        const el = this.music(k)
        if (el.paused) void el.play().catch(() => {})
      } else {
        const el = this.els[k]
        if (el && !el.paused) el.pause()
      }
    })
  }

  private play(k: 'ok' | 'bad') {
    if (!this.unlocked || !store.get().sfx) return
    const buf = this.buffers[k]
    if (this.ctx && buf) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      const src = this.ctx.createBufferSource()
      const g = this.ctx.createGain()
      g.gain.value = 0.9
      src.buffer = buf
      src.connect(g).connect(this.ctx.destination)
      src.start()
      return
    }
    const el = this.fallback[k]
    if (el) {
      el.currentTime = 0
      void el.play().catch(() => {})
    }
  }
  /** Call ONLY after an answer was evaluated as CORRECT. */
  playAcierto() { this.play('ok') }
  /** Call ONLY after an answer was evaluated as WRONG. */
  playFallo() { this.play('bad') }
}

export const audio = new AudioManager()
