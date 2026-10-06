import { useEffect, useState } from 'react'
import type { GameResult } from '../types'
import { Silla } from './Silla'
import { UnaDeCuatro } from './UnaDeCuatro'
import { Sopa } from './Sopa'
import { Donde } from './Donde'
import { Rosco } from './Rosco'
import { Home, Grid9, DotsRing } from '../components/Icons'
import { ConfirmExit } from '../components/QuickSettings'
import { setBgPlain } from '../components/bgCenter'
import { dondeBoards, randomRosco, sillaSession, sopaSession, udcSession } from '../data'
import { useProfile } from '../store'
import { fmtClock } from '../utils'

/** Base time for El Rosco in the PROGRAMA TV flow; every earlier prueba adds seconds on top. */
export const ROSCO_BASE = 80

export const PRUEBAS = [
  { id: 'silla', label: 'LA SILLA AZUL' },
  { id: 'udc', label: 'UNA DE CUATRO' },
  { id: 'sopa', label: 'SOPA DE LETRAS' },
  { id: 'donde', label: '¿DÓNDE ESTÁN?' },
  { id: 'rosco', label: 'EL ROSCO' }
] as const

/** Seconds a prueba adds to El Rosco. */
export function secondsEarned(r: GameResult, totalTime?: number): number {
  if (r.seconds !== undefined) return r.seconds
  const left = totalTime !== undefined ? Math.max(0, totalTime - r.timeUsed) : 0
  if (r.mode === 'silla') return 5 + r.hits * 4
  if (r.mode === 'udc') return r.hits * 3 + Math.floor(left / 5)
  return Math.floor(left)
}

function ListIcon({ id }: { id: (typeof PRUEBAS)[number]['id'] }) {
  return (
    <span className="lc-icon">
      {id === 'silla' && <svg viewBox="0 0 32 32" fill="currentColor"><circle cx="11" cy="16" r="4.2" /><circle cx="21" cy="16" r="4.2" /></svg>}
      {id === 'udc' && <svg viewBox="0 0 32 32" fill="currentColor"><circle cx="10.5" cy="10.5" r="3.6" /><circle cx="21.5" cy="10.5" r="3.6" /><circle cx="10.5" cy="21.5" r="3.6" /><circle cx="21.5" cy="21.5" r="3.6" /></svg>}
      {id === 'sopa' && <Grid9 size="70%" />}
      {id === 'donde' && <DotsRing size="68%" />}
      {id === 'rosco' && <svg viewBox="0 0 32 32" fill="currentColor">
        {Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * Math.PI * 2; return <circle key={i} cx={16 + Math.cos(a) * 11} cy={16 + Math.sin(a) * 11} r="1.9" /> })}
        <circle cx="16" cy="13.4" r="2.8" /><path d="M10.8 21.6c.6-3 2.7-4.6 5.2-4.6s4.6 1.6 5.2 4.6z" />
      </svg>}
    </span>
  )
}

/**
 * PROGRAMA TV / Partida completa: "lista de pruebas" (ref 09) — 5 pruebas unlocked in order.
 * Each prueba earns seconds that are added to the starting time of El Rosco.
 */
export function ProgramaFlow({ onExit, onFinish, debugTime, demo = 0 }: { onExit: () => void; onFinish: (total: number, results: GameResult[]) => void; debugTime?: number; demo?: number }) {
  const p = useProfile()
  // `demo` pre-fills N finished pruebas (only used for screenshots via ?s=lista&demo=N)
  const [results, setResults] = useState<GameResult[]>(() => PRUEBAS.slice(0, demo).map((t, i) => ({
    mode: t.id === 'rosco' ? 'tv' : t.id, title: t.label, timeUsed: 40, hits: [4, 8, 9, 7, 18][i], fails: 1, score: 50, items: [], shareText: ''
  })))
  const [secs, setSecs] = useState<number[]>(() => [21, 49, 30, 26, 12].slice(0, demo))
  const [playing, setPlaying] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [data] = useState(() => ({ silla: sillaSession(8), udc: udcSession(10), sopa: sopaSession(8), donde: dondeBoards(6), rosco: randomRosco() }))
  const stage = results.length
  const earned = secs.slice(0, 4).reduce((s, x) => s + x, 0)
  const roscoTime = debugTime ?? ROSCO_BASE + earned
  const finished = stage >= 5

  useEffect(() => { setBgPlain(!playing); return () => setBgPlain(false) }, [playing])

  const done = (total?: number) => (r: GameResult) => {
    setResults([...results, r])
    setSecs([...secs, stage === 4 ? Math.max(0, Math.round(roscoTime - r.timeUsed)) : secondsEarned(r, total)])
    setPlaying(false)
  }

  if (playing) {
    const label = stage < 4 ? 'VOLVER A LA LISTA' : 'VER RESULTADO FINAL'
    switch (PRUEBAS[stage].id) {
      case 'silla': return <Silla entries={data.silla} onExit={onExit} onDone={done()} continueLabel={label} />
      case 'udc': return <UnaDeCuatro questions={data.udc} time={60} onExit={onExit} onDone={done(60)} continueLabel={label} />
      case 'sopa': return <Sopa puzzles={data.sopa} time={90} onExit={onExit} onDone={done(90)} continueLabel={label} />
      case 'donde': return <Donde boards={data.donde} time={90} onExit={onExit} onDone={done(90)} continueLabel={label} />
      case 'rosco': return <Rosco players={[{ name: p.name, bank: data.rosco }]} mode="tv" time={roscoTime} onExit={onExit} onDone={done()} continueLabel={label} title="EL ROSCO COMPLETADO" />
    }
  }

  const total = results.reduce((s, r) => s + r.score, 0)
  const totalHits = results.reduce((s, r) => s + r.hits, 0)
  return (
    <div className="screen lista">
      <div className="lista-top">
        <button className="home-btn" onClick={() => (stage > 0 && !finished ? setConfirm(true) : onExit())} aria-label="Inicio"><Home size="54%" /></button>
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
        {finished && (
          <div className="lista-final">
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
