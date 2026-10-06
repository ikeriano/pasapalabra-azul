import { fmtEuro } from '../utils'

/** Prominent jackpot chip — "BOTE 312.000 €". */
export function BotePill({ amount, program, className = '' }: { amount: number; program?: number; className?: string }) {
  return (
    <div className={`bote-pill ${className}`} aria-label={`Bote ${fmtEuro(amount)}`}>
      <span className="bote-label">BOTE</span>
      <span className="bote-amt">{fmtEuro(amount)}</span>
      {program !== undefined && <span className="bote-prog">Programa {program}</span>}
    </div>
  )
}
