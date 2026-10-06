import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { AlazBank, GameResult, LetterStatus } from '../types'
import { Header } from '../components/Header'
import { Keyboard, physicalKey } from '../components/Keyboard'
import { AnswerBar } from '../components/AnswerBar'
import { Results } from '../components/Results'
import { ConfirmExit, QuickSettings } from '../components/QuickSettings'
import { AlazLogo } from '../components/AlazLogo'
import { audio } from '../audio'
import { store } from '../store'
import { blankPattern, fmtClock, isCorrect, norm } from '../utils'
import { LETTERS } from '../data'

type St = Exclude<LetterStatus, 'current'>
type Phase = 'intro' | 'play' | 'reveal' | 'done'
const N = 25

function nextIdx(status: St[], from: number, dir: 1 | -1): number {
  for (let k = 1; k <= N; k++) {
    const i = (from + dir * k + N * 10) % N
    if (status[i] === 'pending' || status[i] === 'passed') return i
  }
  return -1
}

export function Alaz({ bank, time = 150, onExit, onDone, continueLabel }: {
  bank: AlazBank; time?: number; onExit: () => void; onDone: (r: GameResult) => void; continueLabel?: string
}) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [status, setStatus] = useState<St[]>(() => Array(N).fill('pending'))
  const [cur, setCur] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [input, setInput] = useState('')
  const [hits, setHits] = useState(0)
  const [fails, setFails] = useState(0)
  const [left, setLeft] = useState(time)
  const [reveal, setReveal] = useState('')
  const [paused, setPaused] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState<GameResult | null>(null)
  const [flash, setFlash] = useState<'ok' | 'bad' | ''>('')
  const leftRef = useRef(left); leftRef.current = left
  const trackRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([])
  const entry = bank.entries[cur]
  const pattern = blankPattern(entry.answer[0], entry.letter)

  const finish = useCallback((st: St[], h: number, f: number) => {
    const tl = leftRef.current
    const score = Math.max(0, h * 10 - f * 3 + Math.floor(tl / 5))
    const items = bank.entries.map((e, i) => ({
      letter: e.letter,
      heading: `CONTIENE LA ${e.letter}`,
      def: e.def,
      answer: e.answer[0].toUpperCase(),
      status: st[i] === 'correct' ? 'correct' as const : st[i] === 'wrong' ? 'wrong' as const : 'unanswered' as const
    }))
    setPhase('done')
    setResult({
      mode: 'alaz', title: 'A LA Z COMPLETADA', timeUsed: time - tl, hits: h, fails: f, score, items,
      seconds: h * 2 + Math.floor(tl / 5),
      shareText: `Pasapalabra · A la Z\n✅ ${h}  ❌ ${f}  ⏱ ${fmtClock(time - tl)}\nPuntuación: ${score}`
    })
  }, [bank, time])

  // Auto-scroll the letter track so the current tile stays centered
  useLayoutEffect(() => {
    const track = trackRef.current, tile = tileRefs.current[cur]
    if (!track || !tile || phase === 'intro') return
    const left = tile.offsetLeft - track.clientWidth / 2 + tile.clientWidth / 2
    track.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [cur, dir, phase])

  // Timer
  useEffect(() => {
    if (phase !== 'play' || paused || confirm) return
    let last = performance.now()
    const id = setInterval(() => {
      if (document.hidden) { last = performance.now(); return }
      const now = performance.now(); const t = Math.max(0, leftRef.current - (now - last) / 1000); last = now
      leftRef.current = t; setLeft(t)
      if (t <= 0) clearInterval(id)
    }, 200)
    return () => clearInterval(id)
  }, [phase, paused, confirm])

  const stRef = useRef({ status, hits, fails, cur, dir })
  stRef.current = { status, hits, fails, cur, dir }
  useEffect(() => {
    if (left <= 0 && phase === 'play') finish(stRef.current.status, stRef.current.hits, stRef.current.fails)
  }, [left, phase, finish])

  const advance = (st: St[], h: number, f: number, from: number, d: 1 | -1) => {
    let n = nextIdx(st, from, d)
    let nd = d
    if (n < 0) {
      // end of this direction: reverse for the second pass over remaining letters
      nd = d === 1 ? -1 : 1
      n = nextIdx(st, from, nd)
      if (n < 0) { finish(st, h, f); return }
      setDir(nd)
    }
    setCur(n)
    setPhase('play')
  }

  const submit = () => {
    if (phase !== 'play' || paused || confirm || !input.trim()) return
    const ok = isCorrect(input, entry.answer)
    setInput('')
    if (ok) {
      audio.playAcierto() // ONLY on a correct answer
      store.addHit(1)
      setFlash('ok'); setTimeout(() => setFlash(''), 350)
      const st = status.slice(); st[cur] = 'correct'
      const h = hits + 1
      setStatus(st); setHits(h)
      advance(st, h, fails, cur, dir)
    } else {
      audio.playFallo() // ONLY on a wrong answer
      setFlash('bad'); setTimeout(() => setFlash(''), 350)
      const st = status.slice(); st[cur] = 'wrong'
      const f = fails + 1
      setStatus(st); setFails(f)
      setReveal(norm(entry.answer[0]))
      setPhase('reveal')
      setTimeout(() => { setReveal(''); advance(st, hits, f, cur, dir) }, 1600)
    }
  }

  const pasapalabra = () => {
    if (phase !== 'play' || paused || confirm) return
    // PASAPALABRA: intentionally NO sound.
    setInput('')
    const st = status.slice(); st[cur] = 'passed'
    setStatus(st)
    advance(st, hits, fails, cur, dir)
  }

  const onKey = (k: string) => {
    if (phase !== 'play' || paused || confirm) return
    if (k === 'BACK') setInput((v) => v.slice(0, -1))
    else if (k === 'SPACE') setInput((v) => (v && !v.endsWith(' ') && v.length < 22 ? v + ' ' : v))
    else if (k === 'ENTER') submit()
    else setInput((v) => (v.length < 22 ? v + k : v))
  }
  const onKeyRef = useRef(onKey); onKeyRef.current = onKey
  useEffect(() => {
    const h = (e: KeyboardEvent) => { const k = physicalKey(e); if (!k || k === 'ESC') return; e.preventDefault(); onKeyRef.current(k) }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])

  // Display order: A→Z on the forward pass, Z→A on the reverse pass
  const order = dir === 1 ? LETTERS.map((_, i) => i) : LETTERS.map((_, i) => N - 1 - i)

  if (phase === 'intro') {
    return (
      <div className="screen alaz-intro">
        <Header title="A la Z" onBack={() => setConfirm(true)} />
        <div className="alaz-intro-body">
          <AlazLogo />
          <p className="alaz-intro-txt">25 letras · ida A→Z y vuelta Z→A.<br />La letra aparece revelada en su sitio dentro de la palabra.</p>
          <button className="btn-blue" onClick={() => setPhase('play')}>EMPEZAR</button>
        </div>
        {confirm && <ConfirmExit onYes={onExit} onNo={() => setConfirm(false)} />}
      </div>
    )
  }

  return (
    <div className={`screen alaz ${flash ? 'flash-' + flash : ''}`}>
      <Header title="A la Z" onBack={() => setConfirm(true)}
        right={<button className="icon-btn sq" onClick={() => setPaused(true)} aria-label="Opciones"><span className="alaz-mini-ico">A<span>la</span>Z</span></button>} />
      <div className="alaz-mid">
        <div className="alaz-hud">
          <span className="alaz-hits">{hits}</span>
          <span className="alaz-timer">{Math.round(left)}</span>
        </div>
        <div className={`alaz-def ${flash}`}>{entry.def.toUpperCase()}</div>
        <div className="alaz-pattern">{reveal || pattern}</div>
        <div className="alaz-track-wrap">
          <div className="alaz-track" ref={trackRef}>
            {order.map((i) => {
              const L = LETTERS[i]
              const st = status[i]
              let cls = 'alaz-tile'
              if (st === 'correct') cls += ' ok'
              else if (st === 'wrong') cls += ' bad'
              else if (st === 'passed') cls += ' passed'
              if (i === cur && phase !== 'done') cls += ' cur'
              return (
                <button key={L} ref={(el) => { tileRefs.current[i] = el }} className={cls} tabIndex={-1} aria-label={L}>
                  <span>{L}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="alaz-dir">{dir === 1 ? 'IDA A → Z' : 'VUELTA Z → A'}</div>
      </div>
      <button className="btn-pasapalabra alaz-pasa" onClick={pasapalabra} disabled={phase !== 'play'}>PASAPALABRA</button>
      <AnswerBar value={input} onClear={() => setInput('')} onSend={submit} disabled={phase !== 'play'} />
      <Keyboard onKey={onKey} disabled={phase !== 'play'} />
      {paused && <QuickSettings onClose={() => setPaused(false)} onExit={onExit} />}
      {confirm && <ConfirmExit onYes={onExit} onNo={() => setConfirm(false)} />}
      {result && <Results result={result} onContinue={() => onDone(result)} continueLabel={continueLabel} />}
    </div>
  )
}
