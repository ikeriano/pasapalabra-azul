export type LetterStatus = 'pending' | 'current' | 'correct' | 'wrong' | 'passed'
export interface RoscoEntry { letter: string; type: 'empieza' | 'contiene'; def: string; answer: string[] }
export interface RoscoBank { id: string; name: string; entries: RoscoEntry[] }
export interface SillaEntry { letter: string; def: string; answer: string[] }
export interface UdcQuestion { q: string; options: string[]; correct: number }
export type Mode = 'rosco' | 'diario' | 'silla' | 'udc' | 'sopa' | 'donde' | 'tv' | 'duelo'
export interface ResultItem {
  letter?: string
  heading: string
  def: string
  answer: string
  status: 'correct' | 'unanswered' | 'wrong'
}
export interface DuelSummary { names: [string, string]; hits: [number, number]; fails: [number, number]; winner: number | null }
export interface GameResult {
  mode: Mode
  title: string
  timeUsed: number
  hits: number
  fails: number
  score: number
  items: ResultItem[]
  shareText: string
  /** Seconds earned for El Rosco in the PROGRAMA TV / Partida completa flow. */
  seconds?: number
  duel?: DuelSummary
}
