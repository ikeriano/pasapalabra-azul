import { useMemo } from 'react'
import * as THREE from 'three'
import { blueSlatTex } from './textures'

function Island({ position, w = 4.4, sink = false }: { position: [number, number, number]; w?: number; sink?: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]}><boxGeometry args={[w, 0.84, 1.4]} /><meshLambertMaterial color="#2a3038" /></mesh>
      <mesh position={[0, 0.9, 0]}><boxGeometry args={[w + 0.12, 0.12, 1.52]} /><meshLambertMaterial color="#f5f7fa" /></mesh>
      {/* metal handles */}
      {[-w * 0.28, 0, w * 0.28].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 0.72]}><boxGeometry args={[0.55, 0.03, 0.03]} /><meshLambertMaterial color="#b8c0c8" /></mesh>
      ))}
      {/* open shelf niche */}
      <mesh position={[0, 0.32, 0.62]}><boxGeometry args={[w * 0.5, 0.42, 0.1]} /><meshBasicMaterial color="#1a1e24" /></mesh>
      <mesh position={[-0.45, 0.28, 0.55]}><boxGeometry args={[0.32, 0.18, 0.22]} /><meshLambertMaterial color="#f0f0f0" /></mesh>
      <mesh position={[0.35, 0.3, 0.55]}><boxGeometry args={[0.22, 0.22, 0.22]} /><meshLambertMaterial color="#2ecc71" /></mesh>
      {sink ? (
        <>
          <mesh position={[0.5, 0.98, 0]}><boxGeometry args={[0.55, 0.06, 0.4]} /><meshLambertMaterial color="#9aa3ae" /></mesh>
          <mesh position={[0.5, 1.2, -0.12]}><cylinderGeometry args={[0.025, 0.025, 0.35, 8]} /><meshLambertMaterial color="#c0c6ce" /></mesh>
        </>
      ) : (
        <mesh position={[0.7, 0.98, 0]}><boxGeometry args={[1.15, 0.04, 0.6]} /><meshBasicMaterial color="#1a1e24" /></mesh>
      )}
      {/* cutting board + bowls */}
      <mesh position={[-1.1, 0.98, 0.15]}><boxGeometry args={[0.7, 0.04, 0.45]} /><meshLambertMaterial color="#c4a06a" /></mesh>
      <mesh position={[-0.5, 1.02, -0.2]}><cylinderGeometry args={[0.12, 0.12, 0.08, 12]} /><meshLambertMaterial color="#ffffff" /></mesh>
    </group>
  )
}

/** Generic blocky chef NPC — NOT a real-person likeness. */
function ChefNPC({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.35, 0.7, 0.28]} /><meshLambertMaterial color="#f2f2f2" /></mesh>
      <mesh position={[0, 1.05, 0]}><boxGeometry args={[0.5, 0.55, 0.35]} /><meshLambertMaterial color="#ffffff" /></mesh>
      <mesh position={[0, 1.45, 0]}><boxGeometry args={[0.32, 0.32, 0.3]} /><meshLambertMaterial color="#f0d0b0" /></mesh>
      {/* toque */}
      <mesh position={[0, 1.85, 0]}><cylinderGeometry args={[0.16, 0.18, 0.5, 12]} /><meshLambertMaterial color="#ffffff" /></mesh>
      <mesh position={[0, 2.12, 0]}><sphereGeometry args={[0.2, 10, 8]} /><meshLambertMaterial color="#ffffff" /></mesh>
      {/* towel */}
      <mesh position={[0.18, 0.75, 0.2]}><boxGeometry args={[0.12, 0.35, 0.04]} /><meshLambertMaterial color="#7a4aaa" /></mesh>
    </group>
  )
}

export function CocinaSet() {
  const slats = useMemo(() => blueSlatTex(), [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[18, 16]} />
        <meshStandardMaterial color="#c5cbd4" metalness={0.35} roughness={0.28} />
      </mesh>

      {/* blue horizontal slat feature wall */}
      <mesh position={[1.2, 2.9, -6.15]}><planeGeometry args={[6.5, 5.2]} /><meshBasicMaterial map={slats} toneMapped={false} /></mesh>

      {/* dark grey cabinet bank + 3 ovens */}
      <mesh position={[-3.6, 2.0, -5.9]}><boxGeometry args={[3.6, 3.8, 1.0]} /><meshLambertMaterial color="#2a3038" /></mesh>
      {[-0.85, 0, 0.85].map((x, i) => (
        <group key={i} position={[-3.6 + x, 1.7, -5.35]}>
          <mesh><boxGeometry args={[0.75, 0.6, 0.08]} /><meshBasicMaterial color="#0e1218" /></mesh>
          <mesh position={[0, 0.22, 0.05]}><boxGeometry args={[0.5, 0.04, 0.04]} /><meshLambertMaterial color="#c8d0d8" /></mesh>
        </group>
      ))}
      {/* back counter */}
      <mesh position={[1.5, 0.45, -5.7]}><boxGeometry args={[5.5, 0.9, 0.7]} /><meshLambertMaterial color="#2a3038" /></mesh>
      <mesh position={[1.5, 0.95, -5.7]}><boxGeometry args={[5.6, 0.1, 0.8]} /><meshLambertMaterial color="#f5f7fa" /></mesh>
      {/* floating shelves + bottles */}
      {[1.8, 2.4].map((y, i) => (
        <mesh key={i} position={[2.2, y, -5.95]}><boxGeometry args={[1.6, 0.06, 0.3]} /><meshLambertMaterial color="#ffffff" /></mesh>
      ))}
      {[[1.7, 2.0, '#e85a2a'], [2.2, 2.0, '#2a8adf'], [2.7, 2.0, '#e8c020']].map(([x, y, col], i) => (
        <mesh key={i} position={[x as number, y as number, -5.85]}><cylinderGeometry args={[0.07, 0.07, 0.28, 8]} /><meshLambertMaterial color={col as string} /></mesh>
      ))}

      {/* tall fridge */}
      <mesh position={[5.0, 2.0, -5.5]}><boxGeometry args={[1.35, 3.8, 1.1]} /><meshLambertMaterial color="#9aa3ae" /></mesh>
      <mesh position={[5.0, 2.0, -4.9]}><boxGeometry args={[1.15, 3.4, 0.05]} /><meshBasicMaterial color="#6a7380" /></mesh>
      {/* beverage cooler */}
      <mesh position={[3.6, 1.35, -5.5]}><boxGeometry args={[0.9, 1.5, 0.8]} /><meshLambertMaterial color="#d0d6de" /></mesh>
      <mesh position={[3.6, 1.35, -5.05]}><boxGeometry args={[0.7, 1.2, 0.05]} /><meshBasicMaterial color="#7ec8ff" transparent opacity={0.45} /></mesh>

      {/* white vertical light panels left */}
      <mesh position={[-7.2, 2.8, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[9, 5.2]} /><meshLambertMaterial color="#f0f3f7" />
      </mesh>
      {[-2, 0, 2].map((z, i) => (
        <mesh key={i} position={[-7.15, 2.8, z]}><boxGeometry args={[0.08, 4.5, 0.15]} /><meshBasicMaterial color="#c8a0e8" toneMapped={false} /></mesh>
      ))}
      {/* white louver screen */}
      <group position={[-5.2, 2.2, 1.5]}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i} position={[0, -1.4 + i * 0.22, 0]}><boxGeometry args={[1.6, 0.1, 0.08]} /><meshLambertMaterial color="#f2f5f8" /></mesh>
        ))}
      </group>
      {/* blue side wall right */}
      <mesh position={[7.5, 2.8, -1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5.2]} /><meshLambertMaterial color="#1a6adf" />
      </mesh>

      <Island position={[0, 0, 2.2]} w={4.8} />
      <Island position={[-1.5, 0, -0.6]} w={2.8} sink />

      <ChefNPC position={[4.2, 0, -3.8]} />

      {/* ceiling soffit + spots */}
      <mesh position={[0, 5.5, -1]}><boxGeometry args={[16, 0.35, 12]} /><meshLambertMaterial color="#eef1f5" /></mesh>
      {[-4, -2, 0, 2, 4].flatMap((x, i) => [-2, 1].map((z, j) => (
        <mesh key={`${i}-${j}`} position={[x, 5.28, z]}>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )))}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 4.8, 0]} intensity={10} distance={16} color="#eef4ff" />
      <pointLight position={[2, 3.5, -5]} intensity={4} distance={8} color="#4a9dff" />
    </group>
  )
}
