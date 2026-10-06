import { useMemo } from 'react'
import * as THREE from 'three'
import { chevronTex, logoScreenTex, radialFloorTex } from './textures'

const add = THREE.AdditiveBlending

export function AbismoSet() {
  const chev = useMemo(() => chevronTex('#0a2460', '#ffd24a'), [])
  const floor = useMemo(() => radialFloorTex('#061238', '#e8f2ff'), [])
  const logo = useMemo(() => logoScreenTex('¡ACIERTA', 'o el ABISMO!'), [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[13, 64]} />
        <meshLambertMaterial map={floor} />
      </mesh>

      {/* white circular platform */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[4.2, 4.3, 0.42, 56]} />
        <meshLambertMaterial color="#f2f5fa" emissive="#8090b0" emissiveIntensity={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.44, 0]}>
        <ringGeometry args={[1.1, 1.35, 48]} />
        <meshBasicMaterial color="#2a3038" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.445, 0]}>
        <circleGeometry args={[1.1, 32]} />
        <meshBasicMaterial color="#1a1e24" />
      </mesh>

      {/* chevron side panels */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 7.5, 2.8, -4]} rotation={[0, -side * 0.35, 0]}>
          <boxGeometry args={[5.5, 5.2, 0.15]} />
          <meshBasicMaterial map={chev} toneMapped={false} />
        </mesh>
      ))}

      {/* logo screen */}
      <group position={[0, 3.4, -10]}>
        <mesh>
          <boxGeometry args={[7.2, 4.0, 0.15]} />
          <meshBasicMaterial map={logo} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[7.5, 4.3, 0.12]} />
          <meshLambertMaterial color="#0a1a48" />
        </mesh>
      </group>

      {/* blue pillars */}
      {[-5.5, 5.5].map((x) => (
        <mesh key={x} position={[x, 3, -9.5]}>
          <boxGeometry args={[0.6, 6, 0.6]} />
          <meshLambertMaterial color="#1a4aaa" emissive="#0a2860" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* tiered rings with rails */}
      {[0, 1].map((i) => (
        <group key={i}>
          <mesh position={[0, 0.35 + i * 0.5, 0]}>
            <cylinderGeometry args={[6.5 + i * 1.4, 6.5 + i * 1.4, 0.4, 48, 1, true, -0.4, Math.PI + 0.8]} />
            <meshLambertMaterial color="#e8eef8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.7 + i * 0.5, 0]}>
            <torusGeometry args={[6.5 + i * 1.4, 0.03, 6, 48, Math.PI + 0.8]} />
            <meshBasicMaterial color="#222830" />
          </mesh>
        </group>
      ))}

      {/* light beams */}
      {[0, 90, 180, 270].map((deg, i) => {
        const a = (deg * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.sin(a) * 2.5, 5.5, Math.cos(a) * 2.5]}>
            <coneGeometry args={[0.8, 6.5, 12, 1, true]} />
            <meshBasicMaterial color="#cfe0ff" transparent opacity={0.07} blending={add} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        )
      })}

      <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 32]} />
        <meshBasicMaterial color="#050818" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
