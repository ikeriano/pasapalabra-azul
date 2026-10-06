/** Public asset URL that respects Vite's `base` (e.g. /pasapalabra-azul/ on GitHub Pages). */
export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, '')
