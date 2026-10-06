import { useEffect, useRef, useState } from 'react'
import { fmtClock } from '../utils'
import { Bulb } from './Icons'

/** Round countdown timer with progress ring (as in Una de Cuatro / Sopa de Letras / ¿Dónde están?). */
export function BigTimer({ left, total }: { left: number; total: number }) {
  const C = 2 * Math.PI * 46
  const frac = Math.max(0, left / total)
  return (
    <div className="big-timer">
      <svg viewBox="0 0 100 100" className="big-timer-ring">
        <circle cx="50" cy="50" r="46" className="trk" />
        <circle cx="50" cy="50" r="46" className="prg" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90 50 50)" />
      </svg>
      <div className="big-timer-in"><span>{fmtClock(left)}</span></div>
    </div>
  )
}

/** Bottom row: green hits + red fails (left), timer (centre), yellow hint bulb (right). */
export function TimerRow({ left, total, hits, fails, hints, onHint }: { left: number; total: number; hits: number; fails: number; hints: number; onHint: () => void }) {
  return (
    <div className="timer-row">
      <div className="tr-counters">
        <span className="cnt green">{hits}</span>
        <span className="cnt red">{fails}</span>
      </div>
      <BigTimer left={left} total={total} />
      <button className={`hint-bulb ${hints <= 0 ? 'off' : ''}`} onClick={onHint} aria-label="Pista">
        <Bulb size="62%" />
        {hints > 0 && <span className="hint-count">{hints}</span>}
      </button>
    </div>
  )
}

/** Countdown in seconds that only runs while `running` (pauses on hidden tab). */
export function useCountdown(total: number, running: boolean) {
  const [left, setLeft] = useState(total)
  const ref = useRef(total)
  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      if (document.hidden) { last = now; return }
      const t = Math.max(0, ref.current - (now - last) / 1000)
      last = now
      ref.current = t
      setLeft(t)
      if (t <= 0) clearInterval(id)
    }, 200)
    return () => clearInterval(id)
  }, [running])
  return [left, ref] as const
}
