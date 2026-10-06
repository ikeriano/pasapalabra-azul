import { useMemo } from 'react'
import * as THREE from 'three'
import { logoScreenTex } from './textures'
const add = THREE.AdditiveBlending

export function AhoraCaigoSet() {
  const logo = useMemo(() => logoScreenTex('¡AHORA CAIGO!', ''), [])
  return (
    <group>
      {/* dark navy floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshLambertMaterial color="#0a1230" />
      </mesh>
      {/* black stage disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[7.4, 56]} />
        <meshStandardMaterial color="#0c0e14" metalness={0.4} roughness={0.35} />
      </mesh>

      {/* white center platform + steps */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[2.4, 2.5, 0.55, 40]} />
        <meshLambertMaterial color="#f0f3f8" />
      </mesh>
      <mesh position={[0, 0.12, 2.55]}>
        <boxGeometry args={[1.4, 0.2, 0.55]} />
        <meshLambertMaterial color="#e8ecf2" />
      </mesh>
      <mesh position={[0, 0.02, 3.0]}>
        <boxGeometry args={[1.5, 0.12, 0.45]} />
        <meshLambertMaterial color="#e0e5ec" />
      </mesh>

      {/* 10 trapdoors with red ring + yellow bars */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 10
        const x = Math.sin(a) * 5.0, z = Math.cos(a) * 5.0
        return (
          <group key={i} position={[x, 0.05, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.72, 0.92, 28]} />
              <meshBasicMaterial color="#ff2a2a" toneMapped={false} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <circleGeometry args={[0.72, 28]} />
              <meshBasicMaterial color="#05070c" />
            </mesh>
            <mesh position={[-0.12, 0.04, 0]}><boxGeometry args={[0.1, 0.04, 0.42]} /><meshBasicMaterial color="#ffcc00" toneMapped={false} /></mesh>
            <mesh position={[0.12, 0.04, 0]}><boxGeometry args={[0.1, 0.04, 0.42]} /><meshBasicMaterial color="#ffcc00" toneMapped={false} /></mesh>
          </group>
        )
      })}

      {/* glass railing */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[7.5, 7.5, 0.7, 56, 1, true]} />
        <meshBasicMaterial color="#cfe4ff" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <torusGeometry args={[7.5, 0.04, 6, 56]} />
        <meshLambertMaterial color="#9aa3b0" />
      </mesh>

      {/* score tower + logo screen */}
      <group position={[0, 0, -10.5]}>
        <mesh position={[0, 4.2, 0]}><boxGeometry args={[5.2, 7.2, 0.35]} /><meshLambertMaterial color="#6a7380" /></mesh>
        <mesh position={[0, 4.5, 0.2]}><planeGeometry args={[4.6, 5.8]} /><meshBasicMaterial map={logo} toneMapped={false} /></mesh>
        <mesh position={[0, 7.3, 0.25]}><boxGeometry args={[1.6, 0.55, 0.12]} /><meshBasicMaterial color="#ffcc00" toneMapped={false} /></mesh>
        <mesh position={[0, 1.6, 0.25]}><boxGeometry args={[1.6, 0.55, 0.12]} /><meshBasicMaterial color="#ffcc00" toneMapped={false} /></mesh>
        {/* baffle panels behind */}
        {[-1, 0, 1].map((i) => (
          <mesh key={i} position={[i * 2.2, 4, -0.8]}><boxGeometry args={[1.8, 6.5, 0.25]} /><meshLambertMaterial color="#5a6570" /></mesh>
        ))}
      </group>

      {/* hanging white rings */}
      {[4.5, 6.2].map((r, i) => (
        <mesh key={i} position={[0, 8.5 - i * 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.08, 6, 48]} />
          <meshBasicMaterial color="#e8eef8" toneMapped={false} />
        </mesh>
      ))}

      {/* audience benches */}
      {[0, 1, 2].map((tier) => (
        <mesh key={tier} position={[0, 0.35 + tier * 0.5, 0]}>
          <cylinderGeometry args={[9.2 + tier * 1.15, 9.2 + tier * 1.15, 0.35, 48, 1, true, Math.PI * 0.2, Math.PI * 1.6]} />
          <meshLambertMaterial color="#d0d6de" side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* ceiling */}
      <mesh position={[0, 11, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[15, 32]} />
        <meshBasicMaterial color="#0a1020" side={THREE.DoubleSide} />
      </mesh>
      {[0, 60, 120, 180, 240, 300].map((d, i) => {
        const a = (d * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.sin(a) * 3.5, 6.5, Math.cos(a) * 3.5]}>
            <coneGeometry args={[0.7, 6, 10, 1, true]} />
            <meshBasicMaterial color="#a8c4ff" transparent opacity={0.05} blending={add} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}
