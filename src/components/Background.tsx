import { useMemo } from 'react'
import { useBgCenter, useBgPlain } from './bgCenter'

const RINGS = [3.3, 2.55, 1.95, 1.5, 1.08, 0.7]
const LETTERS = 'ABCDEFGHIJLMNÑOPQRSTUVXYZ'

export function Background({ cy = '45%', letters = false }: { cy?: string; letters?: boolean }) {
  const tracked = useBgCenter()
  const plain = useBgPlain()
  const floaters = useMemo(() => {
    if (!letters) return []
    const spots = [
      [28, 20], [64, 30], [18, 49], [84, 47], [33, 61], [70, 64], [16, 77], [88, 70], [40, 84], [60, 88], [12, 89], [52, 95]
    ]
    return spots.map(([x, y], i) => ({
      x, y,
      ch: LETTERS[(i * 7 + 3) % LETTERS.length],
      size: 6 + ((i * 37) % 11),
      op: 0.1 + ((i * 13) % 5) * 0.04,
      blur: i % 3 === 0 ? 1.5 : 0,
      dur: 7 + (i % 5) * 1.7,
      delay: -(i * 1.3)
    }))
  }, [letters])
  return (
    <div className={`bg ${plain ? 'plain' : ''}`} aria-hidden>
      {!plain && <div className="bg-rings" style={{ top: tracked ?? cy }}>
        {RINGS.map((k, i) => (
          <div key={i} className={`bg-ring r${i}`} style={{ width: `calc(var(--W) * ${k})`, height: `calc(var(--W) * ${k})` }} />
        ))}
      </div>}
      {!plain && <div className="bg-shine" />}
      {floaters.length > 0 && (
        <div className="bg-letters">
          {floaters.map((f, i) => (
            <span
              key={i}
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                fontSize: `calc(var(--W) * ${f.size / 100})`,
                opacity: f.op,
                filter: f.blur ? `blur(${f.blur}px)` : undefined,
                animationDuration: `${f.dur}s`,
                animationDelay: `${f.delay}s`
              }}
            >
              {f.ch}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
