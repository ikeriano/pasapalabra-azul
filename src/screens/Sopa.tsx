import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameResult, ResultItem } from '../types'
import type { SopaPuzzle } from '../data'
import { Header } from '../components/Header'
import { Grid9 } from '../components/Icons'
import { TimerRow, useCountdown } from '../components/GameBits'
import { Results } from '../components/Results'
import { ConfirmExit, QuickSettings } from '../components/QuickSettings'
import { audio } from '../audio'
import { store } from '../store'
import { fmtClock } from '../utils'

type Cell = [number, number]
const key = (c: Cell) => `${c[0]},${c[1]}`

/** Cells on the straight line (row / column / diagonal) from a to b, or null when not aligned. */
function line(a: Cell, b: Cell): Cell[] | null {
  const dr = b[0] - a[0], dc = b[1] - a[1]
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null
  const n = Math.max(Math.abs(dr), Math.abs(dc))
  const sr = Math.sign(dr), sc = Math.sign(dc)
  return Array.from({ length: n + 1 }, (_, i) => [a[0] + sr * i, a[1] + sc * i] as Cell)
}

export function Sopa({ puzzles, time = 90, onExit, onDone, continueLabel }: { puzzles: SopaPuzzle[]; time?: number; onExit: () => void; onDone: (r: GameResult) => void; continueLabel?: string }) {
  const [round, setRound] = useState(0)
  const [found, setFound] = useState<boolean[][]>(() => puzzles.map((p) => p.words.map(() => false)))
  const [hits, setHits] = useState(0)
  const [fails, setFails] = useState(0)
  const [hints, setHints] = useState(3)
  const [hinted, setHinted] = useState<string | null>(null)
  const [sel, setSel] = useState<Cell[]>([])
  const [anchor, setAnchor] = useState<Cell | null>(null)
  const [flash, setFlash] = useState<{ cells: string[]; ok: boolean } | null>(null)
  const [paused, setPaused] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState<GameResult | null>(null)
  const [left, leftRef] = useCountdown(time, !result && !paused && !confirm)
  const drag = useRef<{ start: Cell; moved: boolean; id: number; sel: Cell[] } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const pz = puzzles[Math.min(round, puzzles.length - 1)]
  const doneRound = found[round]?.every(Boolean)

  const finish = useCallback((fnd: boolean[][], h: number, f: number, roundsReached: number) => {
    const tl = leftRef.current
    const score = Math.max(0, h * 10 - f * 2 + Math.floor(tl / 3))
    const items: ResultItem[] = []
    puzzles.slice(0, roundsReached).forEach((p, ri) => p.words.forEach((w, wi) => items.push({
      heading: p.category, def: `Palabra escondida ${wi + 1} de ${p.words.length}`, answer: w.display.toUpperCase(),
      status: fnd[ri][wi] ? 'correct' : 'unanswered'
    })))
    setResult({
      mode: 'sopa', title: 'SOPA DE LETRAS COMPLETADA', timeUsed: time - tl, hits: h, fails: f, score, items,
      seconds: h * 2 + Math.floor(tl / 5),
      shareText: `Pasapalabra · Sopa de Letras\n✅ ${h}  ❌ ${f}  ⏱ ${fmtClock(time - tl)}\nPuntuación: ${score}`
    })
  }, [puzzles, time, leftRef])

  const st = useRef({ found, hits, fails, round })
  st.current = { found, hits, fails, round }
  useEffect(() => {
    if (left <= 0 && !result) finish(st.current.found, st.current.hits, st.current.fails, st.current.round + 1)
  }, [left, result, finish])

  const blocked = !!result || paused || confirm || left <= 0 || !!doneRound

  const evaluate = (cells: Cell[]) => {
    if (cells.length < 2) return
    const str = cells.map(([r, c]) => pz.grid[r][c]).join('')
    const rev = str.split('').reverse().join('')
    const wi = pz.words.findIndex((w, i) => !found[round][i] && (w.plain === str || w.plain === rev))
    const ks = cells.map(key)
    // re-selecting a word that is already found is neutral (no sound, no fail)
    if (wi < 0 && pz.words.some((w, i) => found[round][i] && (w.plain === str || w.plain === rev))) return
    if (wi >= 0) {
      audio.playAcierto() // ONLY on a correct answer
      store.addHit(1)
      const fnd = found.map((r) => r.slice()); fnd[round][wi] = true
      const h = hits + 1
      setFound(fnd); setHits(h)
      if (hinted && pz.words[wi].cells.some((c) => key(c) === hinted)) setHinted(null)
      setFlash({ cells: ks, ok: true })
      setTimeout(() => setFlash(null), 450)
      if (fnd[round].every(Boolean)) {
        setTimeout(() => {
          if (round + 1 >= puzzles.length) finish(fnd, h, fails, round + 1)
          else { setRound(round + 1); setHinted(null) }
        }, 900)
      }
    } else {
      audio.playFallo() // ONLY on a wrong answer
      setFails(fails + 1)
      setFlash({ cells: ks, ok: false })
      setTimeout(() => setFlash(null), 550)
    }
  }

  const cellAt = (x: number, y: number): Cell | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null
    const t = el?.closest('[data-r]') as HTMLElement | null
    if (!t || !gridRef.current?.contains(t)) return null
    return [Number(t.dataset.r), Number(t.dataset.c)]
  }

  const onDown = (e: React.PointerEvent) => {
    if (blocked) return
    const c = cellAt(e.clientX, e.clientY)
    if (!c) return
    e.preventDefault()
    // tap mode: second tap on a tile aligned with the first one closes the line
    if (anchor && key(anchor) !== key(c)) {
      const l = line(anchor, c)
      setAnchor(null)
      if (l) { setSel([]); evaluate(l); return }
    }
    drag.current = { start: c, moved: false, id: e.pointerId, sel: [c] }
    setSel([c])
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const c = cellAt(e.clientX, e.clientY)
    if (!c) return
    const l = line(d.start, c)
    if (l) { if (l.length > 1) d.moved = true; d.sel = l; setSel(l) }
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    if (d.moved && d.sel.length > 1) { setAnchor(null); evaluate(d.sel); setSel([]) }
    else {
      // simple tap: set / clear the anchor tile
      setSel([])
      setAnchor(anchor && key(anchor) === key(d.start) ? null : d.start)
    }
  }

  const hint = () => {
    if (blocked || hints <= 0) return
    const wi = pz.words.findIndex((_, i) => !found[round][i])
    if (wi < 0) return
    setHints(hints - 1)
    setHinted(key(pz.words[wi].cells[0]))
  }

  const foundCells = new Set<string>()
  pz.words.forEach((w, i) => { if (found[round][i]) w.cells.forEach((c) => foundCells.add(key(c))) })
  const selSet = new Set(sel.map(key))

  return (
    <div className="screen sopa">
      <Header title="Sopa de Letras" onBack={() => setConfirm(true)}
        right={<button className="icon-btn sq" onClick={() => setPaused(true)} aria-label="Opciones"><Grid9 size="78%" /></button>} />
      <div className="sopa-mid">
        <div className="udc-count">{Math.min(round + 1, puzzles.length)}/{puzzles.length}</div>
        <div className="q-card sopa-card" key={round}><div className="q-text">{pz.category}</div></div>
        <div className="sopa-words">
          {pz.words.map((w, i) => found[round][i]
            ? <span key={i} className="sw found">{w.display.toUpperCase()}</span>
            : <span key={i} className="sw"><i /></span>)}
        </div>
        <div className="sopa-grid-wrap">
          <div className={`sopa-grid ${doneRound ? 'done' : ''}`} ref={gridRef} key={round}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            {pz.grid.map((row, r) => row.map((ch, c) => {
              const k = key([r, c])
              let cls = 'tile'
              if (foundCells.has(k)) cls += ' found'
              if (flash?.cells.includes(k)) cls += flash.ok ? ' ok' : ' bad'
              else if (selSet.has(k) || (anchor && key(anchor) === k)) cls += ' sel'
              if (hinted === k) cls += ' hinted'
              return <div key={k} className={cls} data-r={r} data-c={c}><span>{ch}</span></div>
            }))}
          </div>
        </div>
        <TimerRow left={left} total={time} hits={hits} fails={fails} hints={hints} onHint={hint} />
      </div>
      {paused && <QuickSettings onClose={() => setPaused(false)} onExit={onExit} />}
      {confirm && <ConfirmExit onYes={onExit} onNo={() => setConfirm(false)} />}
      {result && <Results result={result} onContinue={() => onDone(result)} continueLabel={continueLabel} />}
    </div>
  )
}
