import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameResult, LetterStatus, Mode, RoscoBank } from '../types'
import { Header } from '../components/Header'
import { Bubble } from '../components/Bubble'
import { Keyboard, physicalKey } from '../components/Keyboard'
import { AnswerBar } from '../components/AnswerBar'
import { PersonDots } from '../components/Icons'
import { Results } from '../components/Results'
import { ConfirmExit, QuickSettings } from '../components/QuickSettings'
import { Modal } from '../components/Modal'
import { useSize } from '../components/useSize'
import { setBgCenter, trackCenter } from '../components/bgCenter'
import { audio } from '../audio'
import { store } from '../store'
import { fmtClock, fmtTime, isCorrect } from '../utils'

type St = Exclude<LetterStatus, 'current'>
interface PState { name: string; bank: RoscoBank; status: St[]; cur: number; time: number; hits: number; fails: number; done: boolean }
type Phase = 'play' | 'reveal' | 'switch' | 'done'

const N = 25
function nextIdx(status: St[], from: number): number {
  for (let k = 1; k <= N; k++) {
    const i = (from + k) % N
    if (status[i] === 'pending' || status[i] === 'passed') return i
  }
  return -1
}

export interface RoscoProps {
  players: { name: string; bank: RoscoBank }[]
  mode: Mode
  time?: number
  title?: string
  continueLabel?: string
  onExit: () => void
  onDone: (r: GameResult) => void
}

export function Rosco({ players: init, mode, time = 150, title = 'EL ROSCO COMPLETADO', continueLabel, onExit, onDone }: RoscoProps) {
  const duel = init.length > 1
  const [ps, setPs] = useState<PState[]>(() =>
    init.map((p) => ({ name: p.name, bank: p.bank, status: Array(N).fill('pending'), cur: 0, time, hits: 0, fails: 0, done: false }))
  )
  const [active, setActive] = useState(0)
  const [phase, setPhase] = useState<Phase>(duel ? 'switch' : 'play')
  const [input, setInput] = useState('')
  const [reveal, setReveal] = useState<string>('')
  const [paused, setPaused] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState<GameResult | null>(null)
  const [areaRef, area] = useSize<HTMLDivElement>()
  const [flash, setFlash] = useState<'ok' | 'bad' | ''>('')

  const psRef = useRef(ps)
  psRef.current = ps
  const p = ps[active]
  const entry = p.bank.entries[p.cur]

  const finish = useCallback((list: PState[]) => {
    setPhase('done')
    if (duel) {
      const [a, b] = list
      let winner: number | null = null
      if (a.hits !== b.hits) winner = a.hits > b.hits ? 0 : 1
      else if (a.fails !== b.fails) winner = a.fails < b.fails ? 0 : 1
      setResult({
        mode, title: 'DUELO TERMINADO', timeUsed: 0, hits: Math.max(a.hits, b.hits), fails: 0, score: 0, items: [],
        shareText: `Pasapalabra · Duelo\n${a.name}: ✅${a.hits} ❌${a.fails}\n${b.name}: ✅${b.hits} ❌${b.fails}\n${winner === null ? '¡Empate!' : '¡Gana ' + list[winner].name + '!'}`,
        duel: { names: [a.name, b.name], hits: [a.hits, b.hits], fails: [a.fails, b.fails], winner }
      })
      return
    }
    const s = list[0]
    const completed = s.status.every((x) => x === 'correct' || x === 'wrong')
    const score = Math.max(0, s.hits * 10 - s.fails * 3 + (completed ? Math.floor(s.time / 5) : 0))
    const items = s.bank.entries.map((e, i) => ({
      letter: e.letter,
      heading: `${e.type === 'empieza' ? 'EMPIEZA POR' : 'CONTIENE LA'} ${e.letter}`,
      def: e.def,
      answer: e.answer[0].toUpperCase(),
      status: s.status[i] === 'correct' ? 'correct' as const : s.status[i] === 'wrong' ? 'wrong' as const : 'unanswered' as const
    }))
    const grid = s.status.map((x) => (x === 'correct' ? '🟢' : x === 'wrong' ? '🔴' : '🔵'))
    const shareText = `Pasapalabra · ${mode === 'diario' ? 'Rosco diario' : 'El Rosco'}\n✅ ${s.hits}  ❌ ${s.fails}  ⏱ ${fmtClock(time - s.time)}\nPuntuación: ${score}\n${grid.slice(0, 13).join('')}\n${grid.slice(13).join('')}`
    setResult({ mode, title, timeUsed: time - s.time, hits: s.hits, fails: s.fails, score, items, shareText })
  }, [duel, mode, time, title])

  /** After a turn-ending event: decide next player / finish. */
  const afterTurn = useCallback((list: PState[], switchTurn: boolean) => {
    const others = list.map((x, i) => ({ x, i })).filter(({ x, i }) => i !== active && !x.done)
    if (list.every((x) => x.done)) return finish(list)
    if (list[active].done || (duel && switchTurn && others.length)) {
      if (others.length) {
        setActive(others[0].i)
        setPhase('switch')
        return
      }
    }
    setPhase('play')
  }, [active, duel, finish])

  const update = (fn: (s: PState) => PState) => {
    const list = psRef.current.map((s, i) => (i === active ? fn(s) : s))
    psRef.current = list
    setPs(list)
    return list
  }

  const submit = () => {
    if (phase !== 'play' || paused || confirm) return
    if (!input.trim()) return
    const ok = isCorrect(input, entry.answer)
    setInput('')
    if (ok) {
      audio.playAcierto() // ONLY on a correct answer
      store.addHit(1)
      setFlash('ok'); setTimeout(() => setFlash(''), 350)
      const list = update((s) => {
        const status = s.status.slice(); status[s.cur] = 'correct'
        const n = nextIdx(status, s.cur)
        return { ...s, status, hits: s.hits + 1, cur: n < 0 ? s.cur : n, done: n < 0 }
      })
      afterTurn(list, false)
    } else {
      audio.playFallo() // ONLY on a wrong answer
      setFlash('bad'); setTimeout(() => setFlash(''), 350)
      update((s) => { const status = s.status.slice(); status[s.cur] = 'wrong'; return { ...s, status, fails: s.fails + 1 } })
      setReveal(entry.answer[0].toUpperCase())
      setPhase('reveal')
    }
  }

  // After revealing the right answer, move on
  useEffect(() => {
    if (phase !== 'reveal') return
    const t = setTimeout(() => {
      const list = update((s) => { const n = nextIdx(s.status, s.cur); return { ...s, cur: n < 0 ? s.cur : n, done: n < 0 || s.time <= 0 } })
      setReveal('')
      afterTurn(list, true)
    }, 1700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const pasapalabra = () => {
    if (phase !== 'play' || paused || confirm) return
    // PASAPALABRA: intentionally NO sound.
    setInput('')
    const list = update((s) => {
      const status = s.status.slice(); status[s.cur] = 'passed'
      const n = nextIdx(status, s.cur)
      return { ...s, status, cur: n < 0 ? s.cur : n }
    })
    afterTurn(list, true)
  }

  // Countdown
  useEffect(() => {
    if (phase !== 'play' || paused || confirm) return
    let last = performance.now()
    const id = setInterval(() => {
      if (document.hidden) { last = performance.now(); return }
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      const cur = psRef.current[active]
      const t = Math.max(0, cur.time - dt)
      const list = psRef.current.map((s, i) => (i === active ? { ...s, time: t, done: t <= 0 ? true : s.done } : s))
      psRef.current = list
      setPs(list)
      if (t <= 0) { clearInterval(id); setInput(''); afterTurn(list, true) }
    }, 200)
    return () => clearInterval(id)
  }, [phase, paused, confirm, active, afterTurn])

  const onKey = (k: string) => {
    if (phase !== 'play' || paused || confirm) return
    if (k === 'BACK') setInput((v) => v.slice(0, -1))
    else if (k === 'SPACE') setInput((v) => (v && !v.endsWith(' ') && v.length < 22 ? v + ' ' : v))
    else if (k === 'ENTER') submit()
    else setInput((v) => (v.length < 22 ? v + k : v))
  }
  const onKeyRef = useRef(onKey)
  onKeyRef.current = onKey
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const k = physicalKey(e)
      if (!k) return
      e.preventDefault()
      if (k === 'ESC') return
      onKeyRef.current(k)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const S = Math.max(0, Math.min(area.w, area.h))
  const ringRef = useRef<HTMLDivElement>(null)
  useEffect(() => { trackCenter(ringRef.current) }, [S])
  useEffect(() => () => setBgCenter(null), [])
  const b = S * 0.107
  const R = S / 2 - b / 2 - S * 0.004

  return (
    <div className={`screen rosco ${flash ? 'flash-' + flash : ''}`}>
      <Header
        title="El Rosco"
        onBack={() => setConfirm(true)}
        sub={duel ? <span className="turn-pill">TURNO: {p.name}</span> : undefined}
        right={<button className="icon-btn" onClick={() => setPaused(true)} aria-label="Opciones"><PersonDots size="82%" /></button>}
      />
      <div className="ring-area" ref={areaRef}>
        {S > 0 && (
          <div className="ring" ref={ringRef} style={{ width: S, height: S, ['--s' as string]: `${S}px` }}>
            {p.bank.entries.map((e, i) => {
              const a = (i / N) * Math.PI * 2 - Math.PI / 2
              const st = p.status[i]
              const kind = st === 'correct' ? 'correct' : st === 'wrong' ? 'wrong' : i === p.cur && phase !== 'done' ? 'current' : 'pending'
              return (
                <Bubble key={e.letter} letter={e.letter} kind={kind}
                  style={{ width: b, height: b, left: S / 2 + Math.cos(a) * R - b / 2, top: S / 2 + Math.sin(a) * R - b / 2, fontSize: b * 0.6 }} />
              )
            })}
            <div className="ring-center">
              {phase === 'reveal' ? (
                <>
                  <div className="rc-head">LA RESPUESTA ERA</div>
                  <div className="rc-reveal">{reveal}</div>
                </>
              ) : (
                <>
                  <div className="rc-head">{entry.type === 'empieza' ? 'EMPIEZA POR' : 'CONTIENE LA'} {entry.letter}</div>
                  <div className="rc-def">{entry.def.toUpperCase()}</div>
                  <button className="btn-pasapalabra" onClick={pasapalabra} disabled={phase !== 'play'}>PASAPALABRA</button>
                </>
              )}
            </div>
            <div className="timer-bubble"><span>{fmtTime(p.time)}</span></div>
            <div className="counters">
              <span className="cnt red">{p.fails}</span>
              <span className="cnt green">{p.hits}</span>
            </div>
          </div>
        )}
      </div>
      <div className="bottom">
        <AnswerBar value={input} onClear={() => setInput('')} onSend={submit} disabled={phase !== 'play'} />
        <Keyboard onKey={onKey} disabled={phase !== 'play'} />
      </div>

      {phase === 'switch' && !result && (
        <Modal title="DUELO">
          <div className="turn-big">Turno de</div>
          <div className="turn-name">{p.name}</div>
          <p className="panel-text">Tiempo restante: {fmtClock(p.time)} · Aciertos: {p.hits}</p>
          <button className="btn-blue" onClick={() => setPhase('play')}>EMPEZAR</button>
        </Modal>
      )}
      {paused && <QuickSettings onClose={() => setPaused(false)} onExit={onExit} />}
      {confirm && <ConfirmExit onYes={onExit} onNo={() => setConfirm(false)} />}
      {result && <Results result={result} onContinue={() => onDone(result)} continueLabel={continueLabel} showShare={true} />}
    </div>
  )
}
