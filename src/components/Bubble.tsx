import type { CSSProperties } from 'react'
export type BubbleKind = 'pending' | 'current' | 'correct' | 'wrong' | 'passed' | 'white'
export function Bubble({ letter, kind = 'pending', style, className = '' }: { letter?: string; kind?: BubbleKind; style?: CSSProperties; className?: string }) {
  return (
    <span className={`bubble b-${kind} ${className}`} style={style}>
      <span className="bubble-l">{letter}</span>
    </span>
  )
}
