import roscosRaw from './roscos.json'
import sillaRaw from './silla.json'
import udcRaw from './unadecuatro.json'
import type { RoscoBank, SillaEntry, UdcQuestion, RoscoEntry, AlazBank } from '../types'
import { hashStr, mulberry32, shuffle, todayKey, norm } from '../utils'

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z']
export const ROSCOS = roscosRaw as RoscoBank[]
export const SILLA = sillaRaw as SillaEntry[]
export const UDC = udcRaw as UdcQuestion[]

let lastBank = ''
export function randomRosco(exclude?: string): RoscoBank {
  const pool = ROSCOS.filter((r) => r.id !== lastBank && r.id !== exclude)
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? ROSCOS[0]
  lastBank = pick.id
  return pick
}
export function dailyRosco(date = todayKey()): RoscoBank {
  const rnd = mulberry32(hashStr('pasapalabra-azul-' + date))
  const entries: RoscoEntry[] = LETTERS.map((L) => {
    const opts = ROSCOS.map((r) => r.entries.find((e) => e.letter === L)!).filter(Boolean)
    return opts[Math.floor(rnd() * opts.length)]
  })
  return { id: 'daily-' + date, name: 'Rosco diario', entries }
}
export function sillaSession(n: number): SillaEntry[] {
  return shuffle(SILLA).slice(0, n)
}
export function udcSession(n: number): UdcQuestion[] {
  return shuffle(UDC)
    .slice(0, n)
    .map((q) => {
      const order = shuffle([0, 1, 2, 3])
      return { q: q.q, options: order.map((i) => q.options[i]), correct: order.indexOf(q.correct) }
    })
}

import sopaRaw from './sopa.json'
import dondeRaw from './donde.json'
import alazRaw from './alaz.json'

export interface SopaCategory { category: string; words: string[] }
export interface SopaPuzzle { category: string; grid: string[][]; words: { display: string; plain: string; cells: [number, number][] }[] }
export const SOPA = sopaRaw as SopaCategory[]
export const DONDE_WORDS = dondeRaw as string[]

const FILL = 'AAAAEEEEOOOIIUSSRRNNLLDDCCTTMMPBGVFHJQZYXÑ'
const DIRS: [number, number][] = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]]

/** Places 5 words of the category in a 5x5 grid (any of 8 directions, overlaps allowed when letters match) and fills the rest. */
export function makeSopa(cat: SopaCategory, n = 5, size = 5): SopaPuzzle {
  for (let attempt = 0; attempt < 400; attempt++) {
    const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''))
    const placed: SopaPuzzle['words'] = []
    const used = DIRS.map((_, i) => (i >= 4 ? 0.6 : 0))
    const pool = shuffle(cat.words).sort((a, b) => norm(b).length - norm(a).length + (Math.random() - 0.5) * 1.5)
    for (const w of pool) {
      if (placed.length >= n) break
      const plain = norm(w).replace(/ /g, '')
      // try the least-used directions first so the words are spread over rows, columns and diagonals
      const dirs = shuffle(DIRS.map((_, i) => i)).sort((a, b) => used[a] - used[b])
      const starts = shuffle(Array.from({ length: size * size }, (_, i) => i))
      let done: [number, number][] | null = null, di = -1
      for (const d of dirs) {
        const [dr, dc] = DIRS[d]
        for (const st of starts) {
          const r0 = Math.floor(st / size), c0 = st % size
          const cells: [number, number][] = []
          let fits = true
          for (let i = 0; i < plain.length; i++) {
            const r = r0 + dr * i, c = c0 + dc * i
            if (r < 0 || c < 0 || r >= size || c >= size || (grid[r][c] && grid[r][c] !== plain[i])) { fits = false; break }
            cells.push([r, c])
          }
          if (fits) { done = cells; di = d; break }
        }
        if (done) break
      }
      if (!done) continue
      done.forEach(([r, c], i) => (grid[r][c] = plain[i]))
      used[di] += di === 0 || di === 4 ? 2 : di === 1 || di === 5 ? 1.5 : 1
      placed.push({ display: w, plain, cells: done })
    }
    if (placed.length < n) continue
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = FILL[Math.floor(Math.random() * FILL.length)]
    return { category: cat.category, grid, words: placed }
  }
  throw new Error('No se pudo generar la sopa de letras')
}
export function sopaSession(rounds = 8): SopaPuzzle[] {
  return shuffle(SOPA).slice(0, rounds).map((c) => makeSopa(c))
}
export function dondeBoards(n = 6): string[][] {
  const out: string[][] = []
  let pool = shuffle(DONDE_WORDS)
  for (let i = 0; i < n; i++) {
    if (pool.length < 9) pool = shuffle(DONDE_WORDS)
    out.push(pool.splice(0, 9))
  }
  return out
}

export const ALAZ = alazRaw as AlazBank[]
let lastAlaz = ''
export function randomAlaz(exclude?: string): AlazBank {
  const pool = ALAZ.filter((r) => r.id !== lastAlaz && r.id !== exclude)
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? ALAZ[0]
  lastAlaz = pick.id
  return pick
}
