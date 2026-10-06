import { useMemo } from 'react'
import * as THREE from 'three'
import { logoScreenTex } from './textures'
const add = THREE.AdditiveBlending

/** Faithful low-poly Ahora Caigo: white center, black trapdoor ring, red neon rings, score tower. */
export function AhoraCaigoSet() {
  const logo = useMemo(() => logoScreenTex(['¡AHORA CAIGO!'], { bg: '#0a4aaa', accent: '#ffcc00', scoreTop: '0', scoreBot: '30' }), [])
  return (
    <group>
      {/* studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[15, 64]} />
        <meshLambertMaterial color="#3a4558" />
      </mesh>

      {/* black contestant ring floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[2.55, 7.3, 64]} />
        <meshStandardMaterial color="#0a0c12" metalness={0.45} roughness={0.3} />
      </mesh>

      {/* white raised center platform */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[2.45, 2.55, 0.65, 48]} />
        <meshLambertMaterial color="#f2f5fa" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.72, 0]}>
        <circleGeometry args={[2.42, 48]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      {/* center trapdoor mark */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.73, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#111820" />
      </mesh>
      <mesh position={[-0.12, 0.75, 0]}><boxGeometry args={[0.1, 0.04, 0.4]} /><meshBasicMaterial color="#ffcc00" toneMapped={false} /></mesh>
      <mesh position={[0.12, 0.75, 0]}><boxGeometry args={[0.1, 0.04, 0.4]} /><meshBasicMaterial color="#ffcc00" toneMapped={false} /></mesh>

      {/* steps onto center */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 2.7, 0.18, Math.cos(a) * 2.7]} rotation={[0, -a, 0]}>
            <boxGeometry args={[1.2, 0.28, 0.55]} />
            <meshLambertMaterial color="#e8ecf2" />
          </mesh>
        )
      })}

      {/* 8 contestant trapdoors with red neon ring + yellow bars */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8
        const x = Math.sin(a) * 5.05, z = Math.cos(a) * 5.05
        return (
          <group key={i} position={[x, 0.06, z]} rotation={[0, -a, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.78, 0.98, 32]} />
              <meshBasicMaterial color="#ff2222" toneMapped={false} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <circleGeometry args={[0.78, 32]} />
              <meshBasicMaterial color="#05070c" />
            </mesh>
            <mesh position={[-0.14, 0.05, 0]}><boxGeometry args={[0.12, 0.05, 0.48]} /><meshBasicMaterial color="#ffcc00" toneMapped={false} /></mesh>
            <mesh position={[0.14, 0.05, 0]}><boxGeometry args={[0.12, 0.05, 0.48]} /><meshBasicMaterial color="#ffcc00" toneMapped={false} /></mesh>
            {/* small lectern */}
            <mesh position={[0, 0.55, -1.05]}><boxGeometry args={[0.5, 0.65, 0.12]} /><meshLambertMaterial color="#1a2030" /></mesh>
            <mesh position={[0, 0.72, -0.98]}><planeGeometry args={[0.35, 0.28]} /><meshBasicMaterial color="#1a5adf" toneMapped={false} /></mesh>
          </group>
        )
      })}

      {/* glass railing around ring */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[7.45, 7.45, 0.75, 64, 1, true]} />
        <meshBasicMaterial color="#cfe6ff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <torusGeometry args={[7.45, 0.04, 6, 64]} />
        <meshLambertMaterial color="#9aa3b0" />
      </mesh>
      {/* rail posts */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 7.45, 0.55, Math.cos(a) * 7.45]}>
            <cylinderGeometry args={[0.035, 0.035, 0.9, 6]} />
            <meshLambertMaterial color="#8a93a0" />
          </mesh>
        )
      })}

      {/* score tower + logo */}
      <group position={[0, 0, -11.2]}>
        <mesh position={[0, 4.5, -0.4]}><boxGeometry args={[5.6, 8.2, 0.5]} /><meshLambertMaterial color="#6a7582" /></mesh>
        <mesh position={[0, 4.6, 0.05]}><planeGeometry args={[4.8, 6.4]} /><meshBasicMaterial map={logo} toneMapped={false} /></mesh>
        {/* baffle panels */}
        {[-2.4, 0, 2.4].map((x, i) => (
          <mesh key={i} position={[x, 4.2, -1.1]}><boxGeometry args={[2.0, 7.0, 0.3]} /><meshLambertMaterial color="#5a6572" /></mesh>
        ))}
        {/* wall light bands */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 5.5, 3.5, -0.2]}><boxGeometry args={[1.2, 5.5, 0.2]} /><meshBasicMaterial color="#e8eef8" toneMapped={false} /></mesh>
        ))}
      </group>

      {/* hanging white rings over stage */}
      {[4.2, 5.8].map((r, i) => (
        <mesh key={i} position={[0, 8.6 - i * 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.09, 6, 48]} />
          <meshBasicMaterial color="#f0f4f8" toneMapped={false} />
        </mesh>
      ))}

      {/* audience benches */}
      {[0, 1, 2, 3].map((tier) => (
        <mesh key={tier} position={[0, 0.28 + tier * 0.48, 0]}>
          <cylinderGeometry args={[9.0 + tier * 1.15, 9.0 + tier * 1.15, 0.38, 48, 1, true, Math.PI * 0.18, Math.PI * 1.64]} />
          <meshLambertMaterial color="#c8d0da" side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* navy walls + ceiling */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[14.5, 14.5, 10, 48, 1, true]} />
        <meshBasicMaterial color="#0c1838" side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 11, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[15, 32]} />
        <meshBasicMaterial color="#081228" side={THREE.DoubleSide} />
      </mesh>
      {/* soft beams */}
      {[0, 72, 144, 216, 288].map((d, i) => {
        const a = (d * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.sin(a) * 3, 6.5, Math.cos(a) * 3]}>
            <coneGeometry args={[0.75, 6.5, 10, 1, true]} />
            <meshBasicMaterial color="#a8c8ff" transparent opacity={0.05} blending={add} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
      {/* camera crane hint */}
      <group position={[9.5, 0, 2]}>
        <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.08, 0.08, 2.4, 8]} /><meshLambertMaterial color="#1a1e24" /></mesh>
        <mesh position={[-2.5, 2.4, 0]}><boxGeometry args={[5.5, 0.15, 0.15]} /><meshLambertMaterial color="#1a1e24" /></mesh>
      </group>
    </group>
  )
}
