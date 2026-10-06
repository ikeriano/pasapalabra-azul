import { useMemo } from 'react'
import * as THREE from 'three'

function Island({ position, w = 4.2 }: { position: [number, number, number]; w?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]}><boxGeometry args={[w, 0.84, 1.35]} /><meshLambertMaterial color="#2a3038" /></mesh>
      <mesh position={[0, 0.88, 0]}><boxGeometry args={[w + 0.1, 0.1, 1.45]} /><meshLambertMaterial color="#f4f6f8" /></mesh>
      <mesh position={[0, 0.93, 0]}><boxGeometry args={[1.2, 0.04, 0.65]} /><meshBasicMaterial color="#1a1e24" /></mesh>
      {/* open shelf recess */}
      <mesh position={[0, 0.35, 0.62]}><boxGeometry args={[w * 0.55, 0.45, 0.08]} /><meshBasicMaterial color="#1e242c" /></mesh>
      <mesh position={[-0.5, 0.3, 0.55]}><boxGeometry args={[0.35, 0.2, 0.25]} /><meshLambertMaterial color="#f0f0f0" /></mesh>
      <mesh position={[0.4, 0.32, 0.55]}><boxGeometry args={[0.25, 0.25, 0.25]} /><meshLambertMaterial color="#2ecc71" /></mesh>
    </group>
  )
}

export function CocinaSet() {
  const blueSlats = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 256
    const g = c.getContext('2d')!
    g.fillStyle = '#1a6adf'
    for (let y = 0; y < 256; y += 18) {
      g.fillStyle = y % 36 === 0 ? '#1a6adf' : '#2a7aef'
      g.fillRect(0, y, 128, 16)
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(6, 3)
    return t
  }, [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[18, 16]} />
        <meshStandardMaterial color="#c8ced6" metalness={0.3} roughness={0.35} />
      </mesh>

      {/* back blue slat wall */}
      <mesh position={[0, 3, -6.2]}><planeGeometry args={[8, 5.5]} /><meshBasicMaterial map={blueSlats} toneMapped={false} /></mesh>
      {/* ovens left */}
      <mesh position={[-5.2, 2.2, -6]}><boxGeometry args={[2.4, 3.2, 0.8]} /><meshLambertMaterial color="#eef1f5" /></mesh>
      {[-0.6, 0.15, 0.9].map((y, i) => (
        <mesh key={i} position={[-5.2, 1.6 + y, -5.55]}><boxGeometry args={[1.8, 0.55, 0.08]} /><meshBasicMaterial color="#1a1e24" /></mesh>
      ))}
      {/* fridge */}
      <mesh position={[4.8, 2.0, -5.8]}><boxGeometry args={[1.3, 3.6, 1.0]} /><meshLambertMaterial color="#c0c6ce" /></mesh>
      {/* white side louvers */}
      <mesh position={[-7.5, 2.8, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8, 5]} /><meshLambertMaterial color="#f0f3f7" />
      </mesh>
      <mesh position={[7.5, 2.8, -1]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[0.2, 5, 6]} /><meshLambertMaterial color="#1a6adf" />
      </mesh>

      <Island position={[0, 0, 2.0]} w={4.6} />
      <Island position={[0, 0, -1.3]} w={3.6} />

      {/* ceiling soffit */}
      <mesh position={[0, 5.4, -1]}><boxGeometry args={[16, 0.4, 12]} /><meshLambertMaterial color="#eef1f5" /></mesh>
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <mesh key={i} position={[x, 5.15, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* soft fill */}
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 4.5, 0]} intensity={8} distance={14} color="#e8f0ff" />
    </group>
  )
}
