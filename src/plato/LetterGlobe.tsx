import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Letter globe whose glyph planes face outward from the centre (readable on the front as it yaws). */
export function LetterGlobeOutward({ radius = 1.85 }: { radius?: number }) {
  const group = useRef<THREE.Group>(null)
  const letters = useMemo(() => {
    const out: { ch: string; pos: [number, number, number]; quat: THREE.Quaternion; s: number }[] = []
    const N = 96
    const golden = Math.PI * (3 - Math.sqrt(5))
    const alphabet = 'ABCDEFGHIJLMNÑOPQRSTUVXYZ'
    const zAxis = new THREE.Vector3(0, 0, 1)
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const rAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = golden * i
      const x = Math.cos(theta) * rAtY
      const z = Math.sin(theta) * rAtY
      const pos = new THREE.Vector3(x, y, z).multiplyScalar(radius)
      const quat = new THREE.Quaternion().setFromUnitVectors(zAxis, pos.clone().normalize())
      out.push({
        ch: alphabet[i % alphabet.length],
        pos: [pos.x, pos.y, pos.z],
        quat,
        s: 0.28 + (i % 7) * 0.025
      })
    }
    return out
  }, [radius])
  const mats = useMemo(() => {
    const map = new Map<string, THREE.MeshBasicMaterial>()
    for (const ch of 'ABCDEFGHIJLMNÑOPQRSTUVXYZ') {
      const c = document.createElement('canvas'); c.width = 128; c.height = 128
      const g = c.getContext('2d')!
      g.clearRect(0, 0, 128, 128)
      g.font = "900 92px 'Nunito', sans-serif"
      g.textAlign = 'center'; g.textBaseline = 'middle'
      g.fillStyle = '#ffffff'
      g.shadowColor = 'rgba(160,220,255,.95)'; g.shadowBlur = 14
      g.fillText(ch, 64, 70)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      map.set(ch, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }))
    }
    return map
  }, [])
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.25 // slow yaw; front moves left→right
  })
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[radius * 0.88, 28, 20]} />
        <meshBasicMaterial color="#5eb8ff" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {letters.map((L, i) => (
        <mesh key={i} position={L.pos} quaternion={L.quat} scale={[L.s, L.s, L.s]} material={mats.get(L.ch)!}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  )
}
