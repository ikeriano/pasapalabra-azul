import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/nunito/900.css'
import './styles.css'
import App from './App'
import { audio } from './audio'
import { registerSW } from 'virtual:pwa-register'

audio.init()
registerSW({ immediate: true })
// Block pinch / double-tap zoom on iOS (viewport meta alone isn't always respected)
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
