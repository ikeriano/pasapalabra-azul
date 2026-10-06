import { useState } from 'react'
import { Header } from '../components/Header'
import { AVATARS, AvatarFace } from '../components/Avatar'
import { Ticket } from '../components/Icons'
import { store, useProfile } from '../store'

export function Tienda({ onBack }: { onBack: () => void }) {
  const p = useProfile()
  const [msg, setMsg] = useState('')
  const buy = (id: string, price: number) => {
    if (p.owned.includes(id)) { store.set({ avatar: id }); setMsg('¡Avatar equipado!'); return }
    if (p.coins < price) { setMsg(`Te faltan ${price - p.coins} monedas`); return }
    store.set({ coins: p.coins - price, owned: [...p.owned, id], avatar: id })
    setMsg('¡Comprado y equipado!')
  }
  return (
    <div className="screen tienda">
      <Header title="Tienda" onBack={onBack} backLabel="VOLVER" />
      <div className="scroll-col">
        <div className="coin-pill static"><Ticket className="coin-ticket" /><span className="coin-num">{p.coins}</span></div>
        <p className="hint">Ganas 1 moneda por cada acierto y 3 extra por cada cadena completa en La Silla Azul.</p>
        <div className="shop-grid">
          {AVATARS.map((a) => {
            const owned = p.owned.includes(a.id)
            return (
              <button key={a.id} className={`shop-item ${p.avatar === a.id ? 'sel' : ''}`} onClick={() => buy(a.id, a.price)}>
                <AvatarFace id={a.id} />
                <span className="shop-name">{a.name}</span>
                <span className={`shop-price ${owned ? 'owned' : ''}`}>{owned ? (p.avatar === a.id ? 'EQUIPADO' : 'USAR') : <><Ticket className="mini-ticket" /> {a.price}</>}</span>
              </button>
            )
          })}
        </div>
        {msg && <div className="toast inline" onAnimationEnd={() => setMsg('')}>{msg}</div>}
      </div>
    </div>
  )
}
