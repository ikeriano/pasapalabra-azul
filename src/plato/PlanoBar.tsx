import type { Plano } from './world'

export function PlanoBar({
  planos, activeId, onPick, onLibre
}: {
  planos: Plano[]
  activeId: string | null
  onPick: (p: Plano) => void
  onLibre: () => void
}) {
  return (
    <div className="plano-bar" aria-label="Planos de cámara">
      <button type="button" className={`plano-thumb libre ${activeId === null ? 'on' : ''}`} onClick={onLibre}>
        <span className="plano-ico">🧍</span>
        <span className="plano-lbl">Libre</span>
      </button>
      {planos.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`plano-thumb ${activeId === p.id ? 'on' : ''}`}
          style={{ ['--accent' as string]: p.accent }}
          onClick={() => onPick(p)}
        >
          <span className="plano-swatch" style={{ background: p.accent }} />
          <span className="plano-lbl">{p.label}</span>
        </button>
      ))}
    </div>
  )
}
