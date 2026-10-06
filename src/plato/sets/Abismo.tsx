import { useMemo } from 'react'
import * as THREE from 'three'
import { chevronTex, logoScreenTex, radialFloorTex } from './textures'
const add = THREE.AdditiveBlending

export function AbismoSet() {
  const chev = useMemo(() => chevronTex('#0a2468', '#ffd024'), [])
  const floor = useMemo(() => radialFloorTex('#061440', '#e8f2ff', 1024, 28), [])
  const logo = useMemo(() => logoScreenTex(['¡ACIERTA', 'o el ABISMO!'], { bg: '#0a2a70', accent: '#ffd024' }), [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[13.5, 64]} />
        <meshLambertMaterial map={floor} />
      </mesh>

      {/* white circular platform */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[4.3, 4.4, 0.5, 56]} />
        <meshLambertMaterial color="#f4f7fc" emissive="#8090b0" emissiveIntensity={0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.54, 0]}>
        <circleGeometry args={[4.25, 56]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.25} />
      </mesh>
      {/* center black ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.55, 0]}>
        <ringGeometry args={[1.05, 1.35, 48]} />
        <meshBasicMaterial color="#1a1e24" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.552, 0]}>
        <circleGeometry args={[1.05, 32]} />
        <meshBasicMaterial color="#0c1016" />
      </mesh>

      {/* black rail with white discs */}
      <mesh position={[0, 0.95, 0]}>
        <torusGeometry args={[5.2, 0.035, 6, 56]} />
        <meshBasicMaterial color="#1a1e24" />
      </mesh>
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2
        return (
          <group key={i} position={[Math.sin(a) * 5.2, 0.95, Math.cos(a) * 5.2]}>
            <mesh><cylinderGeometry args={[0.03, 0.03, 0.7, 6]} /><meshLambertMaterial color="#222830" /></mesh>
            <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.14, 12]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
          </group>
        )
      })}

      {/* logo screen */}
      <group position={[0, 3.5, -10.2]}>
        <mesh><boxGeometry args={[7.4, 4.2, 0.2]} /><meshBasicMaterial map={logo} toneMapped={false} /></mesh>
        <mesh position={[0, 0, -0.12]}><boxGeometry args={[7.7, 4.5, 0.15]} /><meshLambertMaterial color="#0a1a48" /></mesh>
      </group>

      {/* yellow chevron side panels */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 7.2, 2.9, -5]} rotation={[0, -s * 0.4, 0]}>
          <boxGeometry args={[5.2, 5.0, 0.18]} />
          <meshBasicMaterial map={chev} toneMapped={false} />
        </mesh>
      ))}

      {/* lower chevron ring wall */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[8.5, 8.5, 0.9, 48, 1, true, -0.5, Math.PI + 1]} />
        <meshBasicMaterial map={chev} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* tiered white platforms */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[0, 0.4 + i * 0.45, 0]}>
          <cylinderGeometry args={[6.8 + i * 1.3, 6.8 + i * 1.3, 0.35, 48, 1, true, -0.35, Math.PI + 0.7]} />
          <meshLambertMaterial color="#e8eef8" side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* blue pillars */}
      {[-5.8, 5.8].map((x) => (
        <mesh key={x} position={[x, 3.2, -9.5]}>
          <boxGeometry args={[0.65, 6.2, 0.65]} />
          <meshLambertMaterial color="#1a4aaa" emissive="#0a2860" emissiveIntensity={0.45} />
        </mesh>
      ))}

      <mesh position={[0, 10.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 32]} />
        <meshBasicMaterial color="#050c28" side={THREE.DoubleSide} />
      </mesh>
      {[0, 90, 180, 270].map((d, i) => {
        const a = (d * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.sin(a) * 2.2, 5.8, Math.cos(a) * 2.2]}>
            <coneGeometry args={[0.85, 6.5, 12, 1, true]} />
            <meshBasicMaterial color="#cfe0ff" transparent opacity={0.07} blending={add} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}
