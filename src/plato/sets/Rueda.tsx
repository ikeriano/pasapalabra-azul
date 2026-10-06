import { useMemo } from 'react'
import * as THREE from 'three'
import { LetterGlobeOutward } from '../Set'
import * as T from '../textures'
const add = THREE.AdditiveBlending

export function RuedaSet() {
  const floorLetters = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 1024
    const g = c.getContext('2d')!
    g.fillStyle = '#0a1535'; g.fillRect(0, 0, 1024, 1024)
    g.fillStyle = 'rgba(180,210,255,.38)'
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
  const bg = useMemo(() => T.ledWallTexture(), [])
  const word = useMemo(() => T.ruedaWordmarkTexture(), [])
  const glow = useMemo(() => T.sphereGlowTexture(), [])

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

      {/* LED: rotating letter sphere + FIXED wordmark */}
      <group position={[0, 3.15, -10.4]}>
        <mesh position={[0, 0, -0.06]}><boxGeometry args={[10.58, 5.58, 0.1]} /><meshLambertMaterial color="#0b1430" /></mesh>
        <mesh><planeGeometry args={[10.4, 5.4]} /><meshBasicMaterial map={bg} toneMapped={false} /></mesh>
        <sprite position={[0.05, 0.1, 0.02]} scale={[5.0, 5.0, 1]}>
          <spriteMaterial map={glow} transparent depthWrite={false} blending={add} toneMapped={false} />
        </sprite>
        <group position={[0.05, 0.1, 0.35]}>
          <LetterGlobeOutward radius={1.85} />
        </group>
        <mesh position={[0.05, 0.2, 0.72]}>
          <planeGeometry args={[7.4, 1.85]} />
          <meshBasicMaterial map={word} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.12]}>
          <planeGeometry args={[10.4 * 1.3, 5.4 * 1.25]} />
          <meshBasicMaterial color="#5fb8ff" transparent opacity={0.16} blending={add} depthWrite={false} />
        </mesh>
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
    </group>
  )
}
