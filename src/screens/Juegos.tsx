import { Header } from '../components/Header'
import { Bubble } from '../components/Bubble'
import { Tv, Grid9, DotsRing } from '../components/Icons'

export function Juegos({ onBack, onPick }: { onBack: () => void; onPick: (g: 'rosco' | 'silla' | 'udc' | 'sopa' | 'donde' | 'tv2d') => void }) {
  return (
    <div className="screen juegos">
      <Header title="Juegos" onBack={onBack} backLabel="VOLVER" />
      <div className="list-col">
        <button className="game-card" onClick={() => onPick('rosco')}>
          <span className="gc-icon rosco-mini">{'ABCDEFGHIJ'.split('').map((l, i) => (
            <Bubble key={l} letter={l} kind={i === 0 ? 'current' : i < 4 ? 'correct' : i === 5 ? 'wrong' : 'pending'}
              style={{ left: `${50 + Math.cos((i / 10) * 2 * Math.PI - Math.PI / 2) * 38 - 11}%`, top: `${50 + Math.sin((i / 10) * 2 * Math.PI - Math.PI / 2) * 38 - 11}%` }} />
          ))}</span>
          <span className="gc-text"><b>El Rosco</b><small>25 letras · 2:30 para completarlo</small></span>
        </button>
        <button className="game-card" onClick={() => onPick('silla')}>
          <span className="gc-icon"><span className="silla-mini"><Bubble letter="B" kind="white" /><span className="chain-slot on" /><span className="chain-slot on" /></span></span>
          <span className="gc-text"><b>La Silla Azul</b><small>Definiciones encadenadas · cadenas de 3</small></span>
        </button>
        <button className="game-card" onClick={() => onPick('udc')}>
          <span className="gc-icon"><span className="udc-mini"><i /><i className="g" /><i /><i /></span></span>
          <span className="gc-text"><b>Una de Cuatro</b><small>17 preguntas · 4 opciones · 1:30</small></span>
        </button>
        <button className="game-card" onClick={() => onPick('sopa')}>
          <span className="gc-icon"><Grid9 size="56%" style={{ color: '#fff' }} /></span>
          <span className="gc-text"><b>Sopa de Letras</b><small>5 palabras escondidas por categoría · 1:30</small></span>
        </button>
        <button className="game-card" onClick={() => onPick('donde')}>
          <span className="gc-icon"><DotsRing size="58%" style={{ color: '#fff' }} /></span>
          <span className="gc-text"><b>¿Dónde están?</b><small>Memoriza 9 palabras y encuéntralas · 1:30</small></span>
        </button>
        <button className="game-card" onClick={() => onPick('tv2d')}>
          <span className="gc-icon"><Tv size="58%" style={{ color: '#fff' }} /></span>
          <span className="gc-text"><b>Partida completa</b><small>Las 5 pruebas en orden · el tiempo ganado va al Rosco (sin 3D)</small></span>
        </button>
      </div>
    </div>
  )
}
