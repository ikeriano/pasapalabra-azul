import { useState } from 'react'

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<']
]

export function Keyboard({ onKey, disabled }: { onKey: (k: string) => void; disabled?: boolean }) {
  const [down, setDown] = useState<string | null>(null)
  const press = (k: string) => (e: React.PointerEvent) => {
    e.preventDefault()
    if (disabled) return
    setDown(k)
    onKey(k === '<' ? 'BACK' : k === ' ' ? 'SPACE' : k)
    if (navigator.vibrate) try { navigator.vibrate(8) } catch {}
  }
  const up = () => setDown(null)
  const key = (k: string, cls = '') => (
    <button
      key={k}
      type="button"
      className={`key ${cls} ${down === k ? 'down' : ''}`}
      onPointerDown={press(k)}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={k === '<' ? 'Borrar' : k === ' ' ? 'Espacio' : k}
    >
      {k === ' ' ? '' : k}
    </button>
  )
  return (
    <div className={`kbd ${disabled ? 'kbd-off' : ''}`}>
      <div className="kbd-row">{ROWS[0].map((k) => key(k))}</div>
      <div className="kbd-row">{ROWS[1].map((k) => key(k))}</div>
      <div className="kbd-row r3">{ROWS[2].map((k) => key(k, k === '<' ? 'wide' : ''))}</div>
      <div className="kbd-row r4">{key(' ', 'space')}</div>
    </div>
  )
}

/** Maps physical keyboard events to keyboard keys. */
export function physicalKey(e: KeyboardEvent): string | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null
  if (e.key === 'Backspace') return 'BACK'
  if (e.key === 'Enter') return 'ENTER'
  if (e.key === ' ') return 'SPACE'
  if (e.key === 'Escape') return 'ESC'
  if (e.key.length === 1) {
    const ch = e.key.toUpperCase()
    const map: Record<string, string> = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U' }
    const c = map[ch] ?? ch
    if (/^[A-ZÑ]$/.test(c)) return c
  }
  return null
}
