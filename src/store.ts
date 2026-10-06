import { useSyncExternalStore } from 'react'
import type { Mode } from './types'

export interface RankEntry { name: string; score: number; hits: number; fails: number; date: string }
export interface Profile {
  name: string
  avatar: string
  coins: number
  totalHits: number
  music: boolean
  sfx: boolean
  owned: string[]
  dailyDone: string
  ranking: Partial<Record<Mode, RankEntry[]>>
}
const KEY = 'pasapalabra-azul-v1'
const defaults: Profile = {
  name: 'JUGADOR',
  avatar: 'classic',
  coins: 25,
  totalHits: 0,
  music: true,
  sfx: true,
  owned: ['classic', 'naranja', 'verde'],
  dailyDone: '',
  ranking: {}
}
function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch {}
  return { ...defaults }
}
let state: Profile = load()
const listeners = new Set<() => void>()
function emit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  listeners.forEach((l) => l())
}
export const store = {
  get: () => state,
  set(patch: Partial<Profile>) { state = { ...state, ...patch }; emit() },
  addHit(n = 1) { state = { ...state, coins: state.coins + n, totalHits: state.totalHits + n }; emit() },
  addCoins(n: number) { state = { ...state, coins: Math.max(0, state.coins + n) }; emit() },
  addRank(mode: Mode, e: RankEntry) {
    const list = [...(state.ranking[mode] ?? []), e].sort((a, b) => b.score - a.score).slice(0, 10)
    state = { ...state, ranking: { ...state.ranking, [mode]: list } }
    emit()
  },
  reset() { state = { ...defaults }; emit() },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l) }
}
export function useProfile(): Profile {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
export function levelOf(totalHits: number) { return 1 + Math.floor(totalHits / 50) }
