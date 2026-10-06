import { useState } from 'react'
import { Header } from '../components/Header'
import { People } from '../components/Icons'
import { useProfile } from '../store'

export function DueloSetup({ onBack, onStart }: { onBack: () => void; onStart: (a: string, b: string) => void }) {
  const p = useProfile()
  const [a, setA] = useState(p.name)
  const [b, setB] = useState('INVITADO')
  return (
    <div className="screen duelo">
      <Header title="Duelo" onBack={onBack} backLabel="VOLVER" />
      <div className="scroll-col">
        <section className="card center">
          <div className="duel-ico"><People size="100%" /></div>
          <p>Dos jugadores, un dispositivo. Cada uno tiene su propio rosco y <b>2:30</b>. Al fallar o decir <b>PASAPALABRA</b>, pasa el turno al rival. Gana quien más aciertos tenga.</p>
          <label className="field"><span>Jugador 1</span><input value={a} maxLength={12} onChange={(e) => setA(e.target.value.toUpperCase())} /></label>
          <label className="field"><span>Jugador 2</span><input value={b} maxLength={12} onChange={(e) => setB(e.target.value.toUpperCase())} /></label>
          <button className="btn-blue" onClick={() => onStart(a.trim() || 'JUGADOR 1', b.trim() || 'JUGADOR 2')}>EMPEZAR DUELO</button>
        </section>
      </div>
    </div>
  )
}
