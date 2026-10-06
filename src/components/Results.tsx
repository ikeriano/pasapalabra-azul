import { useMemo, useState } from 'react'
import type { GameResult, ResultItem } from '../types'
import { fmtClock } from '../utils'
import { Bubble } from './Bubble'
import { Medal, RoscoIcon, Share } from './Icons'

type Tab = ResultItem['status']
const TABS: { id: Tab; label: string }[] = [
  { id: 'correct', label: 'ACIERTOS' },
  { id: 'unanswered', label: 'SIN CONTESTAR' },
  { id: 'wrong', label: 'FALLOS' }
]

export function Results({ result, onContinue, continueLabel = 'CONTINUAR', showShare = true }: { result: GameResult; onContinue: () => void; continueLabel?: string; showShare?: boolean }) {
  const lists = useMemo(() => ({
    correct: result.items.filter((i) => i.status === 'correct'),
    unanswered: result.items.filter((i) => i.status === 'unanswered'),
    wrong: result.items.filter((i) => i.status === 'wrong')
  }), [result])
  const first: Tab = lists.correct.length ? 'correct' : lists.wrong.length ? 'wrong' : 'unanswered'
  const [tab, setTab] = useState<Tab>(first)
  const [idx, setIdx] = useState(0)
  const [toast, setToast] = useState('')
  const list = lists[tab]
  const item = list[Math.min(idx, list.length - 1)]
  const go = (d: number) => list.length && setIdx((i) => (i + d + list.length) % list.length)

  const share = async () => {
    const text = result.shareText
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Pasapalabra', text })
        return
      }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(text)
      setToast('¡Copiado al portapapeles!')
    } catch {
      setToast('No se pudo compartir')
    }
    setTimeout(() => setToast(''), 1800)
  }

  const kind = tab === 'correct' ? 'correct' : tab === 'wrong' ? 'wrong' : 'pending'
  return (
    <div className="modal-dim">
      <div className="res-wrap">
        <div className="res-card">
          <div className="res-badge"><RoscoIcon size="74%" /></div>
          <div className="ribbon">
            <span className="ribbon-end l" />
            <span className="ribbon-end r" />
            <div className="ribbon-body">{result.title}</div>
          </div>
          {result.duel ? (
            <div className="res-duel">
              {[0, 1].map((p) => (
                <div key={p} className={`duel-col ${result.duel!.winner === p ? 'win' : ''}`}>
                  <div className="duel-name">{result.duel!.names[p]}</div>
                  <div className="duel-nums">
                    <span className="res-circle green sm">{result.duel!.hits[p]}</span>
                    <span className="res-circle red sm">{result.duel!.fails[p]}</span>
                  </div>
                  {result.duel!.winner === p && <div className="duel-crown">¡GANA!</div>}
                </div>
              ))}
              {result.duel.winner === null && <div className="duel-tie">¡EMPATE!</div>}
            </div>
          ) : (
            <>
              <div className="res-stats">
                <div className="res-stat"><div className="res-lbl t">Tiempo</div><div className="res-circle time">{fmtClock(result.timeUsed)}</div></div>
                <div className="res-stat"><div className="res-lbl g">Aciertos</div><div className="res-circle green">{result.hits}</div></div>
                <div className="res-stat"><div className="res-lbl r">Fallos</div><div className="res-circle red">{result.fails}</div></div>
              </div>
              <div className="res-score">
                <div className="res-score-lbl">PUNTUACIÓN</div>
                <div className="res-score-val"><Medal size="1.25em" /> {result.score}</div>
              </div>
            </>
          )}
          {result.items.length > 0 && (
            <div className="res-carousel">
              <div className="res-tabs">
                {TABS.map((t) => (
                  <button key={t.id} className={`res-tab ${t.id} ${tab === t.id ? 'on' : ''}`} onClick={() => { setTab(t.id); setIdx(0) }}>
                    {t.label}
                  </button>
                ))}
              </div>
              <button className="res-arrow l" onClick={() => go(-1)} aria-label="Anterior"><svg viewBox="0 0 20 24"><path d="M16 3L4 12l12 9z" /></svg></button>
              <button className="res-arrow r" onClick={() => go(1)} aria-label="Siguiente"><svg viewBox="0 0 20 24"><path d="M4 3l12 9-12 9z" /></svg></button>
              {item ? (
                <div className="res-item" key={tab + idx}>
                  {item.letter && <Bubble letter={item.letter} kind={kind} className="res-bubble" />}
                  <div className="res-heading">{item.heading}</div>
                  <div className="res-def">{item.def}</div>
                  <div className={`res-ans ${tab}`}>{item.answer}</div>
                  <div className="res-count">{Math.min(idx, list.length - 1) + 1}/{list.length}</div>
                </div>
              ) : (
                <div className="res-item empty">
                  <div className="res-def">{tab === 'correct' ? 'Sin aciertos esta vez.' : tab === 'wrong' ? '¡Ningún fallo! 👏' : 'Has contestado todas.'}</div>
                </div>
              )}
            </div>
          )}
          <button className="btn-blue res-continue" onClick={onContinue}>{continueLabel}</button>
        </div>
        {showShare && (
          <button className="share-pill" onClick={share}><Share size="1.15em" /> Compartir rosco</button>
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  )
}
