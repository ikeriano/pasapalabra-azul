export type SetId = 'pasapalabra' | 'rueda' | 'ahora' | 'cocina' | 'abismo' | 'boom'

export interface Plano {
  id: string
  label: string
  pos: [number, number, number]
  look: [number, number, number]
  accent: string
}

export interface SetDef {
  id: SetId
  label: string
  short: string
  spawn: { x: number; z: number; yaw: number }
  portal: { x: number; z: number; y?: number; yaw?: number }
  fog: string
  bg: string
  planos: Plano[]
  floorHeight: (x: number, z: number) => number
  collide: (x: number, z: number, y: number) => [number, number]
}

const BODY = 0.32

function clampRadius(x: number, z: number, maxR: number): [number, number] {
  const r = Math.hypot(x, z)
  if (r > maxR) return [(x / r) * maxR, (z / r) * maxR]
  return [x, z]
}
function pushCircle(x: number, z: number, cx: number, cz: number, rr: number): [number, number] {
  const d = Math.hypot(x - cx, z - cz)
  if (d < rr) {
    const k = rr / Math.max(d, 0.001)
    return [cx + (x - cx) * k, cz + (z - cz) * k]
  }
  return [x, z]
}
function pushBox(x: number, z: number, cx: number, cz: number, hx: number, hz: number): [number, number] {
  if (Math.abs(x - cx) < hx && Math.abs(z - cz) < hz) {
    const ox = hx - Math.abs(x - cx)
    const oz = hz - Math.abs(z - cz)
    if (ox < oz) return [cx + Math.sign(x - cx || 1) * hx, z]
    return [x, cz + Math.sign(z - cz || 1) * hz]
  }
  return [x, z]
}

export const SETS: Record<SetId, SetDef> = {
  pasapalabra: {
    id: 'pasapalabra', label: 'Pasapalabra', short: 'PP',
    spawn: { x: 0, z: 10.4, yaw: 0 },
    portal: { x: -4.2, z: -7.0, yaw: 0.15 },  // clear floor in front of LED
    fog: '#071233', bg: '#050a1e',
    planos: [
      { id: 'aereo', label: 'Aéreo', pos: [0, 22, 2], look: [0, 0, 0], accent: '#3a9dff' },
      { id: 'frente', label: 'Frente', pos: [0, 4.5, 16], look: [0, 1.5, 0], accent: '#5fb8ff' },
      { id: 'lado', label: 'Lado', pos: [14, 5, 4], look: [0, 1.2, 0], accent: '#ff8a2a' },
      { id: 'gradas', label: 'Gradas', pos: [10, 6, -4], look: [0, 1, 2], accent: '#9fd0ff' },
      { id: 'led', label: 'LED', pos: [-2, 3.2, 2], look: [-3.6, 3, -10], accent: '#7fd0ff' },
      { id: 'puerta', label: 'Puerta', pos: [2, 4.5, 2], look: [-4.2, 2.2, -7], accent: '#5ec8ff' }
    ],
    floorHeight(x, z) {
      const r = Math.hypot(x, z)
      if (r < 3.12) return 1.38
      if (r < 3.65) return 0.82
      if (r < 5.9) return 0.26
      if (Math.hypot(x + 6.6, z + 5.4) < 2.85) return 0.44
      return 0
    },
    collide(x, z, y) {
      ;[x, z] = clampRadius(x, z, 15.4)
      if (z < -10.6) z = -10.6
      const r = Math.hypot(x, z)
      const th = Math.atan2(x, z) * (180 / Math.PI)
      if (th > 40 && th < 144 && r > 9.55) { x *= 9.55 / r; z *= 9.55 / r }
      const solids: [number, number, number][] = [
        [-7.4, -5.2, 0.5], [-5.7, -5.7, 0.5], [-10.6, 2.6, 0.9], [-9.0, 6.4, 0.7],
        [8.5, 2.5, 0.7], [1.8, 7.4, 0.55]
      ]
      if (y < 1.05) {
        for (const ang of [-62, -24, 24, 62]) {
          const a = ang * (Math.PI / 180)
          solids.push([Math.sin(a) * 3.75, Math.cos(a) * 3.75, 0.38])
        }
      }
      for (const [cx, cz, rr] of solids) [x, z] = pushCircle(x, z, cx, cz, rr + BODY)
      return [x, z]
    }
  },
  rueda: {
    id: 'rueda', label: 'Rueda la letra', short: 'RL',
    spawn: { x: 0, z: 8, yaw: 0 },
    portal: { x: 9.5, z: -2, yaw: -0.8 },  // rueda
    fog: '#071233', bg: '#050a1e',
    planos: [
      { id: 'aereo', label: 'Aéreo', pos: [0, 18, 1], look: [0, 0, 0], accent: '#ff8a2a' },
      { id: 'frente', label: 'Frente', pos: [0, 3.5, 13], look: [0, 1.5, -2], accent: '#3a9dff' },
      { id: 'led', label: 'LED', pos: [0, 3, 2], look: [0, 3, -10], accent: '#7fd0ff' },
      { id: 'lado', label: 'Lado', pos: [11, 4, 2], look: [0, 1, 0], accent: '#ffaa44' }
    ],
    floorHeight(x, z) {
      const r = Math.hypot(x, z)
      if (r < 5.3) return 0.38
      return 0
    },
    collide(x, z) { return clampRadius(x, z, 12.5) }
  },
  ahora: {
    id: 'ahora', label: 'Ahora Caigo', short: 'AC',
    spawn: { x: 0, z: 8.2, yaw: 0 },
    portal: { x: 10.5, z: 2.5, yaw: -1.2 },  // ahora side
    fog: '#06103a', bg: '#04081c',
    planos: [
      { id: 'aereo', label: 'Aéreo', pos: [0, 18, 1], look: [0, 0, 0], accent: '#ffcc00' },
      { id: 'frente', label: 'Frente', pos: [0, 3.2, 13], look: [0, 1.2, 0], accent: '#3a6dff' },
      { id: 'torre', label: 'Torre', pos: [0, 4, 2], look: [0, 4, -10], accent: '#ffcc00' },
      { id: 'lado', label: 'Lado', pos: [11, 4, 2], look: [0, 1, 0], accent: '#ff5555' }
    ],
    floorHeight(x, z) {
      const r = Math.hypot(x, z)
      if (r < 2.5) return 0.72
      if (r < 7.4) return 0.05
      return 0
    },
    collide(x, z, y) {
      ;[x, z] = clampRadius(x, z, 13.2)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8
        if (y < 0.55) [x, z] = pushCircle(x, z, Math.sin(a) * 5.05, Math.cos(a) * 5.05, 0.9)
      }
      return [x, z]
    }
  },
  cocina: {
    id: 'cocina', label: 'Cocina', short: 'CO',
    spawn: { x: 0, z: 5.5, yaw: 0 },
    portal: { x: 6.5, z: -4.5, yaw: -0.3 },  // cocina back-right
    fog: '#1a2030', bg: '#12161e',
    planos: [
      { id: 'aereo', label: 'Aéreo', pos: [0, 12, 1], look: [0, 0, 0], accent: '#1a6adf' },
      { id: 'frente', label: 'Frente', pos: [0, 2.8, 10], look: [0, 1.2, -2], accent: '#ffffff' },
      { id: 'isla', label: 'Islas', pos: [5, 3, 3], look: [0, 1, 0], accent: '#2a3038' },
      { id: 'azul', label: 'Muro', pos: [0, 2.5, 0], look: [0, 2.5, -6], accent: '#1a6adf' }
    ],
    floorHeight() { return 0 },
    collide(x, z, y) {
      if (x < -7.5) x = -7.5; if (x > 7.5) x = 7.5
      if (z < -6.5) z = -6.5; if (z > 7.5) z = 7.5
      if (y < 1.05) {
        ;[x, z] = pushBox(x, z, 0, 2.2, 2.45, 0.78)
        ;[x, z] = pushBox(x, z, -1.5, -0.6, 1.45, 0.78)
        ;[x, z] = pushBox(x, z, -3.6, -5.9, 1.9, 0.65)
        ;[x, z] = pushBox(x, z, 5.0, -5.5, 0.8, 0.7)
        ;[x, z] = pushBox(x, z, 1.5, -5.7, 2.8, 0.45)
      }
      return [x, z]
    }
  },
  abismo: {
    id: 'abismo', label: 'Acierta o el Abismo', short: 'AA',
    spawn: { x: 0, z: 7.5, yaw: 0 },
    portal: { x: 10, z: 2, yaw: -1.1 },  // abismo
    fog: '#071440', bg: '#050c28',
    planos: [
      { id: 'aereo', label: 'Aéreo', pos: [0, 16, 1], look: [0, 0, 0], accent: '#ffcc00' },
      { id: 'frente', label: 'Frente', pos: [0, 3, 12], look: [0, 1, 0], accent: '#3a8dff' },
      { id: 'logo', label: 'Logo', pos: [0, 3, 3], look: [0, 3, -9], accent: '#ffffff' },
      { id: 'lado', label: 'Lado', pos: [10, 4, 2], look: [0, 1, 0], accent: '#ffd24a' }
    ],
    floorHeight(x, z) {
      const r = Math.hypot(x, z)
      if (r < 4.2) return 0.42
      return 0
    },
    collide(x, z) { return clampRadius(x, z, 12.5) }
  },
  boom: {
    id: 'boom', label: 'Boom', short: 'BO',
    spawn: { x: 0, z: 7, yaw: 0 },
    portal: { x: -9.5, z: 2, yaw: 1.0 },  // boom
    fog: '#1a0804', bg: '#0c0402',
    planos: [
      { id: 'aereo', label: 'Aéreo', pos: [0, 16, 1], look: [0, 0, 0], accent: '#ff6a1a' },
      { id: 'frente', label: 'Frente', pos: [0, 3, 12], look: [0, 1.2, 0], accent: '#ff3a00' },
      { id: 'logo', label: 'Logo', pos: [0, 3, 2], look: [0, 3.5, -9], accent: '#ff8020' },
      { id: 'mesa', label: 'Mesa', pos: [4, 2.5, 5], look: [0, 1, 2], accent: '#ffaa44' }
    ],
    floorHeight() { return 0 },
    collide(x, z, y) {
      ;[x, z] = clampRadius(x, z, 12)
      if (y < 1.1) [x, z] = pushBox(x, z, 0, 2.0, 2.8, 0.7)
      return [x, z]
    }
  }
}

export const SET_ORDER: SetId[] = ['pasapalabra', 'rueda', 'ahora', 'cocina', 'abismo', 'boom']
