import { useEffect, useState } from 'react'
let value: string | null = null
const subs = new Set<(v: string | null) => void>()
export function setBgCenter(v: string | null) { value = v; subs.forEach((f) => f(v)) }
export function useBgCenter() {
  const [v, setV] = useState(value)
  useEffect(() => { subs.add(setV); return () => { subs.delete(setV) } }, [])
  return v
}
/** Track the vertical center of an element (as % of viewport height) and feed it to the background rings. */
export function trackCenter(el: HTMLElement | null) {
  if (!el) return
  const r = el.getBoundingClientRect()
  if (r.height > 0) setBgCenter(`${((r.top + r.height / 2) / window.innerHeight) * 100}%`)
}

/** Plain gradient background (no rings) — used by the "lista de pruebas" screen. */
let plain = false
const plainSubs = new Set<(v: boolean) => void>()
export function setBgPlain(v: boolean) { plain = v; plainSubs.forEach((f) => f(v)) }
export function useBgPlain() {
  const [v, setV] = useState(plain)
  useEffect(() => { plainSubs.add(setV); return () => { plainSubs.delete(setV) } }, [])
  return v
}
