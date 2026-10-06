import type { ReactNode } from 'react'
export function Modal({ children, title }: { children: ReactNode; title?: ReactNode }) {
  return (
    <div className="modal-dim">
      <div className="panel">
        {title && <div className="panel-title">{title}</div>}
        {children}
      </div>
    </div>
  )
}
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className={`toggle-row`} onClick={() => onChange(!on)}>
      <span>{label}</span>
      <span className={`toggle ${on ? 'on' : ''}`}><span className="knob" /></span>
    </button>
  )
}
