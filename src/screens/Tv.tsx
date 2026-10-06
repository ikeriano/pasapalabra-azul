import { useEffect, useState } from 'react'
import type { GameResult } from '../types'
import { Silla } from './Silla'
import { UnaDeCuatro } from './UnaDeCuatro'
import { Sopa } from './Sopa'
import { Donde } from './Donde'
import { Alaz } from './Alaz'
import { Rosco } from './Rosco'
import { Home, Grid9, DotsRing } from '../components/Icons'
import { ConfirmExit } from '../components/QuickSettings'
import { setBgPlain } from '../components/bgCenter'
import { BotePill } from '../components/BotePill'
import { dondeBoards, randomAlaz, randomRosco, sillaSession, sopaSession, udcSession } from '../data'
import { store, useProfile, type ProgramaOutcome } from '../store'
import { fmtClock, fmtEuro } from '../utils'

/** Base time for El Rosco in the PROGRAMA TV flow; every earlier prueba adds seconds on top. */
export const ROSCO_BASE = 80

export const PRUEBAS = [
  { id: 'silla', label: 'LA SILLA AZUL' },
  { id: 'udc', label: 'UNA DE CUATRO' },
  { id: 'sopa', label: 'SOPA DE LETRAS' },
  { id: 'donde', label: '¿DÓNDE ESTÁN?' },
  { id: 'alaz', label: 'A LA Z' },
  { id: 'rosco', label: 'EL ROSCO' }
] as const

/** Seconds a prueba adds to El Rosco. */
export function secondsEarned(r: GameResult, totalTime?: number): number {
  if (r.seconds !== undefined) return r.seconds
  const left = totalTime !== undefined ? Math.max(0, totalTime - r.timeUsed) : 0
  if (r.mode === 'silla') return 5 + r.hits * 4
  if (r.mode === 'udc') return r.hits * 3 + Math.floor(left / 5)
  if (r.mode === 'alaz' || r.mode === 'sopa' || r.mode === 'donde') return r.hits * 2 + Math.floor(left / 5)
  return Math.floor(left)
}

function ListIcon({ id }: { id: (typeof PRUEBAS)[number]['id'] }) {
  return (
    <span className="lc-icon">
      {id === 'silla' && <svg viewBox="0 0 32 32" fill="currentColor"><circle cx="11" cy="16" r="4.2" /><circle cx="21" cy="16" r="4.2" /></svg>}
      {id === 'udc' && <svg viewBox="0 0 32 32" fill="currentColor"><circle cx="10.5" cy="10.5" r="3.6" /><circle cx="21.5" cy="10.5" r="3.6" /><circle cx="10.5" cy="21.5" r="3.6" /><circle cx="21.5" cy="21.5" r="3.6" /></svg>}
      {id === 'sopa' && <Grid9 size="70%" />}
      {id === 'donde' && <DotsRing size="68%" />}
      {id === 'alaz' && <svg viewBox="0 0 32 32" fill="currentColor"><rect x="2" y="7" width="12" height="18" rx="2.5" opacity=".9"/><rect x="18" y="7" width="12" height="18" rx="2.5" opacity=".9"/><path d="M5.2 21 L8 10.5 L10.8 21 H9.4 L8.8 18.6 H6.2 L5.6 21z M6.6 17.2 H8.4 L7.5 13.6z" fill="#fff"/><path d="M20.4 10.5 H25.2 V12.2 H23.2 L25.4 21 H23.6 L21.6 13.4 H20.4z" fill="#fff"/></svg>}
      {id === 'rosco' && <svg viewBox="0 0 32 32" fill="currentColor">
        {Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * Math.PI * 2; return <circle key={i} cx={16 + Math.cos(a) * 11} cy={16 + Math.sin(a) * 11} r="1.9" /> })}
        <circle cx="16" cy="13.4" r="2.8" /><path d="M10.8 21.6c.6-3 2.7-4.6 5.2-4.6s4.6 1.6 5.2 4.6z" />
      </svg>}
    </span>
  )
}

function BoteWin({ amount, onContinue }: { amount: number; onContinue: () => void }) {
  return (
    <div className="bote-win" role="dialog" aria-label="Has ganado el bote">
      <div className="bote-win-card">
        <div className="bote-win-bubble">¡El Presentador: ¡ROSCO COMPLETO!</div>
        <div className="bote-win-title">¡BOTE!</div>
        <div className="bote-win-amt">{fmtEuro(amount)}</div>
        <div className="bote-win-coins">
          {Array.from({ length: 12 }).map((_, i) => <i key={i} style={{ ['--i' as string]: i }} />)}
        </div>
        <p className="bote-win-txt">Has completado las 25 letras.<br />¡Te llevas el bote del programa!</p>
        <button className="btn-blue" onClick={onContinue}>CONTINUAR</button>
      </div>
    </div>
  )
}

/**
 * PROGRAMA TV / Partida completa / NUEVO PROGRAMA — lista de pruebas with jackpot.
 * Every finished programa grows the bote by +6.000 € for the next show, unless the
 * player completes El Rosco with 25 aciertos and takes the current bote (then reset).
 */
export function ProgramaFlow({ onExit, onFinish, debugTime, demo = 0 }: { onExit: () => void; onFinish: (total: number, results: GameResult[]) => void; debugTime?: number; demo?: number }) {
  const p = useProfile()
  const [results, setResults] = useState<GameResult[]>(() => PRUEBAS.slice(0, demo).map((t, i) => ({
    mode: t.id === 'rosco' ? 'tv' : t.id, title: t.label, timeUsed: 40, hits: [4, 8, 9, 7, 14, demo >= 6 ? 25 : 18][i], fails: 1, score: 50, items: [], shareText: ''
  })))
  const [secs, setSecs] = useState<number[]>(() => [21, 49, 30, 26, 28, 12].slice(0, demo))
  const [playing, setPlaying] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [outcome, setOutcome] = useState<ProgramaOutcome | null>(null)
  const [showWin, setShowWin] = useState(false)
  const [boteAtStart] = useState(p.bote)
  const [progAtStart] = useState(p.programNumber)
  const [data] = useState(() => ({ silla: sillaSession(8), udc: udcSession(10), sopa: sopaSession(8), donde: dondeBoards(6), alaz: randomAlaz(), rosco: randomRosco() }))
  const stage = results.length
  const earned = secs.filter((_, i) => PRUEBAS[i].id !== 'rosco').reduce((s, x) => s + x, 0)
  const roscoTime = debugTime ?? ROSCO_BASE + earned
  const finished = stage >= PRUEBAS.length

  useEffect(() => { setBgPlain(!playing && !showWin); return () => setBgPlain(false) }, [playing, showWin])

  // Settle the jackpot exactly once when the chain finishes
  useEffect(() => {
    if (!finished || outcome) return
    const rosco = results[results.length - 1]
    const o = store.finishPrograma(rosco?.hits ?? 0)
    setOutcome(o)
    if (o.won) setShowWin(true)
  }, [finished, outcome, results])

  const done = (total?: number) => (r: GameResult) => {
    setResults([...results, r])
    setSecs([...secs, PRUEBAS[stage].id === 'rosco' ? Math.max(0, Math.round(roscoTime - r.timeUsed)) : secondsEarned(r, total)])
    setPlaying(false)
  }

  if (showWin && outcome) {
    return <BoteWin amount={outcome.amount} onContinue={() => setShowWin(false)} />
  }

  if (playing) {
    const label = stage < PRUEBAS.length - 1 ? 'VOLVER A LA LISTA' : 'VER RESULTADO FINAL'
    switch (PRUEBAS[stage].id) {
      case 'silla': return <Silla entries={data.silla} onExit={onExit} onDone={done()} continueLabel={label} />
      case 'udc': return <UnaDeCuatro questions={data.udc} time={60} onExit={onExit} onDone={done(60)} continueLabel={label} />
      case 'sopa': return <Sopa puzzles={data.sopa} time={90} onExit={onExit} onDone={done(90)} continueLabel={label} />
      case 'donde': return <Donde boards={data.donde} time={90} onExit={onExit} onDone={done(90)} continueLabel={label} />
      case 'alaz': return <Alaz bank={data.alaz} time={90} onExit={onExit} onDone={done(90)} continueLabel={label} earnedSeconds={earned} />
      case 'rosco': return <Rosco players={[{ name: p.name, bank: data.rosco }]} mode="tv" time={roscoTime} onExit={onExit} onDone={done()} continueLabel={label} title="EL ROSCO COMPLETADO" />
    }
  }

  const total = results.reduce((s, r) => s + r.score, 0)
  const totalHits = results.reduce((s, r) => s + r.hits, 0)
  return (
    <div className="screen lista">
      <div className="lista-top">
        <button className="home-btn" onClick={() => (stage > 0 && !finished ? setConfirm(true) : onExit())} aria-label="Inicio"><Home size="54%" /></button>
        <BotePill amount={finished && outcome ? outcome.nextBote : boteAtStart} program={progAtStart} />
      </div>
      <div className={`lista-col ${finished ? 'fin' : ''}`}>
        {PRUEBAS.map((t, i) => {
          const state = i < stage ? 'done' : i === stage ? 'next' : 'locked'
          const isRosco = t.id === 'rosco'
          return (
            <div key={t.id} className={isRosco ? 'lc-gap-wrap' : undefined}>
              <button className={`lcard ${state}`} disabled={state !== 'next'} onClick={() => setPlaying(true)}>
                <ListIcon id={t.id} />
                <span className="lc-title">
                  <b>{t.label}</b>
                  {state === 'next' && <small>{isRosco ? `Empiezas con ${fmtClock(roscoTime)} · Presiona para empezar` : 'Presiona para empezar'}</small>}
                </span>
                {state === 'done' && <span className="lc-nums"><b>{secs[i]}</b><b>{results[i].hits}</b></span>}
                {isRosco && state !== 'done' && stage > 0 && <span className="lc-nums"><b>{roscoTime}</b><b>{totalHits}</b></span>}
              </button>
            </div>
          )
        })}
        {finished && outcome && (
          <div className="lista-final">
            {outcome.won ? (
              <div className="lf-row win"><span>¡BOTE GANADO!</span><b>{fmtEuro(outcome.amount)}</b></div>
            ) : (
              <div className="lf-row small"><span>Próximo bote</span><b>{fmtEuro(outcome.nextBote)}</b></div>
            )}
            <div className="lf-row"><span>PUNTUACIÓN TOTAL</span><b>{total}</b></div>
            <div className="lf-row small"><span>ACIERTOS</span><b>{totalHits}</b></div>
            <button className="btn-blue" onClick={() => onFinish(total, results)}>TERMINAR</button>
          </div>
        )}
      </div>
      {confirm && <ConfirmExit onYes={onExit} onNo={() => setConfirm(false)} />}
    </div>
  )
}
