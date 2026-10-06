import { useMemo } from 'react'
import * as THREE from 'three'
import { boomLogoTex } from './textures'
const add = THREE.AdditiveBlending

export function BoomSet() {
  const logo = useMemo(() => boomLogoTex(), [])
  return (
    <group>
      {/* dark floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[13.5, 64]} />
        <meshStandardMaterial color="#120806" metalness={0.4} roughness={0.35} />
      </mesh>
      {/* concentric orange neon rings */}
      {[2.2, 3.6, 5.0, 6.6, 8.4, 10.2].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03 + i * 0.001, 0]}>
          <ringGeometry args={[r - 0.1, r, 64]} />
          <meshBasicMaterial color={i % 2 ? '#ff7a20' : '#ff3a00'} toneMapped={false} />
        </mesh>
      ))}

      {/* curved contestant desk */}
      <group position={[0, 0, 2.4]}>
        <mesh position={[0, 0.55, 0]} rotation={[0, Math.PI, 0]}>
          <torusGeometry args={[3.4, 0.38, 10, 36, Math.PI]} />
          <meshLambertMaterial color="#2a1810" />
        </mesh>
        <mesh position={[0, 0.98, -0.2]}>
          <boxGeometry args={[5.8, 0.14, 1.15]} />
          <meshLambertMaterial color="#3a2218" emissive="#4a1808" emissiveIntensity={0.25} />
        </mesh>
        {/* neon edge */}
        <mesh position={[0, 0.92, 0.35]} rotation={[0, Math.PI, 0]}>
          <torusGeometry args={[3.15, 0.04, 6, 32, Math.PI]} />
          <meshBasicMaterial color="#ff6a1a" toneMapped={false} />
        </mesh>
      </group>

      {/* bomb props */}
      {[-2.0, -0.7, 0.7, 2.0].map((x, i) => (
        <group key={i} position={[x, 1.2, 1.85]}>
          <mesh><sphereGeometry args={[0.3, 14, 12]} /><meshLambertMaterial color="#1a1a1a" /></mesh>
          <mesh position={[0, 0.34, 0]}><cylinderGeometry args={[0.05, 0.05, 0.22, 6]} /><meshLambertMaterial color="#888" /></mesh>
          <mesh position={[0, 0.48, 0]}><sphereGeometry args={[0.07, 6, 6]} /><meshBasicMaterial color="#ff3300" toneMapped={false} /></mesh>
          {/* fuse spark */}
          <mesh position={[0.05, 0.55, 0]}><sphereGeometry args={[0.04, 6, 6]} /><meshBasicMaterial color="#ffcc00" toneMapped={false} /></mesh>
        </group>
      ))}

      {/* hexagonal neon backdrop + logo */}
      <group position={[0, 3.6, -9.5]}>
        <mesh><boxGeometry args={[11, 5.8, 0.25]} /><meshLambertMaterial color="#140806" /></mesh>
        <mesh position={[0, 0.1, 0.15]}><planeGeometry args={[8.5, 3.8]} /><meshBasicMaterial map={logo} toneMapped={false} /></mesh>
        {[-3.5, -1.75, 0, 1.75, 3.5].map((x, i) => (
          <mesh key={i} position={[x, 2.1, 0.2]}>
            <cylinderGeometry args={[0.6, 0.6, 0.08, 6]} />
            <meshBasicMaterial color="#ff6a1a" transparent opacity={0.75} blending={add} depthWrite={false} />
          </mesh>
        ))}
        {/* orange neon frame */}
        <mesh position={[0, 0, 0.18]}><boxGeometry args={[11.2, 0.12, 0.08]} /><meshBasicMaterial color="#ff6a1a" toneMapped={false} /></mesh>
        <mesh position={[0, 2.9, 0.18]}><boxGeometry args={[11.2, 0.12, 0.08]} /><meshBasicMaterial color="#ff6a1a" toneMapped={false} /></mesh>
      </group>

      {/* dark cylindrical walls */}
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[13.8, 13.8, 9, 48, 1, true]} />
        <meshBasicMaterial color="#0a0402" side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 9.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 32]} />
        <meshBasicMaterial color="#080402" side={THREE.DoubleSide} />
      </mesh>
      {[0, 60, 120, 180, 240, 300].map((d, i) => {
        const a = (d * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.sin(a) * 2.5, 5.5, Math.cos(a) * 2.5]}>
            <coneGeometry args={[0.95, 7, 10, 1, true]} />
            <meshBasicMaterial color="#ff8020" transparent opacity={0.06} blending={add} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}
