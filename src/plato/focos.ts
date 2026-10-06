import { useSyncExternalStore } from 'react'

export type FocoGroupId = 'front' | 'back' | 'side' | 'balcony' | 'accent'
export interface FocoGroup {
  on: boolean
  color: string
  intensity: number // 0–1
  cone: number // 0.5–2 beam scale
}
export type FocosState = Record<FocoGroupId, FocoGroup>

export const FOCO_PRESETS = ['#ffffff', '#9fd0ff', '#2a86e6', '#ff8a2a', '#ff4fd8', '#2ee6c8', '#ffe27a'] as const

export const FOCO_LABELS: Record<FocoGroupId, string> = {
  front: 'Frontal',
  back: 'Trasera',
  side: 'Laterales',
  balcony: 'Balcón',
  accent: 'Acento'
}

const KEY = 'pasapalabra-azul-focos-v1'
const defaults: FocosState = {
  front: { on: true, color: '#cfe6ff', intensity: 0.85, cone: 1 },
  back: { on: true, color: '#9fd0ff', intensity: 0.7, cone: 1 },
  side: { on: true, color: '#ffffff', intensity: 0.55, cone: 0.9 },
  balcony: { on: true, color: '#b8d8ff', intensity: 0.65, cone: 1.1 },
  accent: { on: true, color: '#ff8a2a', intensity: 0.5, cone: 1 }
}

function load(): FocosState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaults, front: { ...defaults.front }, back: { ...defaults.back }, side: { ...defaults.side }, balcony: { ...defaults.balcony }, accent: { ...defaults.accent } }
    const parsed = JSON.parse(raw) as Partial<FocosState>
    const out = {} as FocosState
    for (const id of Object.keys(defaults) as FocoGroupId[]) {
      out[id] = { ...defaults[id], ...(parsed[id] ?? {}) }
      out[id].intensity = Math.max(0, Math.min(1, out[id].intensity))
      out[id].cone = Math.max(0.5, Math.min(2, out[id].cone))
    }
    return out
  } catch {
    return { ...defaults, front: { ...defaults.front }, back: { ...defaults.back }, side: { ...defaults.side }, balcony: { ...defaults.balcony }, accent: { ...defaults.accent } }
  }
}

let state: FocosState = load()
const listeners = new Set<() => void>()
function emit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  listeners.forEach((l) => l())
}

export const focos = {
  get: () => state,
  setGroup(id: FocoGroupId, patch: Partial<FocoGroup>) {
    state = { ...state, [id]: { ...state[id], ...patch } }
    emit()
  },
  reset() {
    state = {
      front: { ...defaults.front }, back: { ...defaults.back }, side: { ...defaults.side },
      balcony: { ...defaults.balcony }, accent: { ...defaults.accent }
    }
    emit()
  },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l) }
}

export function useFocos(): FocosState {
  return useSyncExternalStore(focos.subscribe, focos.get, focos.get)
}
