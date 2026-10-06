import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { logoScreenTex } from './textures'
const add = THREE.AdditiveBlending

export function RuedaSet() {
  const logo = useMemo(() => logoScreenTex('RUEDA', 'LA LETRA'), [])
  const spin = useRef<THREE.Group>(null)
  useFrame((_, dt) => { if (spin.current) spin.current.rotation.y += dt * 0.2 })

  const floorLetters = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 1024
    const g = c.getContext('2d')!
    g.fillStyle = '#0a1535'; g.fillRect(0, 0, 1024, 1024)
    g.fillStyle = 'rgba(180,210,255,.35)'
    g.font = "900 90px 'Nunito', sans-serif"
    const chars = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
    for (let i = 0; i < 40; i++) {
      g.save()
      g.translate(80 + (i * 97) % 900, 80 + Math.floor(i / 5) * 110)
      g.rotate((i % 5) * 0.2)
      g.fillText(chars[i % chars.length], 0, 0)
      g.restore()
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[13, 64]} />
        <meshLambertMaterial map={floorLetters} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[5.2, 5.4, 0.35, 48]} />
        <meshLambertMaterial color="#e8eef8" emissive="#3a4d70" emissiveIntensity={0.25} />
      </mesh>

      {/* LED wall with letter sphere */}
      <group position={[0, 3.2, -10.5]}>
        <mesh><boxGeometry args={[10, 5.5, 0.2]} /><meshBasicMaterial color="#0a2a6a" toneMapped={false} /></mesh>
        <mesh position={[0, -0.3, 0.12]}><planeGeometry args={[7, 1.6]} /><meshBasicMaterial map={logo} toneMapped={false} /></mesh>
        <group ref={spin} position={[0, 0.9, 0.4]}>
          {Array.from({ length: 48 }).map((_, i) => {
            const y = 1 - (i / 47) * 2
            const r = Math.sqrt(Math.max(0, 1 - y * y))
            const th = i * 2.4
            const x = Math.cos(th) * r * 1.3
            const z = Math.sin(th) * r * 1.3
            return (
              <mesh key={i} position={[x, y * 1.3, z]}>
                <boxGeometry args={[0.22, 0.22, 0.05]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
              </mesh>
            )
          })}
          <mesh><sphereGeometry args={[1.05, 16, 12]} /><meshBasicMaterial color="#4aa8ff" transparent opacity={0.25} /></mesh>
        </group>
      </group>

      {/* orange side discs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 8.5, 2.8, -4]} rotation={[0, -s * 0.4, 0]}>
          <cylinderGeometry args={[2.2, 2.2, 0.2, 32]} />
          <meshBasicMaterial color="#ff8a2a" toneMapped={false} />
        </mesh>
      ))}

      <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 32]} />
        <meshBasicMaterial color="#050a1e" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 4, 0]}>
        <coneGeometry args={[1.2, 8, 12, 1, true]} />
        <meshBasicMaterial color="#7fb8ff" transparent opacity={0.06} blending={add} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
