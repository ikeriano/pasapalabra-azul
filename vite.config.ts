import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// BASE=/pasapalabra-azul/ for GitHub Pages; '/' by default for local dev/preview
const base = process.env.BASE || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-pasapalabra.png', 'logo-pasapalabra-sm.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: new RegExp(`${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}audio/.*\\.mp3$`),
            handler: 'CacheFirst',
            options: { cacheName: 'audio', rangeRequests: true, expiration: { maxEntries: 10 } }
          }
        ]
      },
      manifest: {
        name: 'Pasapalabra Azul — Fan remake',
        short_name: 'Pasapalabra',
        description: 'Fan remake no oficial del juego Pasapalabra para tablet y móvil.',
        theme_color: '#0f8bfb',
        background_color: '#0b7af7',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  server: { host: true, allowedHosts: true },
  preview: { host: true, port: 5175, allowedHosts: true }
})
