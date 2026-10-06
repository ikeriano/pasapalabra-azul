import { useRef, useState } from 'react'

export interface InputState { joyX: number; joyY: number; lookDX: number; lookDY: number; keys: Set<string> }

/** Virtual joystick (bottom-left). Pointer events, works with touch, pen and mouse. */
export function Joystick({ input }: { input: React.MutableRefObject<InputState> }) {
  const base = useRef<HTMLDivElement>(null)
  const id = useRef<number | null>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const move = (e: React.PointerEvent) => {
    const el = base.current!
    const r = el.getBoundingClientRect()
    const R = r.width / 2
    let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R)
    const d = Math.hypot(dx, dy), max = R * 0.62
    if (d > max) { dx *= max / d; dy *= max / d }
    setKnob({ x: dx, y: dy })
    input.current.joyX = dx / max
    input.current.joyY = -dy / max
  }
  const end = (e: React.PointerEvent) => {
    if (id.current !== e.pointerId) return
    id.current = null
    setKnob({ x: 0, y: 0 })
    input.current.joyX = 0; input.current.joyY = 0
  }
  return (
    <div
      ref={base}
      className="joy"
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); id.current = e.pointerId; (e.target as HTMLElement).setPointerCapture(e.pointerId); move(e) }}
      onPointerMove={(e) => { if (id.current === e.pointerId) move(e) }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="joy-ring" />
      <div className="joy-knob" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
    </div>
  )
}

/** Full-screen look pad (sits under the buttons/joystick). Touch: right half; mouse: anywhere. */
export function LookPad({ input }: { input: React.MutableRefObject<InputState> }) {
  const last = useRef<Map<number, { x: number; y: number }>>(new Map())
  return (
    <div
      className="lookpad"
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse' && e.clientX < window.innerWidth * 0.4) return
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        last.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      }}
      onPointerMove={(e) => {
        const l = last.current.get(e.pointerId)
        if (!l) return
        input.current.lookDX += e.clientX - l.x
        input.current.lookDY += e.clientY - l.y
        last.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      }}
      onPointerUp={(e) => last.current.delete(e.pointerId)}
      onPointerCancel={(e) => last.current.delete(e.pointerId)}
    />
  )
}
