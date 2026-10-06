import { SET_ORDER, SETS, type SetId } from './world'

const ACCENT: Record<SetId, string> = {
  pasapalabra: '#3a9dff',
  rueda: '#ff8a2a',
  ahora: '#ffcc00',
  cocina: '#1a6adf',
  abismo: '#7aa0ff',
  boom: '#ff6a1a'
}

export function TravelPicker({
  current, onPick, onClose
}: {
  current: SetId
  onPick: (id: SetId) => void
  onClose: () => void
}) {
  return (
    <div className="travel-panel" role="dialog" aria-label="Viajar a otro plató">
      <div className="travel-card">
        <div className="travel-head">
          <h2>VIAJAR</h2>
          <button className="focos-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <p className="travel-note">Elige un plató. Fan remake · no oficial.</p>
        <div className="travel-grid">
          {SET_ORDER.map((id) => {
            const s = SETS[id]
            const here = id === current
            return (
              <button
                key={id}
                type="button"
                className={`travel-item ${here ? 'here' : ''}`}
                style={{ borderColor: ACCENT[id] }}
                disabled={here}
                onClick={() => onPick(id)}
              >
                <span className="travel-dot" style={{ background: ACCENT[id] }} />
                <span className="travel-name">{s.label}</span>
                {here && <span className="travel-here">Aquí</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
