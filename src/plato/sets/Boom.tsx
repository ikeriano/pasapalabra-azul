import { useMemo } from 'react'
import * as THREE from 'three'
import { logoScreenTex } from './textures'
const add = THREE.AdditiveBlending

export function BoomSet() {
  const logo = useMemo(() => logoScreenTex('¡BOOM!', ''), [])
  return (
    <group>
      {/* orange concentric floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[13, 64]} />
        <meshLambertMaterial color="#1a0a08" />
      </mesh>
      {[3, 5, 7, 9, 11].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02 + i * 0.001, 0]}>
          <ringGeometry args={[r - 0.12, r, 64]} />
          <meshBasicMaterial color={i % 2 ? '#ff6a1a' : '#ff3a00'} toneMapped={false} />
        </mesh>
      ))}

      {/* curved contestant desk */}
      <mesh position={[0, 0.55, 2.2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[3.2, 0.35, 8, 32, Math.PI]} />
        <meshLambertMaterial color="#2a1810" />
      </mesh>
      <mesh position={[0, 0.95, 2.0]}>
        <boxGeometry args={[5.5, 0.12, 1.1]} />
        <meshLambertMaterial color="#3a2218" />
      </mesh>
      {/* bomb props */}
      {[-1.8, 0, 1.8].map((x, i) => (
        <group key={i} position={[x, 1.15, 1.7]}>
          <mesh><sphereGeometry args={[0.28, 12, 10]} /><meshLambertMaterial color="#1a1a1a" /></mesh>
          <mesh position={[0, 0.32, 0]}><cylinderGeometry args={[0.05, 0.05, 0.2, 6]} /><meshLambertMaterial color="#888" /></mesh>
          <mesh position={[0, 0.45, 0]}><sphereGeometry args={[0.06, 6, 6]} /><meshBasicMaterial color="#ff3300" toneMapped={false} /></mesh>
        </group>
      ))}

      {/* hexagonal neon backdrop */}
      <group position={[0, 3.5, -9]}>
        <mesh><boxGeometry args={[10, 5.5, 0.2]} /><meshLambertMaterial color="#120806" /></mesh>
        <mesh position={[0, 0, 0.12]}><planeGeometry args={[8, 3.5]} /><meshBasicMaterial map={logo} toneMapped={false} /></mesh>
        {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
          <mesh key={i} position={[x, 1.8, 0.15]}>
            <cylinderGeometry args={[0.55, 0.55, 0.08, 6]} />
            <meshBasicMaterial color="#ff6a1a" transparent opacity={0.7} blending={add} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* dark walls */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[13.5, 13.5, 8, 48, 1, true]} />
        <meshBasicMaterial color="#0c0604" side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 32]} />
        <meshBasicMaterial color="#080402" side={THREE.DoubleSide} />
      </mesh>
      {[0, 90, 180, 270].map((d, i) => {
        const a = (d * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.sin(a) * 2, 5, Math.cos(a) * 2]}>
            <coneGeometry args={[1, 7, 10, 1, true]} />
            <meshBasicMaterial color="#ff8020" transparent opacity={0.06} blending={add} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}
