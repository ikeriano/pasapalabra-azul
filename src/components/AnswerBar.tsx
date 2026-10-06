import { SendTri, Trash } from './Icons'
export function AnswerBar({ value, onClear, onSend, disabled }: { value: string; onClear: () => void; onSend: () => void; disabled?: boolean }) {
  return (
    <div className="abar">
      <button className="abar-trash" onPointerDown={(e) => { e.preventDefault(); if (!disabled) onClear() }} aria-label="Borrar todo">
        <Trash size="54%" />
      </button>
      <div className="abar-text">
        <span className="abar-val">{value}</span>
        {!disabled && <span className="caret" />}
      </div>
      <button className="abar-send" onPointerDown={(e) => { e.preventDefault(); if (!disabled) onSend() }} aria-label="Enviar">
        <SendTri size="56%" style={{ marginLeft: '8%' }} />
      </button>
    </div>
  )
}
