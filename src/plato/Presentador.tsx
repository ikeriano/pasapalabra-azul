import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { labelTexture } from './textures'

/**
 * Stylized low-poly VIDEOGAME host ("el Presentador") — short brown hair, red polo,
 * friendly early-2000s cartoon look. NOT a real-person likeness.
 */
export function Presentador({ position = [0, 0, 6.2] }: { position?: [number, number, number] }) {
  const root = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (root.current) root.current.position.y = position[1] + Math.sin(t * 1.6) * 0.025
    if (head.current) head.current.rotation.y = Math.sin(t * 0.7) * 0.12
    if (armL.current) armL.current.rotation.x = -0.35 + Math.sin(t * 1.3) * 0.12
    if (armR.current) armR.current.rotation.x = -0.25 + Math.sin(t * 1.3 + 1) * 0.15
  })

  const skin = '#f0c9a0'
  const hair = '#5a3a22'
  const polo = '#e02323'
  const pants = '#2a3a5a'
  const shoe = '#222833'

  return (
    <group ref={root} position={position}>
      {/* shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#041028" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* legs */}
      <mesh position={[-0.14, 0.55, 0]}><boxGeometry args={[0.22, 0.7, 0.22]} /><meshLambertMaterial color={pants} /></mesh>
      <mesh position={[0.14, 0.55, 0]}><boxGeometry args={[0.22, 0.7, 0.22]} /><meshLambertMaterial color={pants} /></mesh>
      <mesh position={[-0.14, 0.12, 0.06]}><boxGeometry args={[0.26, 0.14, 0.4]} /><meshLambertMaterial color={shoe} /></mesh>
      <mesh position={[0.14, 0.12, 0.06]}><boxGeometry args={[0.26, 0.14, 0.4]} /><meshLambertMaterial color={shoe} /></mesh>

      {/* torso / red polo */}
      <mesh position={[0, 1.15, 0]}><boxGeometry args={[0.7, 0.75, 0.38]} /><meshLambertMaterial color={polo} /></mesh>
      {/* collar */}
      <mesh position={[0, 1.5, 0.12]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.5, 0.12, 0.2]} /><meshLambertMaterial color="#c41c1c" /></mesh>
      {/* white stripe on polo */}
      <mesh position={[0, 1.05, 0.195]}><boxGeometry args={[0.18, 0.55, 0.02]} /><meshBasicMaterial color="#ffffff" /></mesh>

      {/* arms */}
      <group ref={armL} position={[-0.48, 1.4, 0]}>
        <mesh position={[0, -0.35, 0]}><boxGeometry args={[0.2, 0.7, 0.2]} /><meshLambertMaterial color={polo} /></mesh>
        <mesh position={[0, -0.75, 0]}><boxGeometry args={[0.18, 0.22, 0.18]} /><meshLambertMaterial color={skin} /></mesh>
      </group>
      <group ref={armR} position={[0.48, 1.4, 0]}>
        <mesh position={[0, -0.35, 0]}><boxGeometry args={[0.2, 0.7, 0.2]} /><meshLambertMaterial color={polo} /></mesh>
        <mesh position={[0, -0.75, 0]}><boxGeometry args={[0.18, 0.22, 0.18]} /><meshLambertMaterial color={skin} /></mesh>
      </group>

      {/* head */}
      <group ref={head} position={[0, 1.85, 0]}>
        <mesh position={[0, 0.18, 0]}><boxGeometry args={[0.48, 0.5, 0.42]} /><meshLambertMaterial color={skin} /></mesh>
        {/* short spiked brown hair */}
        <mesh position={[0, 0.42, -0.02]}><boxGeometry args={[0.5, 0.22, 0.44]} /><meshLambertMaterial color={hair} /></mesh>
        <mesh position={[-0.12, 0.55, 0.05]}><boxGeometry args={[0.14, 0.16, 0.14]} /><meshLambertMaterial color={hair} /></mesh>
        <mesh position={[0.05, 0.58, 0.08]}><boxGeometry args={[0.14, 0.18, 0.14]} /><meshLambertMaterial color={hair} /></mesh>
        <mesh position={[0.18, 0.52, 0]}><boxGeometry args={[0.12, 0.14, 0.12]} /><meshLambertMaterial color={hair} /></mesh>
        <mesh position={[0, 0.48, -0.18]}><boxGeometry args={[0.42, 0.2, 0.14]} /><meshLambertMaterial color={hair} /></mesh>
        {/* eyes */}
        <mesh position={[-0.12, 0.2, 0.22]}><boxGeometry args={[0.1, 0.1, 0.04]} /><meshBasicMaterial color="#1a2030" /></mesh>
        <mesh position={[0.12, 0.2, 0.22]}><boxGeometry args={[0.1, 0.1, 0.04]} /><meshBasicMaterial color="#1a2030" /></mesh>
        <mesh position={[-0.12, 0.22, 0.24]}><boxGeometry args={[0.04, 0.04, 0.02]} /><meshBasicMaterial color="#ffffff" /></mesh>
        <mesh position={[0.12, 0.22, 0.24]}><boxGeometry args={[0.04, 0.04, 0.02]} /><meshBasicMaterial color="#ffffff" /></mesh>
        {/* smile */}
        <mesh position={[0, 0.05, 0.22]}><boxGeometry args={[0.18, 0.04, 0.03]} /><meshBasicMaterial color="#c45a5a" /></mesh>
        {/* brows */}
        <mesh position={[-0.12, 0.3, 0.22]}><boxGeometry args={[0.12, 0.03, 0.03]} /><meshLambertMaterial color={hair} /></mesh>
        <mesh position={[0.12, 0.3, 0.22]}><boxGeometry args={[0.12, 0.03, 0.03]} /><meshLambertMaterial color={hair} /></mesh>
        {/* ears */}
        <mesh position={[-0.28, 0.18, 0]}><boxGeometry args={[0.08, 0.14, 0.1]} /><meshLambertMaterial color={skin} /></mesh>
        <mesh position={[0.28, 0.18, 0]}><boxGeometry args={[0.08, 0.14, 0.1]} /><meshLambertMaterial color={skin} /></mesh>
        {/* neck */}
        <mesh position={[0, -0.12, 0]}><boxGeometry args={[0.2, 0.18, 0.2]} /><meshLambertMaterial color={skin} /></mesh>
      </group>
    </group>
  )
}

const LINES = [
  '¡Bienvenidos al plató!',
  'Acercaos a una prueba para jugar.',
  '¡El Rosco os espera en el centro!',
  '¿Listos para La Silla Azul?',
  '¡Una de Cuatro, a por todas!',
  'La Sopa de Letras está a la izquierda.',
  '¿Dónde están?… ¡a la derecha!',
  '¡A la Z: ida y vuelta por el abecedario!',
  'Usad PARTIDA COMPLETA para el programa entero.',
  '¡Mucha suerte, concursantes!'
]

/** Floating Spanish speech bubble that cycles near the presentador / hotspots. */
const NEAR_LINES: Record<string, string> = {
  rosco: '¡El Rosco! 25 letras contra el reloj.',
  silla: 'La Silla Azul: definiciones encadenadas.',
  udc: 'Una de Cuatro: elegid la correcta.',
  sopa: 'Sopa de Letras: ¡encontrad las 5 palabras!',
  donde: '¿Dónde están? Memorizad y acertad.',
  alaz: 'A la Z: de la A a la Z… ¡y vuelta!'
}

export function PresentadorBubble({ position = [0.9, 3.1, 6.2], nearLabel }: { position?: [number, number, number]; nearLabel: string | null }) {
  const idx = useRef(0)
  const last = useRef(0)
  const mat = useRef<THREE.SpriteMaterial>(null)
  const maps = useMemo(() => LINES.map((t) => labelTexture(t, '#ff5a5a')), [])
  const nearMaps = useMemo(() => {
    const o: Record<string, THREE.Texture> = {}
    for (const [k, v] of Object.entries(NEAR_LINES)) o[k] = labelTexture(v, '#ff5a5a')
    return o
  }, [])

  const ref = useRef<THREE.Sprite>(null)
  useFrame(({ clock }) => {
    if (!ref.current || !mat.current) return
    if (nearLabel && nearMaps[nearLabel]) {
      if (mat.current.map !== nearMaps[nearLabel]) {
        mat.current.map = nearMaps[nearLabel]
        mat.current.needsUpdate = true
      }
    } else if (clock.elapsedTime - last.current > 7) {
      last.current = clock.elapsedTime
      idx.current = (idx.current + 1) % maps.length
      mat.current.map = maps[idx.current]
      mat.current.needsUpdate = true
    }
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2) * 0.06
    const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.02
    ref.current.scale.set(3.6 * s, 0.9 * s, 1)
  })
  return (
    <sprite ref={ref} position={position} scale={[3.6, 0.9, 1]} renderOrder={12}>
      <spriteMaterial ref={mat} map={maps[0]} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}
