import { useMemo } from 'react'
import * as THREE from 'three'
import { LetterGlobeOutward } from '../LetterGlobe'
import * as T from '../textures'
import { letterFloorTex, ribbonTex } from './textures'
const add = THREE.AdditiveBlending

export function RuedaSet() {
  // LetterGlobe may live in Set if LetterGlobe.tsx missing — handle both
  const floor = useMemo(() => letterFloorTex('#0a2868', 'rgba(210,230,255,.5)'), [])
  const bg = useMemo(() => T.ledWallTexture(), [])
  const word = useMemo(() => T.ruedaWordmarkTexture(), [])
  const glow = useMemo(() => T.sphereGlowTexture(), [])
  const ribbon = useMemo(() => ribbonTex('Rueda la letra'), [])

  return (
    <group>
      {/* glossy blue letter floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[13.5, 64]} />
        <meshStandardMaterial map={floor} metalness={0.45} roughness={0.22} />
      </mesh>

      {/* raised white semi platform */}
      <mesh position={[0, 0.18, -1.5]}>
        <cylinderGeometry args={[4.6, 4.8, 0.32, 48, 1, false, -0.2, Math.PI + 0.4]} />
        <meshLambertMaterial color="#eef3fb" emissive="#4a6aaa" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.02, -1.5]}>
        <torusGeometry args={[4.7, 0.04, 6, 48, Math.PI + 0.4]} />
        <meshBasicMaterial color="#9fd0ff" toneMapped={false} />
      </mesh>

      {/* vertical blue panels with neon strips */}
      {Array.from({ length: 14 }).map((_, i) => {
        const a = -0.9 + (i / 13) * 1.8
        const r = 12.2
        return (
          <group key={i} position={[Math.sin(a) * r, 3.2, -Math.cos(a) * r - 2]} rotation={[0, -a, 0]}>
            <mesh><boxGeometry args={[1.55, 6.2, 0.15]} /><meshLambertMaterial color="#0a3a8a" emissive="#0a2860" emissiveIntensity={0.35} /></mesh>
            <mesh position={[0.78, 0, 0.02]}><boxGeometry args={[0.06, 6.0, 0.04]} /><meshBasicMaterial color="#8fd8ff" toneMapped={false} /></mesh>
          </group>
        )
      })}

      {/* LED wall: rotating sphere + FIXED wordmark */}
      <group position={[0, 3.2, -10.5]}>
        <mesh position={[0, 0, -0.06]}><boxGeometry args={[11.2, 5.8, 0.12]} /><meshLambertMaterial color="#0b1430" /></mesh>
        <mesh><planeGeometry args={[11.0, 5.6]} /><meshBasicMaterial map={bg} toneMapped={false} /></mesh>
        <sprite position={[0.05, 0.15, 0.02]} scale={[5.2, 5.2, 1]}>
          <spriteMaterial map={glow} transparent depthWrite={false} blending={add} toneMapped={false} />
        </sprite>
        <group position={[0.05, 0.15, 0.38]}>
          <LetterGlobeOutward radius={1.9} />
        </group>
        <mesh position={[0.05, 0.25, 0.75]}>
          <planeGeometry args={[7.6, 1.9]} />
          <meshBasicMaterial map={word} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      {/* overhead curved ribbon */}
      <mesh position={[0, 6.6, -3]} rotation={[0.12, 0, 0]}>
        <cylinderGeometry args={[9.5, 9.5, 0.55, 48, 1, true, -0.7, 1.4]} />
        <meshBasicMaterial map={ribbon} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* orange side discs with glowing ring + mini globe hint */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 8.8, 3.0, -3.5]} rotation={[0, -s * 0.45, 0]}>
          <mesh><cylinderGeometry args={[2.15, 2.15, 0.18, 36]} /><meshBasicMaterial color="#ff8a2a" toneMapped={false} /></mesh>
          <mesh position={[0, 0, 0.12]}><circleGeometry args={[1.05, 28]} /><meshBasicMaterial color="#c41c1c" toneMapped={false} /></mesh>
          <mesh position={[0, 0, 0.14]}><torusGeometry args={[2.2, 0.07, 6, 36]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
        </group>
      ))}

      {/* glass desk booth right with neon letter outlines */}
      <group position={[6.2, 0, 3.5]}>
        <mesh position={[0, 0.85, 0]}><boxGeometry args={[2.4, 0.12, 1.3]} /><meshLambertMaterial color="#1a2a4a" /></mesh>
        {[[-1.1, 0], [1.1, 0], [0, -0.6]].map(([x, z], i) => (
          <mesh key={i} position={[x, 1.4, z]}>
            <boxGeometry args={[0.06, 1.5, 1.1]} />
            <meshBasicMaterial color="#7fd0ff" transparent opacity={0.25} />
          </mesh>
        ))}
        {['R', 'G', 'S'].map((ch, i) => (
          <mesh key={ch} position={[-0.6 + i * 0.6, 1.55, -0.55]}>
            <planeGeometry args={[0.4, 0.45]} />
            <meshBasicMaterial color="#5ec8ff" transparent opacity={0.7} toneMapped={false} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 10.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14.5, 32]} />
        <meshBasicMaterial color="#050a1e" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 5, 0]}>
        <coneGeometry args={[1.3, 8, 12, 1, true]} />
        <meshBasicMaterial color="#7fb8ff" transparent opacity={0.06} blending={add} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
