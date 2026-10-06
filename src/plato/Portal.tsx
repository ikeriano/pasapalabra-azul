import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
const add = THREE.AdditiveBlending

export function Portal({ position, yaw = 0 }: { position: [number, number, number]; yaw?: number }) {
  const ring = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ring.current) ring.current.rotation.z = t * 0.6
    if (glow.current) (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(t * 3) * 0.15
  })
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.25, 3.2, 1.8]} />
        <meshLambertMaterial color="#1a2a4a" emissive="#1a4aaa" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={glow} position={[0, 1.5, 0.05]}>
        <planeGeometry args={[1.4, 2.8]} />
        <meshBasicMaterial color="#5ec8ff" transparent opacity={0.4} blending={add} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring} position={[0, 1.5, 0.08]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.85, 0.06, 8, 24]} />
        <meshBasicMaterial color="#9fe8ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 24]} />
        <meshBasicMaterial color="#3a9dff" transparent opacity={0.35} blending={add} depthWrite={false} />
      </mesh>
    </group>
  )
}
