import * as THREE from 'three'

export function chevronTex(bg = '#0a2a80', fg = '#ffcc00', w = 256, h = 128) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = bg; g.fillRect(0, 0, w, h)
  g.fillStyle = fg
  const rowH = h / 2
  for (let row = 0; row < 2; row++) {
    for (let i = -1; i < 5; i++) {
      const x = i * (w / 3) + (row % 2) * (w / 6)
      g.beginPath()
      g.moveTo(x, row * rowH + 4)
      g.lineTo(x + w / 6, row * rowH + rowH / 2)
      g.lineTo(x, row * rowH + rowH - 4)
      g.lineTo(x - w / 12, row * rowH + rowH - 4)
      g.lineTo(x + w / 6 - w / 12, row * rowH + rowH / 2)
      g.lineTo(x - w / 12, row * rowH + 4)
      g.closePath(); g.fill()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(6, 2)
  return t
}

export function radialFloorTex(bg = '#071a40', line = '#cfe8ff', size = 512) {
  const c = document.createElement('canvas'); c.width = size; c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = bg; g.fillRect(0, 0, size, size)
  g.strokeStyle = line; g.lineWidth = 2
  const cx = size / 2, cy = size / 2
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    g.beginPath(); g.moveTo(cx, cy)
    g.lineTo(cx + Math.cos(a) * size, cy + Math.sin(a) * size); g.stroke()
  }
  for (let r = 0.2; r < 1; r += 0.2) {
    g.beginPath(); g.arc(cx, cy, r * size * 0.48, 0, Math.PI * 2); g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function logoScreenTex(title: string, sub = '', bg = '#0a3a9a') {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(512, 260, 40, 512, 260, 420)
  grd.addColorStop(0, '#1a6adf'); grd.addColorStop(1, bg)
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 512)
  g.fillStyle = '#ffffff'
  g.font = "900 72px 'Nunito', sans-serif"
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 12
  g.fillText(title, 512, sub ? 230 : 256)
  if (sub) {
    g.font = "800 48px 'Nunito', sans-serif"
    g.fillText(sub, 512, 300)
  }
  // subtle fan note
  g.shadowBlur = 0
  g.font = "700 18px 'Nunito', sans-serif"
  g.fillStyle = 'rgba(255,255,255,.35)'
  g.fillText('Fan remake · no oficial', 512, 470)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function brickTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#c4a882'; g.fillRect(0, 0, 256, 256)
  g.fillStyle = '#b08968'
  for (let row = 0; row < 10; row++) {
    const y = row * 26
    const off = row % 2 ? 30 : 0
    for (let col = -1; col < 6; col++) {
      g.fillRect(col * 60 + off + 2, y + 2, 54, 22)
    }
  }
  g.strokeStyle = '#d8c2a4'; g.lineWidth = 2
  for (let row = 0; row < 10; row++) {
    g.beginPath(); g.moveTo(0, row * 26); g.lineTo(256, row * 26); g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 3)
  return t
}
