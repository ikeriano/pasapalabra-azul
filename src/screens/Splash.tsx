import { asset } from '../asset'
export function Splash({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen splash" onClick={onStart}>
      <img className="splash-logo" src={asset('logo-pasapalabra-sm.png')} alt="Pasapalabra" draggable={false} />
      <div className="splash-dots"><i /><i /><i /></div>
      <button className="btn-orange splash-btn" onClick={(e) => { e.stopPropagation(); onStart() }}>TOCA PARA JUGAR</button>
    </div>
  )
}
