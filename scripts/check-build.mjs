// Post-build sanity check: `npm run check` (= build + this script)
import fs from 'fs'
import path from 'path'
const dist = path.resolve('dist')
const must = ['index.html', 'sw.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'logo-pasapalabra.png', 'audio/sfx-a.mp3', 'audio/sfx-b.mp3', 'audio/track-medium.mp3', 'audio/track-large-13mb.mp3']
let ok = true
for (const f of must) {
  const p = path.join(dist, f)
  if (!fs.existsSync(p)) { console.log('✗ missing', f); ok = false } else console.log('✓', f.padEnd(34), (fs.statSync(p).size / 1024).toFixed(1).padStart(9), 'KB')
}
const js = fs.readdirSync(path.join(dist, 'assets')).filter((f) => f.endsWith('.js'))
const all = js.map((f) => fs.readFileSync(path.join(dist, 'assets', f), 'utf8')).join('\n')
for (const s of ['SOPA DE LETRAS', '¿DÓNDE ESTÁN?', 'LA SILLA AZUL', 'UNA DE CUATRO', 'EL ROSCO', 'A LA Z', 'Presiona para empezar', '¡Bienvenidos al plató!']) {
  if (!all.includes(s)) { console.log('✗ bundle lacks', JSON.stringify(s)); ok = false } else console.log('✓ bundle has', JSON.stringify(s))
}
const plato = js.find((f) => f.startsWith('Plato-'))
console.log(plato ? `✓ 3D plató lazy chunk: ${plato} (${(fs.statSync(path.join(dist, 'assets', plato)).size / 1024).toFixed(0)} KB)` : '✗ no lazy Plato chunk')
if (!plato) ok = false
console.log(ok ? '\nBUILD CHECK OK' : '\nBUILD CHECK FAILED')
process.exit(ok ? 0 : 1)
