import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameResult, ResultItem } from '../types'
import { Header } from '../components/Header'
import { DotsRing } from '../components/Icons'
import { TimerRow, useCountdown } from '../components/GameBits'
import { Results } from '../components/Results'
import { ConfirmExit, QuickSettings } from '../components/QuickSettings'
import { audio } from '../audio'
import { store } from '../store'
import { fmtClock, shuffle } from '../utils'

const MEMO_MS = 3000
const ASK_PER_BOARD = 3

type Q = { board: number; slot: number }

export function Donde({ boards, time = 90, onExit, onDone, continueLabel }: { boards: string[][]; time?: number; onExit: () => void; onDone: (r: GameResult) => void; continueLabel?: string }) {
  const [questions] = useState<Q[]>(() => boards.flatMap((_, b) => shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, ASK_PER_BOARD).map((slot) => ({ board: b, slot }))))
  const [qi, setQi] = useState(0)
  const [phase, setPhase] = useState<'memo' | 'ask' | 'feedback'>('memo')
  const [memoLeft, setMemoLeft] = useState(MEMO_MS)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [hits, setHits] = useState(0)
  const [fails, setFails] = useState(0)
  const [hints, setHints] = useState(3)
  const [hintSlot, setHintSlot] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState<GameResult | null>(null)
  // the round timer stops while the player memorises the board
  const [left, leftRef] = useCountdown(time, !result && !paused && !confirm && phase !== 'memo')
  const q = questions[Math.min(qi, questions.length - 1)]
  const words = boards[q.board]

  const finish = useCallback((ans: (number | null)[], h: number, f: number) => {
    const tl = leftRef.current
    const score = Math.max(0, h * 10 - f * 3 + Math.floor(tl / 3))
    const items: ResultItem[] = questions.map((x, i) => ({
      heading: `TABLERO ${x.board + 1}`, def: `¿Dónde estaba «${boards[x.board][x.slot]}»?`, answer: `${boards[x.board][x.slot]} → ${x.slot + 1}`,
      status: ans[i] === null ? 'unanswered' : ans[i] === x.slot ? 'correct' : 'wrong'
    }))
    setResult({
      mode: 'donde', title: '¿DÓNDE ESTÁN? COMPLETADA', timeUsed: time - tl, hits: h, fails: f, score, items,
      seconds: h * 2 + Math.floor(tl / 5),
      shareText: `Pasapalabra · ¿Dónde están?\n✅ ${h}  ❌ ${f}  ⏱ ${fmtClock(time - tl)}\nPuntuación: ${score}`
    })
  }, [questions, boards, time, leftRef])

  // memorise phase countdown (only when not paused)
  useEffect(() => {
    if (phase !== 'memo' || paused || confirm || result) return
    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now(); const dt = now - last; last = now
      setMemoLeft((m) => {
        const n = m - dt
        if (n <= 0) { clearInterval(id); setPhase('ask'); return 0 }
        return n
      })
    }, 100)
    return () => clearInterval(id)
  }, [phase, paused, confirm, result])

  const st = useRef({ answers, hits, fails, phase })
  st.current = { answers, hits, fails, phase }
  useEffect(() => {
    if (left <= 0 && !result && st.current.phase !== 'feedback') finish(st.current.answers, st.current.hits, st.current.fails)
  }, [left, result, finish])

  const pick = (slot: number) => {
    if (phase !== 'ask' || result || paused || confirm || left <= 0) return
    const ok = slot === q.slot
    setPicked(slot); setPhase('feedback'); setHintSlot(null)
    const ans = answers.slice(); ans[qi] = slot
    const h = hits + (ok ? 1 : 0), f = fails + (ok ? 0 : 1)
    if (ok) { audio.playAcierto(); store.addHit(1) } // ONLY on a correct answer
    else audio.playFallo() // ONLY on a wrong answer
    setAnswers(ans); setHits(h); setFails(f)
    setTimeout(() => {
      setPicked(null)
      const rv = new Set(revealed); rv.add(q.slot)
      if (qi + 1 >= questions.length || leftRef.current <= 0) { finish(ans, h, f); return }
      const next = questions[qi + 1]
      setQi(qi + 1)
      if (next.board !== q.board) { setRevealed(new Set()); setMemoLeft(MEMO_MS); setPhase('memo') }
      else { setRevealed(rv); setPhase('ask') }
    }, ok ? 900 : 1400)
  }

  const hint = () => {
    if (phase !== 'ask' || hints <= 0 || result) return
    setHints(hints - 1)
    setHintSlot(q.slot)
    setTimeout(() => setHintSlot((s) => (s === q.slot ? null : s)), 1200)
  }

  return (
    <div className="screen donde">
      <Header title="¿Dónde están?" onBack={() => setConfirm(true)}
        right={<button className="icon-btn sq" onClick={() => setPaused(true)} aria-label="Opciones"><DotsRing size="80%" /></button>} />
      <div className="donde-mid">
        <div className="udc-count donde-count">{phase === 'memo' ? `TABLERO ${q.board + 1}/${boards.length}` : ''}</div>
        <div className={`q-card donde-card ${phase === 'memo' ? 'memo' : ''}`} key={`${qi}-${phase === 'memo'}`}>
          {phase === 'memo' ? (
            <>
              <div className="q-text donde-word small">¡MEMORIZA!</div>
              <div className="memo-bar"><i style={{ width: `${(memoLeft / MEMO_MS) * 100}%` }} /></div>
            </>
          ) : <div className="q-text donde-word">{words[q.slot]}</div>}
        </div>
        <div className={`donde-grid ${phase === 'memo' ? 'memo' : ''}`}>
          {words.map((w, i) => {
            let cls = 'pill'
            const show = phase === 'memo' || revealed.has(i) || (picked !== null && (i === picked || i === q.slot))
            if (picked !== null && i === q.slot) cls += ' ok'
            else if (picked !== null && i === picked) cls += ' bad'
            else if (revealed.has(i)) cls += ' used'
            if (hintSlot === i) cls += ' hinted'
            if (show) cls += ' word'
            return (
              <button key={i} className={cls} onClick={() => pick(i)}>
                <span className="pill-in">{show ? w : i + 1}</span>
              </button>
            )
          })}
        </div>
        <TimerRow left={left} total={time} hits={hits} fails={fails} hints={hints} onHint={hint} />
      </div>
      {paused && <QuickSettings onClose={() => setPaused(false)} onExit={onExit} />}
      {confirm && <ConfirmExit onYes={onExit} onNo={() => setConfirm(false)} />}
      {result && <Results result={result} onContinue={() => onDone(result)} continueLabel={continueLabel} />}
    </div>
  )
}
