import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameResult, UdcQuestion } from '../types'
import { Header } from '../components/Header'
import { FourDots } from '../components/Icons'
import { Results } from '../components/Results'
import { ConfirmExit, QuickSettings } from '../components/QuickSettings'
import { audio } from '../audio'
import { store } from '../store'
import { fmtClock } from '../utils'

export function UnaDeCuatro({ questions, time = 90, onExit, onDone, continueLabel }: { questions: UdcQuestion[]; time?: number; onExit: () => void; onDone: (r: GameResult) => void; continueLabel?: string }) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [hits, setHits] = useState(0)
  const [fails, setFails] = useState(0)
  const [left, setLeft] = useState(time)
  const [paused, setPaused] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState<GameResult | null>(null)
  const leftRef = useRef(left)
  leftRef.current = left
  const q = questions[Math.min(idx, questions.length - 1)]

  const finish = useCallback((ans: (number | null)[], h: number, f: number) => {
    const tl = leftRef.current
    const score = Math.max(0, h * 10 - f * 3 + Math.floor(tl / 3))
    const items = questions.map((x, i) => ({
      heading: `PREGUNTA ${i + 1}`, def: x.q, answer: x.options[x.correct].toUpperCase(),
      status: ans[i] === null ? 'unanswered' as const : ans[i] === x.correct ? 'correct' as const : 'wrong' as const
    }))
    setResult({
      mode: 'udc', title: 'UNA DE CUATRO COMPLETADA', timeUsed: time - tl, hits: h, fails: f, score, items,
      shareText: `Pasapalabra · Una de Cuatro\n✅ ${h}  ❌ ${f}  ⏱ ${fmtClock(time - tl)}\nPuntuación: ${score}`
    })
  }, [questions, time])

  useEffect(() => {
    if (result || paused || confirm) return
    let last = performance.now()
    const id = setInterval(() => {
      if (document.hidden) { last = performance.now(); return }
      const now = performance.now(); const dt = (now - last) / 1000; last = now
      const t = Math.max(0, leftRef.current - dt)
      leftRef.current = t
      setLeft(t)
      if (t <= 0) { clearInterval(id) }
    }, 200)
    return () => clearInterval(id)
  }, [result, paused, confirm])

  const ansRef = useRef({ answers, hits, fails })
  ansRef.current = { answers, hits, fails }
  useEffect(() => {
    if (left <= 0 && !result && picked === null) finish(ansRef.current.answers, ansRef.current.hits, ansRef.current.fails)
  }, [left, result, picked, finish])

  const pick = (i: number) => {
    if (picked !== null || result || paused || confirm || left <= 0) return
    setPicked(i)
    const ok = i === q.correct
    const ans = answers.slice(); ans[idx] = i
    const h = hits + (ok ? 1 : 0), f = fails + (ok ? 0 : 1)
    if (ok) { audio.playAcierto(); store.addHit(1) } // ONLY on a correct answer
    else audio.playFallo() // ONLY on a wrong answer
    setAnswers(ans); setHits(h); setFails(f)
    setTimeout(() => {
      setPicked(null)
      if (idx + 1 >= questions.length || leftRef.current <= 0) finish(ans, h, f)
      else setIdx(idx + 1)
    }, ok ? 900 : 1300)
  }

  const frac = Math.max(0, left / time)
  const C = 2 * Math.PI * 46
  return (
    <div className="screen udc">
      <Header title="Una de Cuatro" onBack={() => setConfirm(true)}
        right={<button className="icon-btn sq" onClick={() => setPaused(true)} aria-label="Opciones"><FourDots size="80%" /></button>} />
      <div className="udc-mid">
        <div className="udc-count">{Math.min(idx + 1, questions.length)}/{questions.length}</div>
        <div className="q-card udc-card" key={idx}>
          <div className="q-text">{q.q.toUpperCase()}</div>
        </div>
        <div className="udc-opts">
          {q.options.map((o, i) => {
            let cls = ''
            if (picked !== null) {
              if (i === q.correct) cls = 'ok'
              else if (i === picked) cls = 'bad'
            }
            return <button key={i} className={`udc-opt ${cls}`} onClick={() => pick(i)}><span>{o.toUpperCase()}</span></button>
          })}
        </div>
        <div className="udc-foot">
          <div className="big-timer">
            <svg viewBox="0 0 100 100" className="big-timer-ring">
              <circle cx="50" cy="50" r="46" className="trk" />
              <circle cx="50" cy="50" r="46" className="prg" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90 50 50)" />
            </svg>
            <div className="big-timer-in"><span>{fmtClock(left)}</span></div>
          </div>
          <div className="counters udc-counters">
            <span className="cnt red">{fails}</span>
            <span className="cnt green">{hits}</span>
          </div>
        </div>
      </div>
      {paused && <QuickSettings onClose={() => setPaused(false)} onExit={onExit} />}
      {confirm && <ConfirmExit onYes={onExit} onNo={() => setConfirm(false)} />}
      {result && <Results result={result} onContinue={() => onDone(result)} continueLabel={continueLabel} />}
    </div>
  )
}
