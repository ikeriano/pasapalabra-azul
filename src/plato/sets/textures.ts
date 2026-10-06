import * as THREE from 'three'

export function chevronTex(bg = '#0a2a80', fg = '#ffcc00', w = 512, h = 256) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = bg; g.fillRect(0, 0, w, h)
  g.fillStyle = fg
  const rows = 3, cols = 4
  const cw = w / cols, ch = h / rows
  for (let row = 0; row < rows; row++) {
    for (let col = -1; col < cols + 1; col++) {
      const x = col * cw + (row % 2) * (cw * 0.5)
      const y = row * ch
      g.beginPath()
      g.moveTo(x, y + 8)
      g.lineTo(x + cw * 0.55, y + ch * 0.5)
      g.lineTo(x, y + ch - 8)
      g.lineTo(x - cw * 0.18, y + ch - 8)
      g.lineTo(x + cw * 0.37, y + ch * 0.5)
      g.lineTo(x - cw * 0.18, y + 8)
      g.closePath(); g.fill()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 2)
  return t
}

export function radialFloorTex(bg = '#071a40', line = '#cfe8ff', size = 1024, spokes = 24) {
  const c = document.createElement('canvas'); c.width = size; c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = bg; g.fillRect(0, 0, size, size)
  const cx = size / 2, cy = size / 2
  g.strokeStyle = line; g.lineWidth = 3
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2
    g.beginPath(); g.moveTo(cx, cy)
    g.lineTo(cx + Math.cos(a) * size, cy + Math.sin(a) * size); g.stroke()
  }
  g.lineWidth = 2
  for (let r = 0.15; r < 1; r += 0.12) {
    g.beginPath(); g.arc(cx, cy, r * size * 0.48, 0, Math.PI * 2); g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function logoScreenTex(lines: string[], opts?: { bg?: string; accent?: string; scoreTop?: string; scoreBot?: string }) {
  const bg = opts?.bg ?? '#0a3a9a'
  const accent = opts?.accent ?? '#ffcc00'
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(512, 480, 40, 512, 480, 620)
  grd.addColorStop(0, '#2a7aef'); grd.addColorStop(1, bg)
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 1024)
  // subtle burst
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2
    g.beginPath(); g.moveTo(512, 480)
    g.lineTo(512 + Math.cos(a) * 700, 480 + Math.sin(a) * 700); g.stroke()
  }
  if (opts?.scoreTop != null) {
    roundPill(g, 362, 70, 300, 70, accent, opts.scoreTop, '#1a1a1a')
  }
  g.fillStyle = '#ffffff'
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 14
  const startY = lines.length === 1 ? 500 : 430
  lines.forEach((ln, i) => {
    g.font = i === 0 ? "900 92px 'Nunito', sans-serif" : "900 78px 'Nunito', sans-serif"
    g.fillText(ln, 512, startY + i * 95)
  })
  if (opts?.scoreBot != null) {
    g.shadowBlur = 0
    roundPill(g, 362, 860, 300, 70, accent, opts.scoreBot, '#1a1a1a')
  }
  g.shadowBlur = 0
  g.font = "700 20px 'Nunito', sans-serif"
  g.fillStyle = 'rgba(255,255,255,.3)'
  g.fillText('Fan remake · no oficial', 512, 990)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function roundPill(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, text: string, textColor: string) {
  const r = h / 2
  g.fillStyle = fill
  g.beginPath()
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r); g.closePath(); g.fill()
  g.fillStyle = textColor
  g.font = "900 48px 'Nunito', sans-serif"
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(text, x + w / 2, y + h / 2 + 2)
}

export function blueSlatTex() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 512
  const g = c.getContext('2d')!
  for (let y = 0; y < 512; y += 20) {
    g.fillStyle = y % 40 === 0 ? '#1a6adf' : '#2a82f0'
    g.fillRect(0, y, 128, 18)
    g.fillStyle = 'rgba(255,255,255,.12)'
    g.fillRect(0, y, 128, 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(8, 2)
  return t
}

export function letterFloorTex(bg = '#0a2060', letter = 'rgba(200,225,255,.42)') {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024
  const g = c.getContext('2d')!
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 1024)
  // glossy vignette
  const grd = g.createRadialGradient(512, 512, 100, 512, 512, 700)
  grd.addColorStop(0, 'rgba(40,100,200,.25)'); grd.addColorStop(1, 'rgba(0,0,0,.35)')
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 1024)
  g.fillStyle = letter
  g.font = "900 110px 'Nunito', sans-serif"
  const chars = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
  for (let i = 0; i < 48; i++) {
    g.save()
    g.translate(60 + (i * 137) % 920, 70 + Math.floor(i * 1.7) % 15 * 60)
    g.rotate(((i * 37) % 50 - 25) * Math.PI / 180)
    g.globalAlpha = 0.25 + (i % 5) * 0.08
    g.fillText(chars[i % chars.length], 0, 0)
    g.restore()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function ribbonTex(text = 'Rueda la letra') {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 128
  const g = c.getContext('2d')!
  const bg = g.createLinearGradient(0, 0, 0, 128)
  bg.addColorStop(0, '#5eb8ff'); bg.addColorStop(1, '#1a6adf')
  g.fillStyle = bg; g.fillRect(0, 0, 2048, 128)
  g.font = "900 70px 'Nunito', sans-serif"
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.shadowColor = 'rgba(255,255,255,.5)'; g.shadowBlur = 10
  for (let i = 0; i < 4; i++) g.fillText(text, 256 + i * 512, 68)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.repeat.x = 2
  return t
}

export function boomLogoTex() {
  return logoScreenTex(['¡BOOM!'], { bg: '#3a1008', accent: '#ff6a1a' })
}
