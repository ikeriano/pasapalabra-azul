import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
const add = THREE.AdditiveBlending

function viajarLabelTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160
  const g = c.getContext('2d')!
  g.clearRect(0, 0, 512, 160)
  // pill bg
  g.fillStyle = 'rgba(10,40,100,.85)'
  round(g, 24, 28, 464, 104, 52); g.fill()
  g.strokeStyle = '#9fe8ff'; g.lineWidth = 8
  round(g, 24, 28, 464, 104, 52); g.stroke()
  g.font = "900 72px 'Nunito', sans-serif"
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillStyle = '#ffffff'
  g.shadowColor = 'rgba(100,220,255,.95)'; g.shadowBlur = 18
  g.fillText('VIAJAR', 256, 84)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
function round(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

/** Tall glowing travel arch — always readable VIAJAR label + beam. */
export function Portal({ position, yaw = 0 }: { position: [number, number, number]; yaw?: number }) {
  const spin = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Mesh>(null)
  const label = useMemo(() => viajarLabelTex(), [])
  const parts = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    a: (i / 18) * Math.PI * 2, r: 0.35 + (i % 3) * 0.12, speed: 0.8 + (i % 5) * 0.15, phase: i
  })), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (spin.current) spin.current.rotation.y = t * 1.2
    if (glow.current) (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(t * 3.2) * 0.2
  })

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* pillars */}
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 2.1, 0]}>
          <boxGeometry args={[0.35, 4.2, 0.35]} />
          <meshLambertMaterial color="#0a1a40" emissive="#1a6adf" emissiveIntensity={0.85} />
        </mesh>
      ))}
      {/* arch top */}
      <mesh position={[0, 4.25, 0]}>
        <boxGeometry args={[2.7, 0.35, 0.35]} />
        <meshLambertMaterial color="#0a1a40" emissive="#3a9dff" emissiveIntensity={1} />
      </mesh>
      {/* bright rim frame */}
      <mesh position={[0, 2.1, 0.02]}>
        <boxGeometry args={[2.5, 4.3, 0.08]} />
        <meshBasicMaterial color="#7fd8ff" transparent opacity={0.35} blending={add} depthWrite={false} />
      </mesh>
      {/* inner portal plane */}
      <mesh ref={glow} position={[0, 2.1, 0]}>
        <planeGeometry args={[2.0, 3.8]} />
        <meshBasicMaterial color="#4ec8ff" transparent opacity={0.55} blending={add} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* spinning ring */}
      <group ref={spin} position={[0, 2.1, 0.06]}>
        <mesh>
          <torusGeometry args={[1.05, 0.07, 8, 32]} />
          <meshBasicMaterial color="#e8ffff" toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.75, 0.045, 8, 28]} />
          <meshBasicMaterial color="#9fe8ff" toneMapped={false} />
        </mesh>
      </group>
      {/* floor glow disc */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial color="#3a9dff" transparent opacity={0.45} blending={add} depthWrite={false} />
      </mesh>
      {/* upward light beam */}
      <mesh position={[0, 3.2, 0]}>
        <coneGeometry args={[1.1, 6.2, 16, 1, true]} />
        <meshBasicMaterial color="#8fd8ff" transparent opacity={0.14} blending={add} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* floating particles */}
      {parts.map((p, i) => (
        <PortalSpark key={i} a={p.a} r={p.r} speed={p.speed} phase={p.phase} />
      ))}
      {/* ALWAYS-VISIBLE VIAJAR label */}
      <sprite position={[0, 4.85, 0]} scale={[3.6, 1.15, 1]} renderOrder={20}>
        <spriteMaterial map={label} transparent depthTest={false} depthWrite={false} toneMapped={false} />
      </sprite>
      {/* ground chevron markers */}
      {[-0.9, 0, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 0.06, 1.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.18, 3]} />
          <meshBasicMaterial color="#ffe27a" toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function PortalSpark({ a, r, speed, phase }: { a: number; r: number; speed: number; phase: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * speed + phase
    const y = 0.4 + ((t * 0.7) % 3.6)
    ref.current.position.set(Math.cos(a + t * 0.4) * r, y, Math.sin(a + t * 0.4) * r)
    ;(ref.current.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(t * 2) * 0.35
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshBasicMaterial color="#d8f6ff" transparent opacity={0.7} blending={add} depthWrite={false} />
    </mesh>
  )
}
