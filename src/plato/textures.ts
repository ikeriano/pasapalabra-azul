import * as THREE from 'three'

const LETTERS = 'ABCDEFGHIJLMNÑOPQRSTUVXYZ'
const LOGO_FONT = "600 {S}px 'Fredoka', 'Nunito', sans-serif"
const BOLD = "900 {S}px 'Nunito', sans-serif"
const f = (tpl: string, s: number) => tpl.replace('{S}', String(Math.round(s)))

function rnd(seed: number) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
function canvas(w: number, h: number) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  return [c, c.getContext('2d')!] as const
}
function tex(c: HTMLCanvasElement, opts: { repeatX?: number; repeatY?: number; aniso?: number } = {}) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = opts.aniso ?? 4
  if (opts.repeatX || opts.repeatY) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(opts.repeatX ?? 1, opts.repeatY ?? 1) }
  t.needsUpdate = true
  return t
}
export async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load("600 64px 'Fredoka'"),
      document.fonts.load("900 64px 'Nunito'"),
      document.fonts.load("800 64px 'Nunito'")
    ])
  } catch {}
}

/** Floor: 40m x 40m, canvas top = world -Z. */
export function floorTexture() {
  const N = 2048, M = 40, px = (m: number) => ((m + M / 2) / M) * N
  const [c, g] = canvas(N, N)
  const bg = g.createRadialGradient(N / 2, N / 2, 50, N / 2, N / 2, N * 0.62)
  bg.addColorStop(0, '#1438a8'); bg.addColorStop(0.45, '#0d2a92'); bg.addColorStop(1, '#06124a')
  g.fillStyle = bg; g.fillRect(0, 0, N, N)
  // light pools (fake spot lights / reflections)
  const r = rnd(7)
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = 6 + r() * 7
    const x = px(Math.sin(a) * d), y = px(Math.cos(a) * d), s = 40 + r() * 70
    const gr = g.createRadialGradient(x, y, 0, x, y, s)
    gr.addColorStop(0, 'rgba(120,170,255,.55)'); gr.addColorStop(1, 'rgba(120,170,255,0)')
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, s, s * 0.8, 0, 0, Math.PI * 2); g.fill()
  }
  // glow around the central platform
  const halo = g.createRadialGradient(px(0), px(0), px(5.2) - px(0), px(0), px(0), px(7.4) - px(0))
  halo.addColorStop(0, 'rgba(190,225,255,.5)'); halo.addColorStop(1, 'rgba(120,180,255,0)')
  g.fillStyle = halo; g.beginPath(); g.arc(px(0), px(0), px(7.4) - px(0), 0, Math.PI * 2); g.fill()
  // white curved path (swoosh)
  g.lineCap = 'round'
  g.strokeStyle = '#eef4ff'; g.lineWidth = (N / M) * 1.25
  g.shadowColor = 'rgba(200,230,255,.9)'; g.shadowBlur = 30
  g.beginPath(); g.arc(px(0), px(0), (N / M) * 7.3, Math.PI * 0.08, Math.PI * 0.95); g.stroke()
  g.beginPath(); g.moveTo(px(-6.9), px(2.4)); g.bezierCurveTo(px(-9.5), px(-1), px(-9.8), px(-3.5), px(-8.8), px(-5.6)); g.stroke()
  g.beginPath(); g.moveTo(px(7.1), px(1.9)); g.bezierCurveTo(px(9.4), px(-1.5), px(8.6), px(-5), px(6.4), px(-7.4)); g.stroke()
  g.shadowBlur = 0
  // big outlined letters around the set
  const word = 'PASAPALABRA'
  const R0 = 10.6, a0 = -2.55, a1 = 0.75
  g.font = f(LOGO_FONT, (N / M) * 2.9)
  g.textAlign = 'center'; g.textBaseline = 'middle'
  for (let i = 0; i < word.length; i++) {
    const t = a0 + ((a1 - a0) * i) / (word.length - 1)
    const x = px(Math.sin(t) * R0), y = px(Math.cos(t) * R0)
    g.save(); g.translate(x, y); g.rotate(-t)
    const ch = word[i].toLowerCase()
    g.fillStyle = 'rgba(40,120,255,.28)'; g.fillText(ch, 0, 0)
    g.lineWidth = 14; g.strokeStyle = 'rgba(150,220,255,.55)'; g.shadowColor = '#bfe8ff'; g.shadowBlur = 30; g.strokeText(ch, 0, 0)
    g.lineWidth = 7; g.strokeStyle = '#f2fbff'; g.shadowBlur = 0; g.strokeText(ch, 0, 0)
    g.restore()
  }
  // a few extra letters near the silla area
  ;[['P', -11.5, -6, 0.9], ['S', -12.5, -2, 1.3], ['R', 11.8, -5, -1], ['X', 12, -1, -1.4]].forEach(([ch, x, z, rot]) => {
    g.save(); g.translate(px(x as number), px(z as number)); g.rotate(rot as number)
    g.lineWidth = 5; g.strokeStyle = '#e9f6ff'; g.shadowColor = '#9fdcff'; g.shadowBlur = 18; g.strokeText(ch as string, 0, 0); g.restore()
  })
  return tex(c, { aniso: 8 })
}

function concentric(g: CanvasRenderingContext2D, cx: number, cy: number, maxR: number, c1: string, c2: string, step: number) {
  for (let rr = maxR, i = 0; rr > 4; rr -= step, i++) {
    const gr = g.createRadialGradient(cx, cy, Math.max(0, rr - step), cx, cy, rr)
    gr.addColorStop(0, i % 2 ? c1 : c2); gr.addColorStop(1, i % 2 ? c2 : c1)
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill()
  }
}
function scatterLetters(g: CanvasRenderingContext2D, w: number, h: number, n: number, seed: number, color: string, min: number, max: number, font = BOLD) {
  const r = rnd(seed)
  g.textAlign = 'center'; g.textBaseline = 'middle'
  for (let i = 0; i < n; i++) {
    const s = min + r() * (max - min)
    g.font = f(font, s)
    g.globalAlpha = 0.25 + r() * 0.6
    g.fillStyle = color
    g.fillText(LETTERS[Math.floor(r() * LETTERS.length)], r() * w, r() * h)
  }
  g.globalAlpha = 1
}

/** Soft letter "sphere" (cluster of white letters) used behind the rotating logo on the main LED. */
function letterSphere(g: CanvasRenderingContext2D, cx: number, cy: number, R: number, seed: number) {
  const r = rnd(seed)
  // soft blue glow behind the sphere
  const glow = g.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.15)
  glow.addColorStop(0, 'rgba(180,230,255,.55)'); glow.addColorStop(0.45, 'rgba(90,180,255,.22)'); glow.addColorStop(1, 'rgba(40,120,230,0)')
  g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, R * 1.15, 0, Math.PI * 2); g.fill()
  // denser letters near the rim, fewer in the centre — reads as a translucent sphere
  for (let i = 0; i < 220; i++) {
    const a = r() * Math.PI * 2
    const rad = Math.pow(r(), 0.55) * R
    const x = cx + Math.cos(a) * rad
    const y = cy + Math.sin(a) * rad * 0.92
    const depth = 1 - rad / R
    const size = 18 + depth * 55 + r() * 30
    g.globalAlpha = 0.25 + depth * 0.7
    g.font = f(BOLD, size)
    g.fillStyle = '#ffffff'
    g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(LETTERS[Math.floor(r() * LETTERS.length)], x, y)
  }
  g.globalAlpha = 1
}

/**
 * Main LED backdrop (refs 13–14): blue field + floating letters + central letter sphere.
 * The rotating Pasapalabra logo is a separate mesh drawn in front — keep this texture static.
 */
export function ledWallTexture() {
  const W = 2048, H = 1024
  const [c, g] = canvas(W, H)
  const bg = g.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#6ec8ff'); bg.addColorStop(0.45, '#2f96f5'); bg.addColorStop(1, '#1768d8')
  g.fillStyle = bg; g.fillRect(0, 0, W, H)
  // soft bokeh circles
  const rr = rnd(9)
  for (let i = 0; i < 18; i++) {
    const x = rr() * W, y = rr() * H, rad = 40 + rr() * 160
    const bo = g.createRadialGradient(x, y, 0, x, y, rad)
    bo.addColorStop(0, `rgba(200,240,255,${0.08 + rr() * 0.12})`); bo.addColorStop(1, 'rgba(200,240,255,0)')
    g.fillStyle = bo; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill()
  }
  concentric(g, W * 0.5, H * 0.55, W * 0.75, '#2488ef', '#6ec4ff', 52)
  // soft scattered letters only at the edges — the rotating sphere is a separate 3D mesh
  scatterLetters(g, W, H, 55, 3, '#ffffff', 24, 90)
  g.font = f(BOLD, 180); g.fillStyle = '#ffffff'; g.globalAlpha = 0.4; g.textAlign = 'center'
  g.fillText('H', W * 0.92, H * 0.22); g.fillText('Z', W * 0.08, H * 0.82); g.fillText('Ñ', W * 0.9, H * 0.85)
  g.globalAlpha = 1
  // LED pixel grid
  g.fillStyle = 'rgba(0,30,90,.10)'
  for (let x = 0; x < W; x += 8) g.fillRect(x, 0, 2, H)
  return tex(c)
}

/** Fixed white 'Pasapalabra' wordmark for the main LED (never rotates). */
export function pasapalabraWordmarkTexture() {
  const W = 2048, H = 512
  const [c, g] = canvas(W, H)
  g.clearRect(0, 0, W, H)
  g.font = f(LOGO_FONT, 220)
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.shadowColor = 'rgba(0,40,140,.55)'; g.shadowBlur = 28
  g.fillStyle = '#ffffff'
  g.fillText('Pasapalabra', W / 2, H / 2 + 10)
  g.shadowBlur = 0
  return tex(c)
}

/** Soft cyan glow disc behind the letter sphere. */

export function ruedaWordmarkTexture() {
  const W = 1024, H = 256
  const [c, g] = canvas(W, H)
  g.clearRect(0, 0, W, H)
  g.font = f(LOGO_FONT, 110)
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillStyle = '#ffffff'
  g.shadowColor = 'rgba(160,220,255,.95)'; g.shadowBlur = 18
  g.fillText('Rueda la letra', W / 2, H * 0.52)
  return tex(c)
}

export function sphereGlowTexture() {
  const N = 512
  const [c, g] = canvas(N, N)
  const gr = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2)
  gr.addColorStop(0, 'rgba(180,230,255,.55)')
  gr.addColorStop(0.45, 'rgba(90,180,255,.22)')
  gr.addColorStop(1, 'rgba(40,120,230,0)')
  g.fillStyle = gr; g.fillRect(0, 0, N, N)
  return tex(c)
}

export function sidePanelTexture(seed: number) {
  const W = 512, H = 1536
  const [c, g] = canvas(W, H)
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#3ea6ff'); bg.addColorStop(1, '#1462d8')
  g.fillStyle = bg; g.fillRect(0, 0, W, H)
  concentric(g, W * 0.9, H * 0.5, H * 0.7, '#1f78ea', '#4fb0ff', 40)
  scatterLetters(g, W, H, 30, seed, '#e8f6ff', 50, 150)
  return tex(c)
}

export function orangePanelTexture(letter: string, seed: number) {
  const W = 512, H = 1792
  const [c, g] = canvas(W, H)
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#ffb04a'); bg.addColorStop(1, '#f2691c')
  g.fillStyle = bg; g.fillRect(0, 0, W, H)
  concentric(g, W * 0.15, H * 0.5, H * 0.75, '#f57a22', '#ffb956', 44)
  scatterLetters(g, W, H, 14, seed, '#fff3e0', 50, 120)
  g.font = f(BOLD, 260); g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.shadowColor = 'rgba(160,60,0,.5)'; g.shadowBlur = 20
  g.fillText(letter, W / 2, H * 0.32)
  return tex(c)
}

export function ledBandTexture(mirror = false, bg1 = '#1b5cff', bg2 = '#0a2fd0', text = '#ffffff') {
  const W = 2048, H = 256
  const [c, g] = canvas(W, H)
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, bg1); bg.addColorStop(0.5, '#2f7bff'); bg.addColorStop(1, bg2)
  g.fillStyle = bg; g.fillRect(0, 0, W, H)
  g.save()
  if (mirror) { g.translate(W, 0); g.scale(-1, 1) }
  g.font = f(LOGO_FONT, 130); g.fillStyle = text; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.shadowColor = 'rgba(255,255,255,.6)'; g.shadowBlur = 14
  for (let i = 0; i < 2; i++) g.fillText('pasapalabra', (W / 2) * (i + 0.5), H * 0.52)
  g.restore()
  g.fillStyle = 'rgba(0,20,80,.15)'
  for (let y = 0; y < H; y += 6) g.fillRect(0, y, W, 2)
  return tex(c, { repeatX: 1 })
}

export function dotsWallTexture() {
  const W = 1024, H = 512
  const [c, g] = canvas(W, H)
  g.fillStyle = '#26397a'; g.fillRect(0, 0, W, H)
  const r = rnd(11)
  for (let col = 0; col < 8; col++) {
    const x0 = col * 128
    const gr = g.createLinearGradient(x0, 0, x0 + 128, 0)
    gr.addColorStop(0, '#4a66b8'); gr.addColorStop(0.55, '#9db3ea'); gr.addColorStop(1, '#3b56a8')
    g.fillStyle = gr; g.fillRect(x0 + 6, 0, 116, H)
    for (let i = 0; i < 110; i++) {
      g.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.65})`
      const x = x0 + 14 + Math.floor(r() * 12) * 9, y = Math.floor(r() * 56) * 9
      g.fillRect(x, y, 3, 3)
    }
  }
  return tex(c, { repeatX: 10 })
}

export function gradasTexture(word: boolean, seed: number) {
  const W = 2048, H = 256
  const [c, g] = canvas(W, H)
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#3a8cff'); bg.addColorStop(1, '#1c5fe0')
  g.fillStyle = bg; g.fillRect(0, 0, W, H)
  if (word) {
    g.font = f(LOGO_FONT, 200); g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillStyle = 'rgba(210,235,255,.85)'; g.strokeStyle = '#ffffff'; g.lineWidth = 4
    for (let i = 0; i < 2; i++) { g.fillText('pasapalabra', W * (0.25 + i * 0.5), H * 0.5); g.strokeText('pasapalabra', W * (0.25 + i * 0.5), H * 0.5) }
  } else {
    scatterLetters(g, W, H, 40, seed, '#d9eeff', 60, 180, LOGO_FONT)
  }
  return tex(c)
}

export function roscoCenterTexture() {
  const N = 512
  const [c, g] = canvas(N, N)
  const bg = g.createRadialGradient(N / 2, N / 2, 10, N / 2, N / 2, N / 2)
  bg.addColorStop(0, '#0e3d4d'); bg.addColorStop(1, '#06202c')
  g.fillStyle = bg; g.fillRect(0, 0, N, N)
  for (let k = 0; k < 4; k++) { g.strokeStyle = `rgba(80,200,230,${0.25 + k * 0.1})`; g.lineWidth = 3; g.beginPath(); g.arc(N / 2, N / 2, 70 + k * 45, 0, Math.PI * 2); g.stroke() }
  for (let i = 0; i < 25; i++) {
    const a = (i / 25) * Math.PI * 2 - Math.PI / 2
    g.fillStyle = i % 3 === 0 ? '#ff7a2a' : i % 3 === 1 ? '#ffb347' : '#3fd2ff'
    g.beginPath(); g.arc(N / 2 + Math.cos(a) * 160, N / 2 + Math.sin(a) * 160, 12, 0, Math.PI * 2); g.fill()
  }
  g.font = f(LOGO_FONT, 54); g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('pasapalabra', N / 2, N / 2)
  return tex(c)
}

export function tableTopTexture() {
  const N = 1024
  const [c, g] = canvas(N, N)
  g.clearRect(0, 0, N, N)
  const gr = g.createRadialGradient(N / 2, N / 2, N * 0.2, N / 2, N / 2, N / 2)
  gr.addColorStop(0, 'rgba(170,220,255,.55)'); gr.addColorStop(1, 'rgba(220,240,255,.85)')
  g.fillStyle = gr; g.beginPath(); g.arc(N / 2, N / 2, N / 2, 0, Math.PI * 2); g.fill()
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 5
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2
    g.beginPath(); g.moveTo(N / 2 + Math.cos(a) * N * 0.24, N / 2 + Math.sin(a) * N * 0.24); g.lineTo(N / 2 + Math.cos(a) * N * 0.34, N / 2 + Math.sin(a) * N * 0.34); g.stroke()
  }
  g.strokeStyle = 'rgba(80,200,255,.9)'; g.lineWidth = 10; g.beginPath(); g.arc(N / 2, N / 2, N * 0.49, 0, Math.PI * 2); g.stroke()
  return tex(c)
}

export function slatsTexture() {
  const W = 1024, H = 256
  const [c, g] = canvas(W, H)
  g.fillStyle = '#f4f8ff'; g.fillRect(0, 0, W, H)
  for (let x = 0; x < W; x += 32) { g.fillStyle = '#b9c7dc'; g.fillRect(x, 0, 6, H); g.fillStyle = '#ffffff'; g.fillRect(x + 6, 0, 4, H) }
  const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(0,30,90,.25)'); sh.addColorStop(0.3, 'rgba(0,0,0,0)')
  g.fillStyle = sh; g.fillRect(0, 0, W, H)
  return tex(c, { repeatX: 3 })
}

export function podiumTexture(color: string) {
  const W = 512, H = 1024
  const [c, g] = canvas(W, H)
  g.fillStyle = '#f7fbff'; g.fillRect(0, 0, W, H)
  scatterLetters(g, W, H, 26, color === '#ff8a2a' ? 5 : 9, color, 90, 200, LOGO_FONT)
  return tex(c, { repeatX: 2 })
}

export function labelTexture(text: string, accent = '#ff8a2a') {
  const W = 1024, H = 256
  const [c, g] = canvas(W, H)
  g.shadowColor = 'rgba(120,200,255,.95)'; g.shadowBlur = 40
  const x = 40, y = 40, w = W - 80, h = H - 80, r = h / 2
  g.fillStyle = 'rgba(10,40,130,.82)'
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.fill()
  g.shadowBlur = 0
  g.lineWidth = 8; g.strokeStyle = '#ffffff'; g.stroke()
  g.fillStyle = accent; g.beginPath(); g.arc(x + r, y + h / 2, r * 0.5, 0, Math.PI * 2); g.fill()
  let fs = 86
  g.font = f(BOLD, fs)
  while (g.measureText(text).width > w - r * 2.3 && fs > 40) { fs -= 2; g.font = f(BOLD, fs) }
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 6
  g.fillText(text, W / 2 + 30, H / 2 + 4)
  return tex(c)
}

export function glowTexture() {
  const N = 256
  const [c, g] = canvas(N, N)
  const gr = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2)
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(180,220,255,.5)'); gr.addColorStop(1, 'rgba(120,180,255,0)')
  g.fillStyle = gr; g.fillRect(0, 0, N, N)
  return tex(c)
}

function rrect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath()
}
function screenBg(g: CanvasRenderingContext2D, N: number) {
  const gr = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N * 0.75)
  gr.addColorStop(0, '#1a93fb'); gr.addColorStop(1, '#0a63e0')
  g.fillStyle = gr; g.fillRect(0, 0, N, N)
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 14
  for (const k of [0.25, 0.4, 0.55]) { g.beginPath(); g.arc(N / 2, N / 2, N * k, 0, Math.PI * 2); g.stroke() }
}
/** Monitor next to the SOPA DE LETRAS spot: 5x5 letter tiles with a found word in green. */
export function sopaBoardTexture() {
  const N = 512
  const [c, g] = canvas(N, N)
  screenBg(g, N)
  const L = 'TIGREAOMBUSCERDOLRATAPUGN'
  const green = new Set([0, 1, 2, 3, 4, 13, 14, 15, 16])
  const s = 78, gap = 10, x0 = (N - (5 * s + 4 * gap)) / 2, y0 = 70
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = f(BOLD, 46)
  for (let i = 0; i < 25; i++) {
    const x = x0 + (i % 5) * (s + gap), y = y0 + Math.floor(i / 5) * (s + gap)
    g.fillStyle = 'rgba(0,30,110,.35)'; rrect(g, x, y + 5, s, s, 14); g.fill()
    g.fillStyle = green.has(i) ? '#5fd43a' : '#f5f8fa'; rrect(g, x, y, s, s, 14); g.fill()
    g.fillStyle = green.has(i) ? '#ffffff' : '#3d8ee8'; g.fillText(L[i], x + s / 2, y + s / 2 + 3)
  }
  return tex(c)
}
/** Monitor next to the ¿DÓNDE ESTÁN? spot: 3x3 numbered glossy pills. */
export function dondeBoardTexture() {
  const N = 512
  const [c, g] = canvas(N, N)
  screenBg(g, N)
  g.fillStyle = '#ffffff'; rrect(g, 56, 50, N - 112, 100, 22); g.fill()
  g.fillStyle = '#5aa6ee'; g.font = f(BOLD, 50); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('CORRER', N / 2, 103)
  const w = 118, h = 70, gx = 16, gy = 22, x0 = (N - (3 * w + 2 * gx)) / 2, y0 = 190
  for (let i = 0; i < 9; i++) {
    const x = x0 + (i % 3) * (w + gx), y = y0 + Math.floor(i / 3) * (h + gy)
    const gr = g.createLinearGradient(0, y, 0, y + h)
    gr.addColorStop(0, i === 4 ? '#9af06a' : '#7aedfe'); gr.addColorStop(1, i === 4 ? '#4fcf2a' : '#21a7fe')
    g.fillStyle = gr; rrect(g, x, y, w, h, h / 2); g.fill()
    g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.stroke()
    g.fillStyle = '#ffffff'; g.font = f(BOLD, 38); g.fillText(String(i + 1), x + w / 2, y + h / 2 + 2)
  }
  return tex(c)
}
