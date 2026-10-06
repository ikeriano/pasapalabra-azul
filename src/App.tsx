import { asset } from './asset'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Background } from './components/Background'
import { Menu, type MenuTarget } from './screens/Menu'
import { Rosco } from './screens/Rosco'
import { Silla } from './screens/Silla'
import { UnaDeCuatro } from './screens/UnaDeCuatro'
import { Juegos } from './screens/Juegos'
import { Options } from './screens/Options'
import { Ranking } from './screens/Ranking'
import { Tienda } from './screens/Tienda'
import { DueloSetup } from './screens/Duelo'
import { ProgramaFlow } from './screens/Tv'
import { Sopa } from './screens/Sopa'
import { Donde } from './screens/Donde'
import { Alaz } from './screens/Alaz'
import { Splash } from './screens/Splash'
import { audio } from './audio'
import { store, useProfile } from './store'
import { dailyRosco, dondeBoards, randomAlaz, randomRosco, sillaSession, sopaSession, udcSession, type SopaPuzzle } from './data'
import type { AlazBank, GameResult, Mode, RoscoBank, SillaEntry, UdcQuestion } from './types'
import { todayKey } from './utils'

const Plato = lazy(() => import('./plato/Plato'))

function PlatoLoading() {
  return (
    <div className="plato-root"><div className="plato-loading"><img src={asset('logo-pasapalabra-sm.png')} alt="Pasapalabra" /><div className="splash-dots"><i /><i /><i /></div><p>Cargando el plató…</p></div></div>
  )
}

const DEBUG_T = Number(new URLSearchParams(location.search).get('t')) || undefined

type Route =
  | { name: 'splash' }
  | { name: 'menu' }
  | { name: 'juegos' }
  | { name: 'opciones' }
  | { name: 'ranking' }
  | { name: 'tienda' }
  | { name: 'duelo-setup' }
  | { name: 'rosco'; mode: Mode; players: { name: string; bank: RoscoBank }[]; key: number }
  | { name: 'silla'; entries: SillaEntry[]; key: number }
  | { name: 'udc'; questions: UdcQuestion[]; key: number }
  | { name: 'sopa'; puzzles: SopaPuzzle[]; key: number }
  | { name: 'donde'; boards: string[][]; key: number }
  | { name: 'alaz'; bank: AlazBank; key: number }
  | { name: 'tv'; key: number }
  | { name: 'tv2d'; key: number }

const BG_CY: Record<string, string> = { menu: '47%', rosco: '36%', silla: '50%', udc: '52%', sopa: '50%', donde: '50%', alaz: '48%', splash: '46%' }
const DEMO = Number(new URLSearchParams(location.search).get('demo')) || 0

function initialRoute(): Route {
  const s = new URLSearchParams(location.search).get('s')
  const name = store.get().name
  switch (s) {
    case 'menu': return { name: 'menu' }
    case 'rosco': return { name: 'rosco', mode: 'rosco', players: [{ name, bank: randomRosco() }], key: 1 }
    case 'silla': return { name: 'silla', entries: sillaSession(15), key: 1 }
    case 'udc': return { name: 'udc', questions: udcSession(17), key: 1 }
    case 'sopa': return { name: 'sopa', puzzles: sopaSession(8), key: 1 }
    case 'donde': return { name: 'donde', boards: dondeBoards(6), key: 1 }
    case 'alaz': return { name: 'alaz', bank: randomAlaz(), key: 1 }
    case 'lista': return { name: 'tv2d', key: 1 }
    case 'juegos': return { name: 'juegos' }
    case 'opciones': return { name: 'opciones' }
    case 'ranking': return { name: 'ranking' }
    case 'tienda': return { name: 'tienda' }
    case 'tv': return { name: 'tv', key: 1 }
    case 'tv2d': return { name: 'tv2d', key: 1 }
    case 'duelo': return { name: 'duelo-setup' }
    default: return { name: 'splash' }
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>(initialRoute)
  const p = useProfile()

  useEffect(() => {
    if (route.name === 'tv') return // the 3D plató manages its own music (menu theme on set, game bed during pruebas)
    const game = ['rosco', 'silla', 'udc', 'sopa', 'donde', 'alaz', 'tv2d'].includes(route.name)
    audio.setScene(route.name === 'splash' ? 'none' : game ? 'game' : 'menu')
  }, [route.name])

  const k = () => Date.now()
  const menu = () => setRoute({ name: 'menu' })
  const record = (r: GameResult) => {
    if (r.mode !== 'duelo') {
      store.addRank(r.mode, { name: p.name, score: r.score, hits: r.hits, fails: r.fails, date: new Date().toLocaleDateString('es-ES') })
    }
    if (r.mode === 'diario') store.set({ dailyDone: todayKey() })
    menu()
  }

  const go = (t: MenuTarget) => {
    switch (t) {
      case 'ranking': return setRoute({ name: 'ranking' })
      case 'tienda': return setRoute({ name: 'tienda' })
      case 'juegos': return setRoute({ name: 'juegos' })
      case 'opciones': return setRoute({ name: 'opciones' })
      case 'duelo': return setRoute({ name: 'duelo-setup' })
      case 'diario': return setRoute({ name: 'rosco', mode: 'diario', players: [{ name: p.name, bank: dailyRosco() }], key: k() })
      case 'tv': return setRoute({ name: 'tv', key: k() })
    }
  }

  let screen: JSX.Element
  switch (route.name) {
    case 'splash': screen = <Splash onStart={menu} />; break
    case 'menu': screen = <Menu go={go} />; break
    case 'juegos':
      screen = <Juegos onBack={menu} onPick={(g) => {
        if (g === 'rosco') setRoute({ name: 'rosco', mode: 'rosco', players: [{ name: p.name, bank: randomRosco() }], key: k() })
        if (g === 'silla') setRoute({ name: 'silla', entries: sillaSession(15), key: k() })
        if (g === 'udc') setRoute({ name: 'udc', questions: udcSession(17), key: k() })
        if (g === 'sopa') setRoute({ name: 'sopa', puzzles: sopaSession(8), key: k() })
        if (g === 'donde') setRoute({ name: 'donde', boards: dondeBoards(6), key: k() })
        if (g === 'alaz') setRoute({ name: 'alaz', bank: randomAlaz(), key: k() })
        if (g === 'tv2d') setRoute({ name: 'tv2d', key: k() })
      }} />
      break
    case 'opciones': screen = <Options onBack={menu} onShop={() => setRoute({ name: 'tienda' })} />; break
    case 'ranking': screen = <Ranking onBack={menu} />; break
    case 'tienda': screen = <Tienda onBack={menu} />; break
    case 'duelo-setup':
      screen = <DueloSetup onBack={menu} onStart={(a, b) => {
        const b1 = randomRosco(); const b2 = randomRosco(b1.id)
        setRoute({ name: 'rosco', mode: 'duelo', players: [{ name: a, bank: b1 }, { name: b, bank: b2 }], key: k() })
      }} />
      break
    case 'rosco':
      screen = <Rosco key={route.key} players={route.players} mode={route.mode} onExit={menu} onDone={record} time={DEBUG_T ?? 150}
        title={route.mode === 'diario' ? 'ROSCO DIARIO COMPLETADO' : 'EL ROSCO COMPLETADO'} />
      break
    case 'silla': screen = <Silla key={route.key} entries={route.entries} onExit={menu} onDone={record} />; break
    case 'udc': screen = <UnaDeCuatro key={route.key} questions={route.questions} time={DEBUG_T ?? 90} onExit={menu} onDone={record} />; break
    case 'sopa': screen = <Sopa key={route.key} puzzles={route.puzzles} time={DEBUG_T ?? 90} onExit={menu} onDone={record} />; break
    case 'donde': screen = <Donde key={route.key} boards={route.boards} time={DEBUG_T ?? 90} onExit={menu} onDone={record} />; break
    case 'alaz': screen = <Alaz key={route.key} bank={route.bank} time={DEBUG_T ?? 150} onExit={menu} onDone={record} />; break
    case 'tv':
      screen = <></>
      break
    case 'tv2d':
      screen = <ProgramaFlow key={route.key} demo={DEMO} debugTime={DEBUG_T} onExit={menu} onFinish={(total, rs) => {
        store.addRank('tv', { name: p.name, score: total, hits: rs.reduce((s, r) => s + r.hits, 0), fails: rs.reduce((s, r) => s + r.fails, 0), date: new Date().toLocaleDateString('es-ES') })
        menu()
      }} />
      break
  }

  return (
    <>
      <Background cy={BG_CY[route.name] ?? '45%'} letters={route.name === 'menu' || route.name === 'splash'} />
      <div className="app">{screen}</div>
      {route.name === 'tv' && (
        <Suspense fallback={<PlatoLoading />}>
          <Plato key={route.key} onExit={menu} onRecord={(r) => {
            store.addRank(r.mode, { name: p.name, score: r.score, hits: r.hits, fails: r.fails, date: new Date().toLocaleDateString('es-ES') })
          }} />
        </Suspense>
      )}
    </>
  )
}
