import { useEffect, useRef, useState } from 'react'
import type { GameResult, SillaEntry } from '../types'
import { Header } from '../components/Header'
import { Bubble } from '../components/Bubble'
import { Keyboard, physicalKey } from '../components/Keyboard'
import { AnswerBar } from '../components/AnswerBar'
import { Glasses } from '../components/Icons'
import { Results } from '../components/Results'
import { ConfirmExit, QuickSettings } from '../components/QuickSettings'
import { audio } from '../audio'
import { store } from '../store'
import { isCorrect } from '../utils'

const CHAIN = 3
type Phase = 'play' | 'reveal' | 'done'

export function Silla({ entries, onExit, onDone, continueLabel }: { entries: SillaEntry[]; onExit: () => void; onDone: (r: GameResult) => void; continueLabel?: string }) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<('pending' | 'correct' | 'wrong')[]>(() => entries.map(() => 'pending'))
  const [hits, setHits] = useState(0)
  const [fails, setFails] = useState(0)
  const [chain, setChain] = useState(0)
  const [bonus, setBonus] = useState(0)
  const [phase, setPhase] = useState<Phase>('play')
  const [msg, setMsg] = useState('')
  const [paused, setPaused] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState<GameResult | null>(null)
  const [cardFx, setCardFx] = useState<'' | 'ok' | 'bad'>('')
  const start = useRef(performance.now())
  const pausedAt = useRef(0)
  const pausedTotal = useRef(0)
  const e = entries[Math.min(idx, entries.length - 1)]

  useEffect(() => {
    if (paused || confirm) pausedAt.current = performance.now()
    else if (pausedAt.current) { pausedTotal.current += performance.now() - pausedAt.current; pausedAt.current = 0 }
  }, [paused, confirm])

  const finish = (st: typeof status, h: number, f: number, bn: number) => {
    setPhase('done')
    const timeUsed = (performance.now() - start.current - pausedTotal.current) / 1000
    const score = Math.max(0, h * 10 - f * 2 + bn)
    const items = entries.map((x, i) => ({
      letter: x.letter, heading: `EMPIEZA POR ${x.letter}`, def: x.def, answer: x.answer[0].toUpperCase(),
      status: st[i] === 'correct' ? 'correct' as const : st[i] === 'wrong' ? 'wrong' as const : 'unanswered' as const
    }))
    setResult({
      mode: 'silla', title: 'LA SILLA AZUL COMPLETADA', timeUsed, hits: h, fails: f, score, items,
      shareText: `Pasapalabra · La Silla Azul\n✅ ${h}  ❌ ${f}\nPuntuación: ${score}\n${st.map((s) => (s === 'correct' ? '🟢' : s === 'wrong' ? '🔴' : '⚪')).join('')}`
    })
  }

  const advance = (st: typeof status, h: number, f: number, bn: number) => {
    if (idx + 1 >= entries.length) finish(st, h, f, bn)
    else { setIdx(idx + 1); setPhase('play') }
  }

  const submit = () => {
    if (phase !== 'play' || paused || confirm || !input.trim()) return
    const ok = isCorrect(input, e.answer)
    setInput('')
    const st = status.slice()
    if (ok) {
      audio.playAcierto() // ONLY on a correct answer
      store.addHit(1)
      st[idx] = 'correct'
      const h = hits + 1
      let c = chain + 1
      let bn = bonus
      if (c >= CHAIN) {
        bn += 5
        store.addCoins(3)
        setMsg('¡CADENA COMPLETA! +3 🪙')
        setTimeout(() => setMsg(''), 1400)
      }
      setStatus(st); setHits(h); setChain(c); setBonus(bn)
      setCardFx('ok'); setTimeout(() => setCardFx(''), 450)
      if (c >= CHAIN) setTimeout(() => setChain(0), 700)
      advance(st, h, fails, bn)
    } else {
      audio.playFallo() // ONLY on a wrong answer
      st[idx] = 'wrong'
      setStatus(st); setFails(fails + 1); setChain(0)
      setCardFx('bad'); setTimeout(() => setCardFx(''), 450)
      setPhase('reveal')
    }
  }

  useEffect(() => {
    if (phase !== 'reveal') return
    const t = setTimeout(() => advance(status, hits, fails, bonus), 1700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const onKey = (k: string) => {
    if (phase !== 'play' || paused || confirm) return
    if (k === 'BACK') setInput((v) => v.slice(0, -1))
    else if (k === 'SPACE') setInput((v) => (v && !v.endsWith(' ') ? v + ' ' : v))
    else if (k === 'ENTER') submit()
    else setInput((v) => (v.length < 22 ? v + k : v))
  }
  const ref = useRef(onKey); ref.current = onKey
  useEffect(() => {
    const h = (ev: KeyboardEvent) => { const k = physicalKey(ev); if (!k || k === 'ESC') return; ev.preventDefault(); ref.current(k) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <div className="screen silla">
      <Header title="LA SILLA AZUL" onBack={() => setConfirm(true)}
        right={<button className="icon-btn sq" onClick={() => setPaused(true)} aria-label="Opciones"><Glasses size="80%" /></button>} />
      <div className="silla-mid">
        <div className="silla-count">{Math.min(idx + 1, entries.length)}/{entries.length}</div>
        <div className={`q-card ${cardFx}`}>
          {phase === 'reveal' ? (
            <div className="q-text"><small>LA RESPUESTA ERA</small><br />{e.answer[0].toUpperCase()}</div>
          ) : (
            <div className="q-text">{e.def.toUpperCase()}</div>
          )}
        </div>
        <div className="chain-row">
          <div className="chain">
            <Bubble letter={e.letter} kind="white" className="chain-letter" />
            {Array.from({ length: CHAIN - 1 }).map((_, i) => (
              <span key={i} className={`chain-slot ${chain > i ? 'on' : ''}`} />
            ))}
            <span className={`chain-slot ${chain >= CHAIN ? 'on' : ''}`} />
          </div>
          <span className="cnt green big">{hits}</span>
        </div>
        {msg && <div className="float-msg">{msg}</div>}
      </div>
      <div className="bottom">
        <AnswerBar value={input} onClear={() => setInput('')} onSend={submit} disabled={phase !== 'play'} />
        <Keyboard onKey={onKey} disabled={phase !== 'play'} />
      </div>
      {paused && <QuickSettings onClose={() => setPaused(false)} onExit={onExit} />}
      {confirm && <ConfirmExit onYes={onExit} onNo={() => setConfirm(false)} />}
      {result && <Results result={result} onContinue={() => onDone(result)} continueLabel={continueLabel} />}
    </div>
  )
}
