/** CSS/SVG recreation of the A / la / Z intro logo (ref 10). */
export function AlazLogo({ compact }: { compact?: boolean }) {
  const letters = 'ABCDEFGHIJLMNÑOPQRSTUVXYZ'.split('')
  return (
    <div className={`alaz-logo ${compact ? 'compact' : ''}`} aria-hidden>
      <div className="alaz-logo-main">
        <div className="alaz-logo-tile"><span>A</span></div>
        <div className="alaz-logo-mid">
          <i className="alaz-arr left" />
          <span className="alaz-la">la</span>
          <i className="alaz-arr right" />
        </div>
        <div className="alaz-logo-tile"><span>Z</span></div>
      </div>
      {!compact && (
        <div className="alaz-logo-row">
          {letters.map((L) => <span key={L}>{L}</span>)}
        </div>
      )}
    </div>
  )
}
