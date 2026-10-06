import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as T from './textures'

const D2R = Math.PI / 180
const add = THREE.AdditiveBlending

function Glow({ position, scale, color = '#9fd8ff', opacity = 0.6 }: { position: [number, number, number]; scale: number | [number, number]; color?: string; opacity?: number }) {
  const map = useMemo(() => T.glowTexture(), [])
  const s = Array.isArray(scale) ? scale : [scale, scale]
  return (
    <sprite position={position} scale={[s[0], s[1], 1]}>
      <spriteMaterial map={map} color={color} transparent opacity={opacity} blending={add} depthWrite={false} />
    </sprite>
  )
}

/** Glowing thin ring (emissive tube + soft additive halo). */
function NeonRing({ r, y, tube = 0.03, color = '#e8f6ff', halo = '#6fc3ff' }: { r: number; y: number; tube?: number; color?: string; halo?: string }) {
  return (
    <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><torusGeometry args={[r, tube, 6, 96]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
      <mesh><torusGeometry args={[r, tube * 5, 6, 96]} /><meshBasicMaterial color={halo} transparent opacity={0.18} blending={add} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  )
}

function Floor() {
  const map = useMemo(() => T.floorTexture(), [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial map={map} toneMapped={false} transparent opacity={0.8} depthWrite={false} />
    </mesh>
  )
}

/** Cheap glossy-floor reflections: mirrored copies of the bright LED screens below the semi-transparent floor. */
function Reflections() {
  const wall = useMemo(() => T.ledWallTexture(), [])
  const oranges = useMemo(() => [T.orangePanelTexture('H', 1), T.orangePanelTexture('H', 2), T.orangePanelTexture('D', 3)], [])
  const side = useMemo(() => T.sidePanelTexture(21), [])
  return (
    <group scale={[1, -1, 1]}>
      <Screen map={wall} position={[-3.6, 3.05, -10.6]} rotY={0.1} size={[10.4, 5.4]} />
      <Screen map={side} position={[-10.0, 3.05, -9.3]} rotY={0.55} size={[1.8, 5.4]} />
      <Screen map={side} position={[-12.0, 3.05, -7.6]} rotY={0.75} size={[1.8, 5.4]} />
      {oranges.map((m, i) => <Screen key={i} map={m} position={[2.9 + i * 2.0, 3.1, -10.4 + i * 0.25]} rotY={-0.12} size={[1.55, 5.6]} halo="#ff9a40" />)}
      <mesh position={[0, 0.13, 0]}><cylinderGeometry args={[5.3, 5.35, 0.26, 48]} /><meshBasicMaterial color="#9fb6dc" /></mesh>
    </group>
  )
}

function Platform() {
  return (
    <group>
      {/* outer grey step */}
      <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[5.75, 5.85, 0.12, 72]} /><meshLambertMaterial color="#8d9bb4" /></mesh>
      <NeonRing r={5.82} y={0.12} tube={0.02} color="#9fdcff" />
      {/* white top */}
      <mesh position={[0, 0.13, 0]}><cylinderGeometry args={[5.3, 5.35, 0.26, 72]} /><meshLambertMaterial color="#eef3fb" emissive="#3a4d70" emissiveIntensity={0.25} /></mesh>
      <NeonRing r={5.32} y={0.26} tube={0.028} />
      {/* subtle inner ring on the platform surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.262, 0]}><ringGeometry args={[4.3, 4.42, 72]} /><meshBasicMaterial color="#c8d6ea" /></mesh>
    </group>
  )
}

function RoscoTable() {
  const top = useMemo(() => T.tableTopTexture(), [])
  const led = useMemo(() => { const t = T.ledBandTexture(true, '#1e64ff', '#0c36d8'); t.repeat.x = 3; t.wrapS = THREE.RepeatWrapping; return t }, [])
  const center = useMemo(() => T.roscoCenterTexture(), [])
  const slats = useMemo(() => T.slatsTexture(), [])
  const ringRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ringRef.current) (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(clock.elapsedTime * 2) * 0.1
  })
  const Y = 1.12
  return (
    <group position={[0, 0.26, 0]}>
      {/* pedestal with vertical slats */}
      <mesh position={[0, 0.42, 0]}><cylinderGeometry args={[1.75, 1.95, 0.84, 48, 1, true]} /><meshLambertMaterial map={slats} side={THREE.DoubleSide} emissive="#6c7fa3" emissiveIntensity={0.35} /></mesh>
      <mesh position={[0, 0.84, 0]}><cylinderGeometry args={[2.0, 1.75, 0.06, 48]} /><meshLambertMaterial color="#dfe8f5" /></mesh>
      {/* recessed rosco centre */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y - 0.16, 0]}><circleGeometry args={[1.25, 48]} /><meshBasicMaterial map={center} toneMapped={false} /></mesh>
      <mesh position={[0, Y - 0.08, 0]}><cylinderGeometry args={[1.25, 1.25, 0.16, 48, 1, true]} /><meshBasicMaterial color="#0d2e66" side={THREE.BackSide} /></mesh>
      {/* glass ring top with radial light lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y, 0]}>
        <ringGeometry args={[1.25, 3.05, 72, 1]} />
        <meshBasicMaterial map={top} transparent opacity={0.9} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y - 0.12, 0]}>
        <ringGeometry args={[1.3, 3.0, 72, 1]} />
        <meshBasicMaterial color="#6fb8ff" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* LED edge band with mirrored 'pasapalabra' */}
      <mesh position={[0, Y - 0.07, 0]}><cylinderGeometry args={[3.06, 3.06, 0.16, 96, 1, true]} /><meshBasicMaterial map={led} toneMapped={false} /></mesh>
      {/* glowing light ring around the centre */}
      <NeonRing r={1.28} y={Y + 0.01} tube={0.03} color="#ffffff" halo="#5fd0ff" />
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, Y + 0.012, 0]}><ringGeometry args={[1.3, 1.55, 64]} /><meshBasicMaterial color="#8fe0ff" transparent opacity={0.4} blending={add} depthWrite={false} /></mesh>
      <NeonRing r={3.07} y={Y + 0.01} tube={0.02} color="#bfe6ff" />
      {/* thin glass legs */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.2
        return <mesh key={i} position={[Math.sin(a) * 2.85, Y / 2, Math.cos(a) * 2.85]}><cylinderGeometry args={[0.02, 0.02, Y, 6]} /><meshBasicMaterial color="#cfe6ff" transparent opacity={0.6} /></mesh>
      })}
    </group>
  )
}

function Stool({ angle, r = 3.75 }: { angle: number; r?: number }) {
  const x = Math.sin(angle) * r, z = Math.cos(angle) * r
  const black = <meshStandardMaterial color="#15171c" roughness={0.45} metalness={0.4} />
  return (
    <group position={[x, 0.26, z]} rotation={[0, angle + Math.PI, 0]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.sin((i / 5) * Math.PI * 2) * 0.25, 0.03, Math.cos((i / 5) * Math.PI * 2) * 0.25]} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.5]} />{black}
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.025, 0.025, 0.85, 8]} /><meshStandardMaterial color="#9aa3b0" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2, 0.012, 6, 24]} /><meshStandardMaterial color="#9aa3b0" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, 0.9, 0]}><boxGeometry args={[0.46, 0.06, 0.44]} />{black}</mesh>
      <mesh position={[0, 1.22, 0.21]} rotation={[-0.12, 0, 0]}><boxGeometry args={[0.44, 0.56, 0.04]} />{black}</mesh>
    </group>
  )
}

function Screen({ map, position, rotY = 0, size, halo = '#5fb8ff' }: { map: THREE.Texture; position: [number, number, number]; rotY?: number; size: [number, number]; halo?: string }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, -0.06]}><boxGeometry args={[size[0] + 0.18, size[1] + 0.18, 0.1]} /><meshLambertMaterial color="#0b1430" /></mesh>
      <mesh><planeGeometry args={size} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>
      <mesh position={[0, 0, -0.12]}><planeGeometry args={[size[0] * 1.35, size[1] * 1.3]} /><meshBasicMaterial color={halo} transparent opacity={0.16} blending={add} depthWrite={false} /></mesh>
    </group>
  )
}

function Walls() {
  const wall = useMemo(() => T.ledWallTexture(), [])
  const sideA = useMemo(() => T.sidePanelTexture(21), [])
  const sideB = useMemo(() => T.sidePanelTexture(42), [])
  const oranges = useMemo(() => [T.orangePanelTexture('H', 1), T.orangePanelTexture('H', 2), T.orangePanelTexture('D', 3)], [])
  const dots = useMemo(() => T.dotsWallTexture(), [])
  const band = useMemo(() => { const t = T.ledBandTexture(false); t.wrapS = THREE.RepeatWrapping; t.repeat.x = -6; return t }, [])
  const cyan = useMemo(() => { const t = T.ledBandTexture(false, '#7fd0ff', '#3c9cf0', 'rgba(255,255,255,.0)'); t.wrapS = THREE.RepeatWrapping; t.repeat.x = -4; return t }, [])
  return (
    <group>
      {/* dotted LED backdrop */}
      <mesh position={[0, 6, 0]}><cylinderGeometry args={[17, 17, 12, 64, 1, true]} /><meshBasicMaterial map={dots} side={THREE.BackSide} toneMapped={false} /></mesh>
      {/* light cyan band mid-height */}
      <mesh position={[0, 6.2, 0]}><cylinderGeometry args={[16.6, 16.6, 1.6, 64, 1, true, 150 * D2R, 230 * D2R]} /><meshBasicMaterial map={cyan} side={THREE.BackSide} transparent opacity={0.85} toneMapped={false} /></mesh>
      {/* top LED band 'pasapalabra' */}
      <mesh position={[0, 7.6, 0]}><cylinderGeometry args={[14.6, 14.6, 1.7, 96, 1, true, 130 * D2R, 250 * D2R]} /><meshBasicMaterial map={band} side={THREE.BackSide} toneMapped={false} /></mesh>
      {/* main video wall + side panels */}
      <Screen map={wall} position={[-3.6, 3.05, -10.6]} rotY={0.1} size={[10.4, 5.4]} />
      <Screen map={sideA} position={[-10.0, 3.05, -9.3]} rotY={0.55} size={[1.8, 5.4]} />
      <Screen map={sideB} position={[-12.0, 3.05, -7.6]} rotY={0.75} size={[1.8, 5.4]} />
      <Screen map={sideA} position={[-14.0, 3.05, -4.8]} rotY={1.05} size={[2.2, 5.4]} />
      {/* 3 orange panels */}
      {oranges.map((m, i) => (
        <Screen key={i} map={m} position={[2.9 + i * 2.0, 3.1, -10.4 + i * 0.25]} rotY={-0.12} size={[1.55, 5.6]} halo="#ff9a40" />
      ))}
    </group>
  )
}

function SillaArea() {
  const podA = useMemo(() => T.podiumTexture('#1f7fe6'), [])
  const podB = useMemo(() => T.podiumTexture('#ff8a2a'), [])
  return (
    <group position={[-6.6, 0, -5.4]}>
      <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[2.7, 2.8, 0.44, 56]} /><meshLambertMaterial color="#eef3fb" emissive="#3a4d70" emissiveIntensity={0.25} /></mesh>
      <NeonRing r={2.72} y={0.44} tube={0.025} />
      {[[-0.8, 0.2, podA], [0.9, -0.3, podB]].map(([x, z, m], i) => (
        <group key={i} position={[x as number, 0.44, z as number]}>
          <mesh position={[0, 0.55, 0]}><cylinderGeometry args={[0.2, 0.32, 1.1, 20]} /><meshLambertMaterial map={m as THREE.Texture} emissive="#55607a" emissiveIntensity={0.3} /></mesh>
          <mesh position={[0, 1.13, 0]}><cylinderGeometry args={[0.42, 0.42, 0.05, 28]} /><meshBasicMaterial color="#cfe8ff" transparent opacity={0.75} /></mesh>
          <NeonRingSmall y={1.16} />
        </group>
      ))}
    </group>
  )
}
function NeonRingSmall({ y }: { y: number }) {
  return <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.42, 0.012, 6, 32]} /><meshBasicMaterial color="#9fe2ff" toneMapped={false} /></mesh>
}

function Gradas() {
  const word = useMemo(() => T.gradasTexture(true, 1), [])
  const lets = useMemo(() => [T.gradasTexture(false, 2), T.gradasTexture(false, 3), T.gradasTexture(false, 4), T.gradasTexture(false, 5)], [])
  const th0 = 42 * D2R, L = 100 * D2R
  const tiers = [0, 1, 2, 3, 4]
  return (
    <group>
      {tiers.map((i) => {
        const r = 9.7 + i * 1.0, h = 0.72
        const top = (i + 1) * h
        return (
          <group key={i}>
            <mesh position={[0, top - h / 2, 0]}><cylinderGeometry args={[r, r, h, 64, 1, true, th0, L]} /><meshBasicMaterial map={i === 0 ? word : lets[(i - 1) % 4]} side={THREE.DoubleSide} toneMapped={false} /></mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, top, 0]}><ringGeometry args={[r, r + 1.0, 64, 1, th0 - Math.PI / 2, L]} /><meshLambertMaterial color="#dfe7f3" side={THREE.DoubleSide} /></mesh>
            {/* glowing edge line */}
            <mesh position={[0, top + 0.01, 0]}><cylinderGeometry args={[r + 0.01, r + 0.01, 0.03, 64, 1, true, th0, L]} /><meshBasicMaterial color="#e8f6ff" toneMapped={false} side={THREE.DoubleSide} /></mesh>
          </group>
        )
      })}
      {/* back fill to hide the void under the tiers */}
      <mesh position={[0, 1.8, 0]}><cylinderGeometry args={[14.7, 14.7, 3.6, 64, 1, true, th0, L]} /><meshLambertMaterial color="#1a2c63" side={THREE.DoubleSide} /></mesh>
      {/* stairs at the back end */}
      {Array.from({ length: 9 }).map((_, i) => {
        const a = th0 + L + 2 * D2R, r = 9.9 + i * 0.5
        return <mesh key={i} position={[Math.sin(a) * r, 0.2 + i * 0.4, Math.cos(a) * r]} rotation={[0, a, 0]}><boxGeometry args={[1.4, 0.4, 0.5]} /><meshLambertMaterial color="#2b3446" /></mesh>
      })}
      {/* upper balcony */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 4.47, 0]}><ringGeometry args={[12.9, 16.5, 64, 1, 35 * D2R - Math.PI / 2, 120 * D2R]} /><meshLambertMaterial color="#e8eef8" emissive="#8090b0" emissiveIntensity={0.3} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 4.3, 0]}><cylinderGeometry args={[12.9, 12.9, 0.35, 64, 1, true, 35 * D2R, 120 * D2R]} /><meshLambertMaterial color="#f2f6fc" emissive="#a0b0d0" emissiveIntensity={0.4} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 4.75, 0]}><cylinderGeometry args={[12.9, 12.9, 0.7, 64, 1, true, 35 * D2R, 120 * D2R]} /><meshBasicMaterial color="#9fd6ff" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <mesh position={[0, 4.12, 0]}><cylinderGeometry args={[12.92, 12.92, 0.04, 64, 1, true, 35 * D2R, 120 * D2R]} /><meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

function MovingHead({ position, phase, color = '#cfe6ff' }: { position: [number, number, number]; phase: number; color?: string }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.4 + phase
    if (ref.current) { ref.current.rotation.z = Math.sin(t) * 0.45; ref.current.rotation.x = Math.cos(t * 0.8) * 0.3 }
  })
  return (
    <group position={position}>
      <mesh><boxGeometry args={[0.36, 0.3, 0.36]} /><meshLambertMaterial color="#111318" /></mesh>
      <group ref={ref}>
        <mesh position={[0, -0.25, 0]}><cylinderGeometry args={[0.14, 0.16, 0.3, 12]} /><meshLambertMaterial color="#1b1e25" /></mesh>
        <mesh position={[0, -0.41, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.12, 16]} /><meshBasicMaterial color="#ffffff" /></mesh>
        <mesh position={[0, -4.6, 0]}><coneGeometry args={[1.25, 8.4, 20, 1, true]} /><meshBasicMaterial color={color} transparent opacity={0.07} blending={add} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      </group>
    </group>
  )
}

function Truss() {
  const mat = <meshLambertMaterial color="#2a2f3a" />
  const bars: [number, number, number, number, number, number][] = [
    [0, 10.6, -7, 28, 0.35, 0.35], [0, 10.6, 0, 28, 0.35, 0.35], [0, 10.6, 7, 28, 0.35, 0.35],
    [-8, 10.6, 0, 0.35, 0.35, 16], [8, 10.6, 0, 0.35, 0.35, 16]
  ]
  return (
    <group>
      <mesh position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[17.5, 32]} /><meshBasicMaterial color="#05070f" side={THREE.DoubleSide} /></mesh>
      {bars.map(([x, y, z, w, h, d], i) => <mesh key={i} position={[x, y, z]}><boxGeometry args={[w, h, d]} />{mat}</mesh>)}
      {[-10, -5, 0, 5, 10].map((x, i) => <MovingHead key={'a' + i} position={[x, 10.25, -7]} phase={i * 1.3} />)}
      {[-6, 2, 9].map((x, i) => <MovingHead key={'b' + i} position={[x, 10.25, 0]} phase={i * 2.1 + 0.5} color="#9fd0ff" />)}
      {/* balcony moving heads (visible on the right in the photos) */}
      {[50, 72, 94, 116, 138].map((deg, i) => <MovingHead key={'c' + i} position={[Math.sin(deg * D2R) * 13.8, 4.65, Math.cos(deg * D2R) * 13.8]} phase={i} />)}
      {/* spotlight cans */}
      {[-12, -8, -3, 3, 8, 12].map((x, i) => (
        <group key={'s' + i} position={[x, 10.3, 7]}>
          <mesh><cylinderGeometry args={[0.18, 0.22, 0.4, 10]} /><meshLambertMaterial color="#14161c" /></mesh>
          <Glow position={[0, -0.25, 0]} scale={0.7} color="#ffffff" opacity={0.8} />
        </group>
      ))}
    </group>
  )
}

function Jib() {
  const arm = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!arm.current) return
    const t = clock.elapsedTime * 0.15
    arm.current.rotation.y = -0.9 + Math.sin(t) * 0.35
    arm.current.rotation.z = 0.22 + Math.sin(t * 1.3) * 0.06
  })
  const dark = <meshLambertMaterial color="#1a1d24" />
  return (
    <group position={[-10.6, 0, 2.6]}>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return <mesh key={i} position={[Math.sin(a) * 0.5, 0.9, Math.cos(a) * 0.5]} rotation={[Math.cos(a) * 0.45, 0, -Math.sin(a) * 0.45]}><cylinderGeometry args={[0.04, 0.04, 2, 6]} />{dark}</mesh>
      })}
      <mesh position={[0, 1.9, 0]}><cylinderGeometry args={[0.1, 0.12, 0.8, 10]} />{dark}</mesh>
      <group ref={arm} position={[0, 2.4, 0]}>
        <mesh position={[3.2, 0, 0]}><boxGeometry args={[9.5, 0.22, 0.22]} />{dark}</mesh>
        <mesh position={[-1.6, -0.15, 0]}><boxGeometry args={[0.7, 0.5, 0.5]} /><meshLambertMaterial color="#2c313b" /></mesh>
        <group position={[7.9, -0.3, 0]}>
          <mesh><boxGeometry args={[0.6, 0.45, 0.4]} />{dark}</mesh>
          <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.13, 0.15, 0.35, 12]} />{dark}</mesh>
          <mesh position={[0.58, 0, 0]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.11, 12]} /><meshBasicMaterial color="#3a6cff" /></mesh>
        </group>
      </group>
    </group>
  )
}

/** Standing monitor that faces the centre of the set, placed just outside a floor spot. */
function SpotMonitor({ pos, face, map, accent }: { pos: [number, number]; face: [number, number]; map: THREE.Texture; accent: string }) {
  const yaw = Math.atan2(face[0] - pos[0], face[1] - pos[1])
  return (
    <group position={[pos[0], 0, pos[1]]} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.65, -0.28]}><cylinderGeometry args={[0.07, 0.1, 1.3, 12]} /><meshLambertMaterial color="#c9d6ea" /></mesh>
      <mesh position={[0, 0.03, -0.28]}><cylinderGeometry args={[0.55, 0.6, 0.06, 24]} /><meshLambertMaterial color="#c9d6ea" /></mesh>
      <mesh position={[0, 2.25, -0.06]}><boxGeometry args={[2.36, 2.36, 0.1]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
      <mesh position={[0, 2.25, 0]}><planeGeometry args={[2.2, 2.2]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>
    </group>
  )
}
function SopaPanel() { const m = useMemo(() => T.sopaBoardTexture(), []); return <SpotMonitor pos={[-9.0, 6.4]} face={[0, 6]} map={m} accent="#5fe07a" /> }
function DondePanel() { const m = useMemo(() => T.dondeBoardTexture(), []); return <SpotMonitor pos={[8.5, 2.5]} face={[0, 7]} map={m} accent="#4cc8ff" /> }

export const SOPA_SPOT: [number, number, number] = [-7.4, 0, 5.0]
export const DONDE_SPOT: [number, number, number] = [7.4, 0, 4.2]
export const ALAZ_SPOT: [number, number, number] = [-3.2, 0, 7.8]

export function UdcSpot({ position, color = '#ffd27a', rim = '#fff2cf', beam = '#ffe2a6' }: { position: [number, number, number]; color?: string; rim?: string; beam?: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => { if (ref.current) (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(clock.elapsedTime * 2.5) * 0.15 })
  return (
    <group position={position}>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><circleGeometry args={[1.1, 40]} /><meshBasicMaterial color={color} transparent opacity={0.55} blending={add} depthWrite={false} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}><ringGeometry args={[1.05, 1.15, 48]} /><meshBasicMaterial color={rim} toneMapped={false} /></mesh>
      <mesh position={[0, 4.5, 0]}><coneGeometry args={[1.1, 9, 24, 1, true]} /><meshBasicMaterial color={beam} transparent opacity={0.08} blending={add} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

export function StudioSet() {
  return (
    <group>
      <Reflections />
      <Floor />
      <Platform />
      <RoscoTable />
      {[-62, -24, 24, 62].map((d) => <Stool key={d} angle={d * D2R} />)}
      <Walls />
      <SillaArea />
      <Gradas />
      <Truss />
      <Jib />
      <UdcSpot position={[5.2, 0, -6.4]} />
      <UdcSpot position={SOPA_SPOT} color="#5fe07a" rim="#e6ffe9" beam="#b8ffc6" />
      <SopaPanel />
      <UdcSpot position={DONDE_SPOT} color="#4cc8ff" rim="#e3f7ff" beam="#b6ecff" />
      <DondePanel />
      <UdcSpot position={ALAZ_SPOT} color="#ff7a7a" rim="#ffe3e3" beam="#ffb6b6" />
    </group>
  )
}
