import { asset } from '../asset'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import '@fontsource/fredoka/600.css'
import { StudioSet, SOPA_SPOT, DONDE_SPOT, ALAZ_SPOT } from './Set'
import { Presentador, PresentadorBubble } from './Presentador'
import { labelTexture, loadFonts } from './textures'
import { Joystick, LookPad, type InputState } from './controls'
import { Background } from '../components/Background'
import { BackTri } from '../components/Icons'
import { BotePill } from '../components/BotePill'
import { FocosPanel } from './FocosPanel'
import { useFocos } from './focos'
import { Rosco } from '../screens/Rosco'
import { Silla } from '../screens/Silla'
import { UnaDeCuatro } from '../screens/UnaDeCuatro'
import { Sopa } from '../screens/Sopa'
import { Donde } from '../screens/Donde'
import { Alaz } from '../screens/Alaz'
import { ProgramaFlow } from '../screens/Tv'
import { dondeBoards, randomAlaz, randomRosco, sillaSession, sopaSession, udcSession } from '../data'
import { audio } from '../audio'
import { useProfile } from '../store'
import type { GameResult } from '../types'

type HotId = 'rosco' | 'silla' | 'udc' | 'sopa' | 'donde' | 'alaz'
const HOTSPOTS: { id: HotId; x: number; z: number; r: number; label: string; y: number; accent: string }[] = [
  { id: 'rosco', x: 0, z: 0, r: 5.9, label: 'EL ROSCO', y: 3.0, accent: '#3fcb2f' },
  { id: 'silla', x: -6.6, z: -5.4, r: 3.6, label: 'LA SILLA AZUL', y: 3.4, accent: '#2a86e6' },
  { id: 'udc', x: 5.2, z: -6.4, r: 2.6, label: 'UNA DE CUATRO', y: 3.0, accent: '#ff8a2a' },
  { id: 'sopa', x: SOPA_SPOT[0], z: SOPA_SPOT[2], r: 2.3, label: 'SOPA DE LETRAS', y: 4.1, accent: '#36c25a' },
  { id: 'donde', x: DONDE_SPOT[0], z: DONDE_SPOT[2], r: 2.2, label: '¿DÓNDE ESTÁN?', y: 4.1, accent: '#13a8e8' },
  { id: 'alaz', x: ALAZ_SPOT[0], z: ALAZ_SPOT[2], r: 2.4, label: 'A LA Z', y: 3.6, accent: '#ff5a5a' }
]
const ACTION: Record<HotId, string> = { rosco: 'JUGAR EL ROSCO', silla: 'LA SILLA AZUL', udc: 'UNA DE CUATRO', sopa: 'SOPA DE LETRAS', donde: '¿DÓNDE ESTÁN?', alaz: 'A LA Z' }

/** Player pose persists across overlay open/close (and remounts). */
const pose = { x: 0, z: 10.4, yaw: 0, pitch: -0.08, eye: 1.65, fixedEye: 0 }
;(() => {
  const cam = new URLSearchParams(location.search).get('cam')
  if (cam) {
    const [x, z, yaw, pitch, eye] = cam.split(',').map(Number)
    Object.assign(pose, { x: x || 0, z: z || 0, yaw: (yaw || 0) * (Math.PI / 180), pitch: (pitch || 0) * (Math.PI / 180), fixedEye: eye || 0 })
    if (eye) pose.eye = eye
  }
})()

function floorHeight(x: number, z: number) {
  const r = Math.hypot(x, z)
  if (r < 5.35) return 0.26
  if (Math.hypot(x + 6.6, z + 5.4) < 2.75) return 0.44
  return 0
}
function collide(x: number, z: number): [number, number] {
  // outer bounds
  let r = Math.hypot(x, z)
  if (r > 13.2) { x *= 13.2 / r; z *= 13.2 / r }
  if (z < -9.2) z = -9.2
  // gradas (right side arc)
  r = Math.hypot(x, z)
  const th = Math.atan2(x, z) * (180 / Math.PI)
  if (th > 40 && th < 144 && r > 9.35) { x *= 9.35 / r; z *= 9.35 / r }
  // table + stools
  r = Math.hypot(x, z)
  if (r < 3.55) { const k = 3.55 / Math.max(r, 0.001); x *= k; z *= k }
  // podiums + jib base
  for (const [cx, cz, rr] of [[-7.4, -5.2, 0.55], [-5.7, -5.7, 0.55], [-10.6, 2.6, 0.9], [-9.0, 6.4, 0.7], [8.5, 2.5, 0.7], [1.8, 7.4, 0.55]] as const) {
    const d = Math.hypot(x - cx, z - cz)
    if (d < rr) { x = cx + ((x - cx) / Math.max(d, 0.001)) * rr; z = cz + ((z - cz) / Math.max(d, 0.001)) * rr }
  }
  return [x, z]
}

function Player({ input, active, onNear }: { input: React.MutableRefObject<InputState>; active: boolean; onNear: (id: HotId | null) => void }) {
  const { camera } = useThree()
  const near = useRef<HotId | null>(null)
  useEffect(() => { camera.rotation.order = 'YXZ' }, [camera])
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const inp = input.current
    if (active) {
      // look
      pose.yaw -= inp.lookDX * 0.0042
      pose.pitch = Math.max(-1.1, Math.min(0.9, pose.pitch - inp.lookDY * 0.0036))
      inp.lookDX = 0; inp.lookDY = 0
      const kx = (inp.keys.has('d') || inp.keys.has('arrowright') ? 1 : 0) - (inp.keys.has('a') || inp.keys.has('arrowleft') ? 1 : 0)
      const ky = (inp.keys.has('w') || inp.keys.has('arrowup') ? 1 : 0) - (inp.keys.has('s') || inp.keys.has('arrowdown') ? 1 : 0)
      let mx = inp.joyX + kx, my = inp.joyY + ky
      const m = Math.hypot(mx, my)
      if (m > 1) { mx /= m; my /= m }
      if (inp.keys.has('q')) pose.yaw += dt * 1.6
      if (inp.keys.has('e')) pose.yaw -= dt * 1.6
      if (m > 0.02) {
        const speed = 3.4 * dt
        const sin = Math.sin(pose.yaw), cos = Math.cos(pose.yaw)
        // forward = -Z rotated by yaw
        const dx = (-sin * my + cos * mx) * speed
        const dz = (-cos * my - sin * mx) * speed
        const [nx, nz] = collide(pose.x + dx, pose.z + dz)
        pose.x = nx; pose.z = nz
      }
    }
    const target = pose.fixedEye || 1.65 + floorHeight(pose.x, pose.z)
    pose.eye += (target - pose.eye) * Math.min(1, dt * 8)
    camera.position.set(pose.x, pose.eye, pose.z)
    camera.rotation.set(pose.pitch, pose.yaw, 0)
    // hotspot proximity
    let best: HotId | null = null, bd = Infinity
    for (const h of HOTSPOTS) {
      const d = Math.hypot(pose.x - h.x, pose.z - h.z)
      if (d < h.r && d < bd) { bd = d; best = h.id }
    }
    if (best !== near.current) { near.current = best; onNear(best) }
  })
  return null
}

function HotspotLabel({ h, near }: { h: (typeof HOTSPOTS)[number]; near: boolean }) {
  const map = useMemo(() => labelTexture(h.label, h.accent), [h])
  const ref = useRef<THREE.Sprite>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.position.y = h.y + Math.sin(t * 2 + h.x) * 0.08
    const s = near ? 1.15 + Math.sin(t * 5) * 0.04 : 1
    ref.current.scale.set(3.2 * s, 0.8 * s, 1)
    ;(ref.current.material as THREE.SpriteMaterial).opacity = near ? 1 : 0.82
  })
  return (
    <sprite ref={ref} position={[h.x, h.y, h.z]} scale={[3.2, 0.8, 1]} renderOrder={10}>
      <spriteMaterial map={map} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

function Lights() {
  const f = useFocos()
  // Few real lights only (tablet-friendly); beams are emissive cones on the fixtures.
  return (
    <>
      <ambientLight intensity={0.45} color="#bcd4ff" />
      <hemisphereLight args={['#a9d2ff', '#10225e', 0.75]} />
      <directionalLight position={[4, 12, 8]} intensity={0.85} color="#ffffff" />
      {f.front.on && (
        <spotLight position={[0, 10.2, -5]} angle={0.5 * f.front.cone} penumbra={0.55}
          intensity={f.front.intensity * 16} color={f.front.color} distance={26} decay={2} />
      )}
      {f.accent.on && (
        <spotLight position={[-3.5, 8.5, 3]} angle={0.42 * f.accent.cone} penumbra={0.6}
          intensity={f.accent.intensity * 10} color={f.accent.color} distance={20} decay={2} />
      )}
      {f.balcony.on && (
        <pointLight position={[9.5, 4.8, 3.5]} intensity={f.balcony.intensity * 5} color={f.balcony.color} distance={14} decay={2} />
      )}
    </>
  )
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

type Game = { kind: HotId | 'full'; key: number } | null

export default function Plato({ onExit, onRecord }: { onExit: () => void; onRecord: (r: GameResult) => void }) {
  const p = useProfile()
  const [ready, setReady] = useState(false)
  const [near, setNear] = useState<HotId | null>(null)
  const [game, setGame] = useState<Game>(null)
  const [hint, setHint] = useState(true)
  const [showFocos, setShowFocos] = useState(false)
  const input = useRef<InputState>({ joyX: 0, joyY: 0, lookDX: 0, lookDY: 0, keys: new Set() })
  const gameOpen = game !== null
  const hasGL = useMemo(() => webglAvailable(), [])

  useEffect(() => { let alive = true; loadFonts().then(() => alive && setTimeout(() => setReady(true), 50)); return () => { alive = false } }, [])
  useEffect(() => { audio.setScene(gameOpen ? 'game' : 'menu') }, [gameOpen])
  useEffect(() => { const t = setTimeout(() => setHint(false), 6000); return () => clearTimeout(t) }, [])

  // keyboard (desktop) — disabled while a 2D game overlay is open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (gameOpen) return
      const k = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { input.current.keys.add(k); e.preventDefault() }
      if ((k === 'enter' || k === ' ') && near) { e.preventDefault(); open(near) }
    }
    const up = (e: KeyboardEvent) => input.current.keys.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  })

  const open = (kind: HotId | 'full') => {
    input.current.keys.clear(); input.current.joyX = input.current.joyY = 0
    setGame({ kind, key: Date.now() })
  }
  const close = () => setGame(null)
  const done = (r: GameResult) => { onRecord(r); close() }

  let overlay: JSX.Element | null = null
  if (game) {
    if (game.kind === 'rosco') overlay = <Rosco key={game.key} players={[{ name: p.name, bank: randomRosco() }]} mode="rosco" onExit={close} onDone={done} continueLabel="VOLVER AL PLATÓ" />
    if (game.kind === 'silla') overlay = <Silla key={game.key} entries={sillaSession(12)} onExit={close} onDone={done} continueLabel="VOLVER AL PLATÓ" />
    if (game.kind === 'udc') overlay = <UnaDeCuatro key={game.key} questions={udcSession(17)} time={90} onExit={close} onDone={done} continueLabel="VOLVER AL PLATÓ" />
    if (game.kind === 'sopa') overlay = <Sopa key={game.key} puzzles={sopaSession(8)} time={90} onExit={close} onDone={done} continueLabel="VOLVER AL PLATÓ" />
    if (game.kind === 'donde') overlay = <Donde key={game.key} boards={dondeBoards(6)} time={90} onExit={close} onDone={done} continueLabel="VOLVER AL PLATÓ" />
    if (game.kind === 'alaz') overlay = <Alaz key={game.key} bank={randomAlaz()} time={150} onExit={close} onDone={done} continueLabel="VOLVER AL PLATÓ" />
    if (game.kind === 'full') overlay = <ProgramaFlow key={game.key} onExit={close} onFinish={(total, rs) => {
      onRecord({ mode: 'tv', title: 'PROGRAMA', timeUsed: 0, hits: rs.reduce((s, r) => s + r.hits, 0), fails: rs.reduce((s, r) => s + r.fails, 0), score: total, items: [], shareText: '' })
      close()
    }} />
  }

  if (!hasGL) {
    return (
      <div className="plato-root plato-nogl">
        <Background />
        <div className="plato-loading">
          <img src={asset('logo-pasapalabra-sm.png')} alt="Pasapalabra" />
          <p>Este dispositivo no admite gráficos 3D. Puedes jugar la partida completa en 2D.</p>
          <BotePill amount={p.bote} program={p.programNumber} className="plato-bote-static" />
          <button className="btn-blue" onClick={() => open('full')}>NUEVO PROGRAMA</button>
          <button className="btn-ghost" onClick={onExit}>Volver al menú</button>
        </div>
        {overlay && <div className="plato-overlay"><Background /><div className="app">{overlay}</div></div>}
      </div>
    )
  }

  return (
    <div className="plato-root">
      {ready && (
        <Canvas
          className="plato-canvas"
          dpr={[1, 1.5]}
          frameloop={gameOpen ? 'never' : 'always'}
          gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: new URLSearchParams(location.search).has('cam') }}
          camera={{ fov: 62, near: 0.1, far: 80, position: [pose.x, pose.eye, pose.z] }}
          onCreated={({ gl, scene }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05
            scene.background = new THREE.Color('#050a1e')
            scene.fog = new THREE.Fog('#071233', 18, 42)
          }}
        >
          <Suspense fallback={null}>
            <Lights />
            <StudioSet />
            <Presentador position={[1.8, 0, 7.4]} />
            <PresentadorBubble position={[2.7, 3.15, 7.4]} nearLabel={near} />
            {HOTSPOTS.map((h) => <HotspotLabel key={h.id} h={h} near={near === h.id} />)}
            <Player input={input} active={!gameOpen} onNear={setNear} />
          </Suspense>
        </Canvas>
      )}
      {!ready && (
        <div className="plato-loading">
          <img src={asset('logo-pasapalabra-sm.png')} alt="Pasapalabra" />
          <div className="splash-dots"><i /><i /><i /></div>
          <p>Montando el plató…</p>
        </div>
      )}
      {ready && !gameOpen && (
        <div className="plato-hud">
          <LookPad input={input} />
          <Joystick input={input} />
          <button className="back-btn plato-back" onClick={onExit} aria-label="Salir">
            <span className="back-circle"><BackTri size="58%" style={{ marginLeft: '-8%' }} /></span>
            <span className="back-label">SALIR</span>
          </button>
          <BotePill amount={p.bote} program={p.programNumber} className="plato-bote" />
          <button className="plato-full" onClick={() => open('full')}>NUEVO PROGRAMA</button>
          <button className="plato-focos-btn" onClick={() => setShowFocos(true)}>FOCOS</button>
          {near && (
            <button className="plato-action" onClick={() => open(near)}>
              <span>{ACTION[near]}</span>
            </button>
          )}
          {hint && !near && <div className="plato-hint">Mueve el joystick para andar · arrastra a la derecha para mirar</div>}
        </div>
      )}
      {showFocos && <FocosPanel onClose={() => setShowFocos(false)} />}
      {overlay && (
        <div className="plato-overlay">
          <Background />
          <div className="app">{overlay}</div>
        </div>
      )}
    </div>
  )
}
