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
  /** Current TV jackpot in euros (grows +6000 after each unfinished Partida completa). */
  bote: number
  /** 1-based programa / episode counter. */
  programNumber: number
}

export const BOTE_BASE = 300_000
export const BOTE_STEP = 6_000

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
  ranking: {},
  bote: BOTE_BASE,
  programNumber: 1
}
function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...defaults,
        ...parsed,
        bote: typeof parsed.bote === 'number' && parsed.bote >= BOTE_BASE ? parsed.bote : BOTE_BASE,
        programNumber: typeof parsed.programNumber === 'number' && parsed.programNumber >= 1 ? parsed.programNumber : 1
      }
    }
  } catch {}
  return { ...defaults }
}
let state: Profile = load()
const listeners = new Set<() => void>()
function emit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  listeners.forEach((l) => l())
}

export type ProgramaOutcome = { won: boolean; amount: number; nextBote: number; programNumber: number }

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
  /**
   * Close a Partida completa / PROGRAMA TV.
   * - Full rosco (25 hits) → player takes the current bote; next bote resets to 300_000.
   * - Otherwise → next bote = current + 6_000.
   * Always bumps programNumber.
   */
  finishPrograma(roscoHits: number): ProgramaOutcome {
    const won = roscoHits >= 25
    const amount = won ? state.bote : 0
    const nextBote = won ? BOTE_BASE : state.bote + BOTE_STEP
    const programNumber = state.programNumber + 1
    state = {
      ...state,
      bote: nextBote,
      programNumber,
      coins: state.coins + (won ? 150 : 15),
      totalHits: state.totalHits + (won ? 25 : 0)
    }
    emit()
    return { won, amount, nextBote, programNumber }
  },
  reset() { state = { ...defaults }; emit() },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l) }
}
export function useProfile(): Profile {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
export function levelOf(totalHits: number) { return 1 + Math.floor(totalHits / 50) }
