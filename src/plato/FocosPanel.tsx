import { focos, useFocos, FOCO_LABELS, FOCO_PRESETS, type FocoGroupId } from './focos'

const IDS = Object.keys(FOCO_LABELS) as FocoGroupId[]

export function FocosPanel({ onClose }: { onClose: () => void }) {
  const state = useFocos()
  return (
    <div className="focos-panel" role="dialog" aria-label="Focos del plató">
      <div className="focos-card">
        <div className="focos-head">
          <h2>FOCOS</h2>
          <button className="focos-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <p className="focos-note">Personaliza las luces del plató. Se guardan en este dispositivo.</p>
        <div className="focos-list">
          {IDS.map((id) => {
            const g = state[id]
            return (
              <div key={id} className={`focos-row ${g.on ? '' : 'off'}`}>
                <div className="focos-row-top">
                  <label className="focos-toggle">
                    <input type="checkbox" checked={g.on} onChange={(e) => focos.setGroup(id, { on: e.target.checked })} />
                    <span>{FOCO_LABELS[id]}</span>
                  </label>
                  <input type="color" value={g.color} disabled={!g.on} onChange={(e) => focos.setGroup(id, { color: e.target.value })} aria-label={`Color ${FOCO_LABELS[id]}`} />
                </div>
                <div className="focos-presets">
                  {FOCO_PRESETS.map((c) => (
                    <button key={c} className={`focos-swatch ${g.color.toLowerCase() === c.toLowerCase() ? 'on' : ''}`} style={{ background: c }}
                      disabled={!g.on} onClick={() => focos.setGroup(id, { color: c })} aria-label={c} />
                  ))}
                </div>
                <label className="focos-slider">Intensidad
                  <input type="range" min={0} max={1} step={0.05} value={g.intensity} disabled={!g.on}
                    onChange={(e) => focos.setGroup(id, { intensity: Number(e.target.value) })} />
                </label>
                <label className="focos-slider">Haz
                  <input type="range" min={0.5} max={2} step={0.05} value={g.cone} disabled={!g.on}
                    onChange={(e) => focos.setGroup(id, { cone: Number(e.target.value) })} />
                </label>
              </div>
            )
          })}
        </div>
        <button className="btn-ghost focos-reset" onClick={() => focos.reset()}>Restablecer focos</button>
      </div>
    </div>
  )
}
