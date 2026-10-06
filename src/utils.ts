export function norm(s: string): string {
  return s
    .trim()
    .toUpperCase()
    .replace(/Ñ/g, '\u0001')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0001/g, 'Ñ')
    .replace(/[^A-ZÑ0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
export function isCorrect(input: string, answers: string[]): boolean {
  const a = norm(input)
  if (!a) return false
  const loose = (x: string) => x.replace(/Ñ/g, 'N').replace(/ /g, '')
  return answers.some((ans) => {
    const b = norm(ans)
    return b === a || loose(b) === loose(a)
  })
}
export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.ceil(sec))
  if (s < 60) return String(s).padStart(2, '0')
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
export function fmtClock(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export function display(s: string): string {
  return s.toUpperCase()
}
