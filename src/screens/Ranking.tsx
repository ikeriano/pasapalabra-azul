import { useState } from 'react'
import { Header } from '../components/Header'
import { useProfile } from '../store'
import type { Mode } from '../types'

const TABS: { id: Mode; label: string }[] = [
  { id: 'rosco', label: 'EL ROSCO' },
  { id: 'diario', label: 'DIARIO' },
  { id: 'silla', label: 'SILLA AZUL' },
  { id: 'udc', label: 'UNA DE 4' },
  { id: 'sopa', label: 'SOPA' },
  { id: 'donde', label: '¿DÓNDE?' },
  { id: 'alaz', label: 'A LA Z' },
  { id: 'tv', label: 'PROGRAMA TV' }
]
export function Ranking({ onBack }: { onBack: () => void }) {
  const p = useProfile()
  const [tab, setTab] = useState<Mode>('rosco')
  const list = p.ranking[tab] ?? []
  return (
    <div className="screen ranking">
      <Header title="Ranking" onBack={onBack} backLabel="VOLVER" />
      <div className="scroll-col">
        <div className="chip-row">
          {TABS.map((t) => <button key={t.id} className={`chip ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>
        <section className="card rank-card">
          {list.length === 0 ? (
            <p className="muted center">Aún no hay puntuaciones. ¡Juega una partida!</p>
          ) : (
            <ol className="rank-list">
              {list.map((e, i) => (
                <li key={i} className={i < 3 ? 'top' + (i + 1) : ''}>
                  <span className="rk-pos">{i + 1}</span>
                  <span className="rk-name">{e.name}<small>{e.date} · ✅{e.hits} ❌{e.fails}</small></span>
                  <span className="rk-score">{e.score}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
