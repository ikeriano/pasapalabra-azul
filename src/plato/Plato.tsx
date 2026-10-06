import { asset } from '../asset'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import '@fontsource/fredoka/600.css'
import { StudioSet, SOPA_SPOT, DONDE_SPOT, ALAZ_SPOT } from './Set'
import { Presentador, PresentadorBubble } from './Presentador'
import { labelTexture, loadFonts } from './textures'
import { Joystick, LookPad, JumpButton, type InputState } from './controls'
import { Avatar, type AvatarAnim } from './Avatar'
import { Portal } from './Portal'
import { PlanoBar } from './PlanoBar'
import { TravelPicker } from './TravelPicker'
import { SETS, type SetId, type Plano } from './world'

const LazyAhora = lazy(() => import('./sets/AhoraCaigo').then((m) => ({ default: m.AhoraCaigoSet })))
const LazyCocina = lazy(() => import('./sets/Cocina').then((m) => ({ default: m.CocinaSet })))
const LazyAbismo = lazy(() => import('./sets/Abismo').then((m) => ({ default: m.AbismoSet })))
const LazyBoom = lazy(() => import('./sets/Boom').then((m) => ({ default: m.BoomSet })))
const LazyRueda = lazy(() => import('./sets/Rueda').then((m) => ({ default: m.RuedaSet })))
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
const pose = {
  x: 0, z: 10.4, y: 0, vy: 0, yaw: 0, pitch: -0.12,
  eye: 1.65, fixedEye: 0, grounded: true, moving: false
}
type CamMode = 'tercera' | 'primera'
function loadCamMode(): CamMode {
  try { return localStorage.getItem('pasapalabra-azul-cam') === 'primera' ? 'primera' : 'tercera' } catch { return 'tercera' }
}
let camMode: CamMode = loadCamMode()
;(() => {
  const cam = new URLSearchParams(location.search).get('cam')
  if (cam) {
    const [x, z, yaw, pitch, eye] = cam.split(',').map(Number)
    Object.assign(pose, { x: x || 0, z: z || 0, yaw: (yaw || 0) * (Math.PI / 180), pitch: (pitch || 0) * (Math.PI / 180), fixedEye: eye || 0 })
    if (eye) pose.eye = eye
  }
  const m = new URLSearchParams(location.search).get('camMode')
  if (m === 'primera' || m === 'tercera') camMode = m
})()

let activeSetId: SetId = 'pasapalabra'
function setActiveSetId(id: SetId) { activeSetId = id }
function def() { return SETS[activeSetId] }

const G = 22
const JUMP_V = 8.15   // ~1.5 m
const WALK = 4.7
const STEP_UP = 0.72
const BODY_R = 0.32

function floorHeight(x: number, z: number) { return def().floorHeight(x, z) }
pose.y = floorHeight(pose.x, pose.z)
if (typeof window !== 'undefined') (window as unknown as { __platoPose: typeof pose }).__platoPose = pose

function collide(x: number, z: number, y: number): [number, number] {
  return def().collide(x, z, y)
}

function Player({
  input, active, onNear, mode, anim, plano, onPortalNear
}: {
  input: React.MutableRefObject<InputState>
  active: boolean
  onNear: (id: HotId | null) => void
  mode: CamMode
  anim: React.MutableRefObject<AvatarAnim>
  plano: Plano | null
  onPortalNear: (near: boolean) => void
}) {
  const { camera } = useThree()
  const near = useRef<HotId | null>(null)
  const portalNearRef = useRef(false)
  const camPos = useRef(new THREE.Vector3(pose.x, pose.eye, pose.z + 5))
  useEffect(() => { camera.rotation.order = 'YXZ' }, [camera])
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const inp = input.current
    let moving = false
    if (active) {
      pose.yaw -= inp.lookDX * 0.0042
      pose.pitch = Math.max(-1.05, Math.min(0.75, pose.pitch - inp.lookDY * 0.0036))
      inp.lookDX = 0; inp.lookDY = 0
      const kx = (inp.keys.has('d') || inp.keys.has('arrowright') ? 1 : 0) - (inp.keys.has('a') || inp.keys.has('arrowleft') ? 1 : 0)
      const ky = (inp.keys.has('w') || inp.keys.has('arrowup') ? 1 : 0) - (inp.keys.has('s') || inp.keys.has('arrowdown') ? 1 : 0)
      let mx = inp.joyX + kx, my = inp.joyY + ky
      const mlen = Math.hypot(mx, my)
      if (mlen > 1) { mx /= mlen; my /= mlen }
      if (inp.keys.has('q')) pose.yaw += dt * 1.6
      if (inp.keys.has('e')) pose.yaw -= dt * 1.6
      // Jump (button or Space / Spacebar when not opening hotspot — Space opens if near; use Space always for jump if not near handled outside)
      if ((inp.jump || inp.keys.has(' ')) && pose.grounded) {
        pose.vy = JUMP_V
        pose.grounded = false
        inp.jump = false
      }
      if (mlen > 0.02) {
        moving = true
        const speed = WALK * dt
        const sin = Math.sin(pose.yaw), cos = Math.cos(pose.yaw)
        const dx = (-sin * my + cos * mx) * speed
        const dz = (-cos * my - sin * mx) * speed
        let nx = pose.x + dx, nz = pose.z + dz
        ;[nx, nz] = collide(nx, nz, pose.y)
        const fh = floorHeight(nx, nz)
        // Block walking into walls taller than step-up while grounded
        if (pose.grounded && fh > pose.y + STEP_UP + 0.02) {
          // try axis slide
          let ax = pose.x + dx, az = pose.z
          ;[ax, az] = collide(ax, az, pose.y)
          if (floorHeight(ax, az) <= pose.y + STEP_UP + 0.02) { nx = ax; nz = az }
          else {
            ax = pose.x; az = pose.z + dz
            ;[ax, az] = collide(ax, az, pose.y)
            if (floorHeight(ax, az) <= pose.y + STEP_UP + 0.02) { nx = ax; nz = az }
            else { nx = pose.x; nz = pose.z }
          }
        }
        pose.x = nx; pose.z = nz
        // Auto step-up onto low ledges / table rim while walking
        const fh2 = floorHeight(pose.x, pose.z)
        if (pose.grounded && fh2 > pose.y + 0.04 && fh2 <= pose.y + STEP_UP) {
          pose.y = fh2
        }
      }
    }
    // Gravity
    pose.vy -= G * dt
    pose.y += pose.vy * dt
    const ground = floorHeight(pose.x, pose.z)
    if (pose.y <= ground) {
      pose.y = ground
      if (pose.vy < 0) pose.vy = 0
      pose.grounded = true
    } else {
      pose.grounded = false
    }
    pose.moving = moving
    anim.current = { moving, grounded: pose.grounded, speed: Math.hypot(inp.joyX, inp.joyY) }

    // Camera
    if (plano) {
      const desired = new THREE.Vector3(...plano.pos)
      camPos.current.lerp(desired, Math.min(1, dt * 4))
      camera.position.copy(camPos.current)
      camera.lookAt(plano.look[0], plano.look[1], plano.look[2])
    } else if (mode === 'primera') {
      const targetEye = pose.fixedEye || (pose.y + 1.55)
      pose.eye += (targetEye - pose.eye) * Math.min(1, dt * 10)
      camera.position.set(pose.x, pose.eye, pose.z)
      camera.rotation.set(pose.pitch, pose.yaw, 0)
    } else {
      const dist = 5.4
      const elev = 2.15 - pose.pitch * 1.8
      const backX = pose.x + Math.sin(pose.yaw) * dist
      const backZ = pose.z + Math.cos(pose.yaw) * dist
      const desired = new THREE.Vector3(backX, pose.y + elev, backZ)
      camPos.current.lerp(desired, Math.min(1, dt * 6))
      camera.position.copy(camPos.current)
      const lookY = pose.y + 1.35 + pose.pitch * 0.4
      camera.lookAt(pose.x, lookY, pose.z)
    }

    // Hotspots only on Pasapalabra
    let best: HotId | null = null
    if (activeSetId === 'pasapalabra') {
      let bd = Infinity
      for (const h of HOTSPOTS) {
        const d = Math.hypot(pose.x - h.x, pose.z - h.z)
        if (d < h.r && d < bd) { bd = d; best = h.id }
      }
    }
    if (best !== near.current) { near.current = best; onNear(best) }

    const portal = def().portal
    const pNear = Math.hypot(pose.x - portal.x, pose.z - portal.z) < 3.8
    if (pNear !== portalNearRef.current) { portalNearRef.current = pNear; onPortalNear(pNear) }
  })
  return (
    <Avatar
      getPose={() => pose}
      anim={anim}
      visible={mode === 'tercera' || !!plano}
    />
  )
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


function WorldScene({ setId }: { setId: SetId }) {
  const portal = SETS[setId].portal
  return (
    <>
      {setId === 'pasapalabra' && <StudioSet />}
      {setId === 'ahora' && <LazyAhora />}
      {setId === 'cocina' && <LazyCocina />}
      {setId === 'abismo' && <LazyAbismo />}
      {setId === 'boom' && <LazyBoom />}
      {setId === 'rueda' && <LazyRueda />}
      <Portal position={[portal.x, portal.y ?? 0, portal.z]} yaw={portal.yaw ?? 0} />
    </>
  )
}

function SceneTone({ setId }: { setId: SetId }) {
  const { scene } = useThree()
  useEffect(() => {
    const d = SETS[setId]
    scene.background = new THREE.Color(d.bg)
    scene.fog = new THREE.Fog(d.fog, 18, 48)
  }, [setId, scene])
  return null
}

export default function Plato({ onExit, onRecord }: { onExit: () => void; onRecord: (r: GameResult) => void }) {
  const p = useProfile()
  const [ready, setReady] = useState(false)
  const [near, setNear] = useState<HotId | null>(null)
  const [portalNear, setPortalNear] = useState(false)
  const [game, setGame] = useState<Game>(null)
  const [hint, setHint] = useState(true)
  const [showFocos, setShowFocos] = useState(false)
  const [showTravel, setShowTravel] = useState(false)
  const travelDismissed = useRef(false)
  const [setId, setSetId] = useState<SetId>('pasapalabra')
  const [plano, setPlano] = useState<Plano | null>(null)
  const [fade, setFade] = useState(false)
  const input = useRef<InputState>({ joyX: 0, joyY: 0, lookDX: 0, lookDY: 0, keys: new Set(), jump: false })
  const anim = useRef<AvatarAnim>({ moving: false, grounded: true, speed: 0 })
  const [mode, setMode] = useState<CamMode>(() => camMode)
  const gameOpen = game !== null
  const hasGL = useMemo(() => webglAvailable(), [])
  const setDef = SETS[setId]

  useEffect(() => { let alive = true; loadFonts().then(() => alive && setTimeout(() => setReady(true), 50)); return () => { alive = false } }, [])
  useEffect(() => { audio.setScene(gameOpen ? 'game' : 'menu') }, [gameOpen])
  useEffect(() => { const t = setTimeout(() => setHint(false), 6000); return () => clearTimeout(t) }, [])
  useEffect(() => { setActiveSetId(setId) }, [setId])
  useEffect(() => {
    const w = window as unknown as {
      __openTravel?: () => void
      __setPlatoSet?: (id: string) => void
      __platoPortal?: { x: number; z: number }
    }
    w.__openTravel = () => { travelDismissed.current = false; setShowTravel(true) }
    w.__platoPortal = { x: SETS[setId].portal.x, z: SETS[setId].portal.z }
    return () => { delete w.__openTravel }
  })
  useEffect(() => {
    if (!portalNear) { travelDismissed.current = false; return }
    if (portalNear && !showTravel && !gameOpen && !travelDismissed.current) {
      setShowTravel(true)
    }
  }, [portalNear, showTravel, gameOpen])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (gameOpen || showTravel) return
      const k = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) { input.current.keys.add(k); e.preventDefault() }
      if (k === 'enter' && near && setId === 'pasapalabra') { e.preventDefault(); open(near) }
      else if (k === 'enter' && portalNear) { e.preventDefault(); setShowTravel(true) }
    }
    const up = (e: KeyboardEvent) => input.current.keys.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  })

  const travelTo = (id: SetId) => {
    if (id === setId) { setShowTravel(false); return }
    setShowTravel(false)
    setFade(true)
    setTimeout(() => {
      setActiveSetId(id)
      setSetId(id)
      setPlano(null)
      setNear(null)
      const sp = SETS[id].spawn
      pose.x = sp.x; pose.z = sp.z; pose.yaw = sp.yaw; pose.vy = 0
      pose.y = SETS[id].floorHeight(sp.x, sp.z)
      pose.grounded = true
      setFade(false)
    }, 280)
  }

  const open = (kind: HotId | 'full') => {
    input.current.keys.clear(); input.current.joyX = input.current.joyY = 0; input.current.jump = false
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
            <SceneTone setId={setId} />
            <Lights />
            <WorldScene setId={setId} />
            {setId === 'pasapalabra' && (
              <>
                <Presentador position={[1.8, 0, 7.4]} />
                <PresentadorBubble position={[2.7, 3.15, 7.4]} nearLabel={near} />
                {HOTSPOTS.map((h) => <HotspotLabel key={h.id} h={h} near={near === h.id} />)}
              </>
            )}
            <Player input={input} active={!gameOpen && !showTravel} onNear={setNear} mode={mode} anim={anim} plano={plano} onPortalNear={setPortalNear} />
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
          <JumpButton input={input} />
          <button className="back-btn plato-back" onClick={onExit} aria-label="Salir">
            <span className="back-circle"><BackTri size="58%" style={{ marginLeft: '-8%' }} /></span>
            <span className="back-label">SALIR</span>
          </button>
          <div className="plato-set-pill">{setDef.label}</div>
          {setId === 'pasapalabra' && <BotePill amount={p.bote} program={p.programNumber} className="plato-bote" />}
          {setId === 'pasapalabra' && <button className="plato-full" onClick={() => open('full')}>NUEVO PROGRAMA</button>}
          {setId === 'pasapalabra' && <button className="plato-focos-btn" onClick={() => setShowFocos(true)}>FOCOS</button>}
          <button
            className="plato-cam-btn"
            onClick={() => {
              const next: CamMode = mode === 'tercera' ? 'primera' : 'tercera'
              setMode(next); camMode = next; setPlano(null)
              try { localStorage.setItem('pasapalabra-azul-cam', next) } catch {}
            }}
          >{mode === 'tercera' ? 'PRIMERA' : 'TERCERA'}</button>
          {near && setId === 'pasapalabra' && (
            <button className="plato-action" onClick={() => open(near)}>
              <span>{ACTION[near]}</span>
            </button>
          )}
          {portalNear && !near && (
            <button className="plato-action plato-travel-btn" onClick={() => setShowTravel(true)}>
              <span>VIAJAR</span>
            </button>
          )}
          <PlanoBar
            planos={setDef.planos}
            activeId={plano?.id ?? null}
            onPick={(pl) => { setPlano(pl); setMode('tercera') }}
            onLibre={() => setPlano(null)}
            onPortal={() => {
              const pr = setDef.portal
              const pin: Plano = {
                id: 'puerta', label: 'Puerta',
                pos: [pr.x + Math.sin(pr.yaw ?? 0) * 6, 4.2, pr.z + Math.cos(pr.yaw ?? 0) * 6],
                look: [pr.x, 2.4, pr.z],
                accent: '#5ec8ff'
              }
              setPlano(pin); setMode('tercera')
            }}
          />
          {hint && !near && !portalNear && (
            <div className="plato-hint">Busca la puerta VIAJAR brillante · planos abajo · salto</div>
          )}
        </div>
      )}
      {showFocos && setId === 'pasapalabra' && <FocosPanel onClose={() => setShowFocos(false)} />}
      {showTravel && <TravelPicker current={setId} onPick={travelTo} onClose={() => { travelDismissed.current = true; setShowTravel(false) }} />}
      {fade && <div className="plato-fade" />}
      {overlay && (
        <div className="plato-overlay">
          <Background />
          <div className="app">{overlay}</div>
        </div>
      )}
    </div>
  )
}
