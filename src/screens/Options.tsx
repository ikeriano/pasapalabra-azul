import { useState } from 'react'
import { Header } from '../components/Header'
import { Toggle } from '../components/Modal'
import { AVATARS, AvatarFace } from '../components/Avatar'
import { store, useProfile } from '../store'
import { audio } from '../audio'

export function Options({ onBack, onShop }: { onBack: () => void; onShop: () => void }) {
  const p = useProfile()
  const [name, setName] = useState(p.name)
  const [reset, setReset] = useState(false)
  const saveName = () => store.set({ name: (name.trim() || 'JUGADOR').toUpperCase().slice(0, 14) })
  return (
    <div className="screen options">
      <Header title="Opciones" onBack={() => { saveName(); onBack() }} backLabel="VOLVER" />
      <div className="scroll-col">
        <section className="card">
          <h3>Jugador</h3>
          <label className="field">
            <span>Nombre</span>
            <input value={name} maxLength={14} onChange={(e) => setName(e.target.value.toUpperCase())} onBlur={saveName}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} autoCapitalize="characters" spellCheck={false} />
          </label>
          <div className="avatar-grid">
            {AVATARS.filter((a) => p.owned.includes(a.id)).map((a) => (
              <button key={a.id} className={`avatar-opt ${p.avatar === a.id ? 'sel' : ''}`} onClick={() => store.set({ avatar: a.id })} aria-label={a.name}>
                <AvatarFace id={a.id} />
              </button>
            ))}
            <button className="avatar-opt more" onClick={onShop} aria-label="Tienda">＋</button>
          </div>
        </section>
        <section className="card">
          <h3>Sonido</h3>
          <Toggle label="Música" on={p.music} onChange={(v) => { store.set({ music: v }); audio.applyScene() }} />
          <Toggle label="Efectos (acierto / fallo)" on={p.sfx} onChange={(v) => store.set({ sfx: v })} />
        </section>
        <section className="card about">
          <h3>Acerca de</h3>
          <p><b>Fan remake, no oficial.</b> Proyecto personal sin ánimo de lucro, sin relación con Atresmedia ni con los titulares del formato «Pasapalabra». Preguntas originales escritas para este remake.</p>
          <p className="muted">Versión 1.0 · Hecho para Iker</p>
        </section>
        <section className="card">
          <h3>Datos</h3>
          {!reset ? (
            <button className="btn-ghost danger" onClick={() => setReset(true)}>Borrar progreso (monedas, ranking…)</button>
          ) : (
            <div className="row-2">
              <button className="btn-orange" onClick={() => { store.reset(); setName('JUGADOR'); setReset(false) }}>SÍ, BORRAR</button>
              <button className="btn-blue" onClick={() => setReset(false)}>CANCELAR</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
