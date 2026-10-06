import type { ReactNode } from 'react'
import { BackTri } from './Icons'

export function Header({ title, onBack, right, backLabel = 'SALIR', sub }: { title: ReactNode; onBack?: () => void; right?: ReactNode; backLabel?: string; sub?: ReactNode }) {
  return (
    <header className="hdr">
      <div className="hdr-side">
        {onBack && (
          <button className="back-btn" onClick={onBack} aria-label={backLabel}>
            <span className="back-circle"><BackTri size="58%" style={{ marginLeft: '-8%' }} /></span>
            <span className="back-label">{backLabel}</span>
          </button>
        )}
      </div>
      <div className="hdr-title">
        <h1>{title}</h1>
        {sub && <div className="hdr-sub">{sub}</div>}
      </div>
      <div className="hdr-side right">{right}</div>
    </header>
  )
}
