import { audio } from '../audio'
import { store, useProfile } from '../store'
import { Modal, Toggle } from './Modal'

export function QuickSettings({ onClose, onExit }: { onClose: () => void; onExit?: () => void }) {
  const p = useProfile()
  return (
    <Modal title="PAUSA">
      <Toggle label="Música" on={p.music} onChange={(v) => { store.set({ music: v }); audio.applyScene() }} />
      <Toggle label="Sonidos" on={p.sfx} onChange={(v) => store.set({ sfx: v })} />
      <button className="btn-blue" onClick={onClose}>CONTINUAR</button>
      {onExit && <button className="btn-ghost" onClick={onExit}>Salir al menú</button>}
    </Modal>
  )
}
export function ConfirmExit({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <Modal title="¿SALIR?">
      <p className="panel-text">Si sales ahora perderás la partida en curso.</p>
      <button className="btn-orange" onClick={onYes}>SÍ, SALIR</button>
      <button className="btn-blue" onClick={onNo}>SEGUIR JUGANDO</button>
    </Modal>
  )
}
