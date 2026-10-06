import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SKIN = '#a8d4f0'
const HAIR = '#6b4428'
const HAIR2 = '#8a5a32'
const HOODIE = '#e91e8c'
const HOODIE_DARK = '#c41874'
const PANTS = '#2a2d33'
const SHOE = '#f2f4f8'
const SOLE = '#9fd0f0'

function peaceTexture() {
  const c = document.createElement('canvas')
  c.width = 128; c.height = 128
  const g = c.getContext('2d')!
  g.clearRect(0, 0, 128, 128)
  g.fillStyle = '#ffffff'
  // palm
  g.beginPath()
  g.ellipse(64, 78, 22, 26, 0, 0, Math.PI * 2)
  g.fill()
  // peace fingers (index + middle)
  g.fillRect(50, 22, 12, 48)
  g.fillRect(66, 18, 12, 52)
  // curled ring + pinky
  g.beginPath(); g.ellipse(86, 70, 8, 14, 0.4, 0, Math.PI * 2); g.fill()
  g.beginPath(); g.ellipse(96, 78, 7, 11, 0.5, 0, Math.PI * 2); g.fill()
  // thumb
  g.beginPath(); g.ellipse(40, 82, 10, 16, -0.6, 0, Math.PI * 2); g.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}

export type AvatarAnim = { moving: boolean; grounded: boolean; speed: number }

/** Blocky tablet-friendly avatar — pastel blue head/hands, magenta hoodie, dark pants. */
export function Avatar({
  getPose, anim, visible = true
}: {
  getPose: () => { x: number; y: number; z: number; yaw: number }
  anim: React.MutableRefObject<AvatarAnim>
  visible?: boolean
}) {
  const root = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const peace = useMemo(() => peaceTexture(), [])
  const phase = useRef(0)

  useFrame((_, dt) => {
    if (!root.current) return
    const p = getPose()
    root.current.visible = visible
    root.current.rotation.y = p.yaw
    const a = anim.current
    const moving = a.moving && a.grounded
    if (moving) phase.current += dt * (8 + a.speed * 2)
    else if (!a.grounded) phase.current += dt * 2
    else phase.current *= 0.9
    const swing = moving ? Math.sin(phase.current) * 0.7 : (!a.grounded ? 0.55 : Math.sin(phase.current) * 0.05)
    const bob = moving ? Math.abs(Math.sin(phase.current)) * 0.04 : 0
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
    if (armL.current) armL.current.rotation.x = -swing * 0.85
    if (armR.current) armR.current.rotation.x = swing * 0.85
    root.current.position.set(p.x, p.y + bob, p.z)
  })

  return (
    <group ref={root}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.45, 20]} />
        <meshBasicMaterial color="#041028" transparent opacity={0.32} depthWrite={false} />
      </mesh>

      {/* legs + shoes */}
      <group ref={legL} position={[-0.16, 0.55, 0]}>
        <mesh position={[0, -0.28, 0]}><boxGeometry args={[0.28, 0.7, 0.28]} /><meshLambertMaterial color={PANTS} /></mesh>
        <mesh position={[0, -0.68, 0.06]}><boxGeometry args={[0.3, 0.14, 0.42]} /><meshLambertMaterial color={SHOE} /></mesh>
        <mesh position={[0, -0.76, 0.06]}><boxGeometry args={[0.3, 0.06, 0.42]} /><meshLambertMaterial color={SOLE} /></mesh>
      </group>
      <group ref={legR} position={[0.16, 0.55, 0]}>
        <mesh position={[0, -0.28, 0]}><boxGeometry args={[0.28, 0.7, 0.28]} /><meshLambertMaterial color={PANTS} /></mesh>
        <mesh position={[0, -0.68, 0.06]}><boxGeometry args={[0.3, 0.14, 0.42]} /><meshLambertMaterial color={SHOE} /></mesh>
        <mesh position={[0, -0.76, 0.06]}><boxGeometry args={[0.3, 0.06, 0.42]} /><meshLambertMaterial color={SOLE} /></mesh>
      </group>

      {/* torso / hoodie */}
      <mesh position={[0, 1.15, 0]}><boxGeometry args={[0.78, 0.85, 0.42]} /><meshLambertMaterial color={HOODIE} /></mesh>
      <mesh position={[0, 1.52, -0.05]}><boxGeometry args={[0.82, 0.22, 0.48]} /><meshLambertMaterial color={HOODIE_DARK} /></mesh>
      {/* peace graphic */}
      <mesh position={[0, 1.12, 0.215]}>
        <planeGeometry args={[0.42, 0.42]} />
        <meshBasicMaterial map={peace} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      {/* arms */}
      <group ref={armL} position={[-0.52, 1.42, 0]}>
        <mesh position={[0, -0.32, 0]}><boxGeometry args={[0.24, 0.72, 0.24]} /><meshLambertMaterial color={HOODIE} /></mesh>
        <mesh position={[0, -0.74, 0]}><boxGeometry args={[0.22, 0.22, 0.22]} /><meshLambertMaterial color={SKIN} /></mesh>
      </group>
      <group ref={armR} position={[0.52, 1.42, 0]}>
        <mesh position={[0, -0.32, 0]}><boxGeometry args={[0.24, 0.72, 0.24]} /><meshLambertMaterial color={HOODIE} /></mesh>
        <mesh position={[0, -0.74, 0]}><boxGeometry args={[0.22, 0.22, 0.22]} /><meshLambertMaterial color={SKIN} /></mesh>
      </group>

      {/* head + hair + face */}
      <group position={[0, 1.82, 0]}>
        <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.5, 0.5, 0.46]} /><meshLambertMaterial color={SKIN} /></mesh>
        {/* messy blocky hair */}
        <mesh position={[0, 0.48, -0.02]}><boxGeometry args={[0.54, 0.2, 0.5]} /><meshLambertMaterial color={HAIR} /></mesh>
        <mesh position={[-0.16, 0.58, 0.08]}><boxGeometry args={[0.16, 0.2, 0.16]} /><meshLambertMaterial color={HAIR} /></mesh>
        <mesh position={[0.02, 0.62, 0.1]}><boxGeometry args={[0.16, 0.22, 0.16]} /><meshLambertMaterial color={HAIR2} /></mesh>
        <mesh position={[0.18, 0.56, 0.02]}><boxGeometry args={[0.14, 0.18, 0.14]} /><meshLambertMaterial color={HAIR} /></mesh>
        <mesh position={[-0.05, 0.55, -0.18]}><boxGeometry args={[0.4, 0.18, 0.16]} /><meshLambertMaterial color={HAIR} /></mesh>
        <mesh position={[0.2, 0.5, -0.12]}><boxGeometry args={[0.14, 0.14, 0.14]} /><meshLambertMaterial color={HAIR2} /></mesh>
        {/* smiley */}
        <mesh position={[-0.11, 0.24, 0.24]}><boxGeometry args={[0.07, 0.07, 0.03]} /><meshBasicMaterial color="#111820" /></mesh>
        <mesh position={[0.11, 0.24, 0.24]}><boxGeometry args={[0.07, 0.07, 0.03]} /><meshBasicMaterial color="#111820" /></mesh>
        <mesh position={[0, 0.12, 0.24]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.09, 0.016, 6, 10, Math.PI]} />
          <meshBasicMaterial color="#111820" />
        </mesh>
      </group>
    </group>
  )
}
