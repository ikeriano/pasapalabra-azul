import { asset } from '../asset'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { setBgCenter, trackCenter } from '../components/bgCenter'
import { levelOf, useProfile } from '../store'
import { AvatarFace } from '../components/Avatar'
import { Brain, Cart, Crown, Gear, People, RoscoIcon, Ticket, Tv } from '../components/Icons'
import { useSize } from '../components/useSize'
import { todayKey } from '../utils'

export type MenuTarget = 'ranking' | 'tienda' | 'juegos' | 'duelo' | 'diario' | 'tv' | 'opciones'

function RoundBtn({ x, y, d, label, icon, small, badge, onClick }: { x: number; y: number; d: number; label: string; icon: ReactNode; small?: boolean; badge?: ReactNode; onClick: () => void }) {
  return (
    <button className={`mbtn ${small ? 'small' : 'big'}`} style={{ left: `${50 + x}%`, top: `${50 + y}%`, ['--d' as string]: d }} onClick={onClick}>
      <span className="mbtn-circle">
        <span className="mbtn-icon">{icon}</span>
        {badge && <span className="mbtn-badge">{badge}</span>}
      </span>
      <span className="mbtn-label">{label}</span>
    </button>
  )
}

export function Menu({ go }: { go: (t: MenuTarget) => void }) {
  const p = useProfile()
  const [tip, setTip] = useState(false)
  const [areaRef, area] = useSize<HTMLDivElement>()
  const A = Math.min(area.w, area.h / 1.02)
  const dailyPending = p.dailyDone !== todayKey()
  const avRef = useRef<HTMLDivElement>(null)
  useEffect(() => { trackCenter(avRef.current) }, [A])
  useEffect(() => () => setBgCenter(null), [])
  return (
    <div className="screen menu">
      <div className="menu-top">
        <button className="coin-pill" onClick={() => setTip((v) => !v)} aria-label="Monedas">
          <Ticket className="coin-ticket" />
          <span className="coin-num">{p.coins}</span>
          <span className="coin-info">i</span>
        </button>
        <button className="gear-btn" onClick={() => go('opciones')}>
          <span className="gear-circle"><Gear size="62%" /></span>
          <span className="gear-label">OPCIONES</span>
        </button>
        {tip && <div className="coin-tip" onClick={() => setTip(false)}>Ganas 1 moneda por cada acierto. Gástalas en la TIENDA en nuevos avatares.</div>}
      </div>
      <div className="menu-logo">
        <img src={asset('logo-pasapalabra.png')} alt="Pasapalabra" draggable={false} />
      </div>
      <div className="menu-arc-area" ref={areaRef}>
        {A > 0 && (
          <div className="menu-arc" style={{ width: A, height: A * 1.02, ['--a' as string]: `${A}px` }}>
            <div className="avatar-wrap" ref={avRef} onClick={() => go('opciones')}>
              <span className="avatar-ring"><AvatarFace id={p.avatar} /></span>
              <span className="avatar-name">{p.name}</span>
              <span className="avatar-lvl">{levelOf(p.totalHits)}</span>
            </div>
            <RoundBtn x={0} y={-38} d={0.125} small label="RANKING" icon={<Crown size="100%" />} onClick={() => go('ranking')} />
            <RoundBtn x={-28} y={-27.5} d={0.125} small label="TIENDA" icon={<Cart size="100%" />} onClick={() => go('tienda')} />
            <RoundBtn x={-36.4} y={11.5} d={0.19} label="JUEGOS" icon={<Brain size="100%" />} onClick={() => go('juegos')} />
            <RoundBtn x={36.4} y={11.5} d={0.19} label="DUELO" icon={<People size="100%" />} onClick={() => go('duelo')} />
            <RoundBtn x={-15.5} y={34} d={0.215} label="ROSCO DIARIO" icon={<RoscoIcon size="100%" />} badge={dailyPending ? '1' : undefined} onClick={() => go('diario')} />
            <RoundBtn x={15.5} y={34} d={0.215} label="PROGRAMA TV" icon={<Tv size="100%" />} onClick={() => go('tv')} />
          </div>
        )}
      </div>
    </div>
  )
}
