import type { CSSProperties } from 'react'
type P = { size?: number | string; style?: CSSProperties; className?: string }
const s = (size: P['size']) => (size !== undefined ? { width: size, height: size } : {})

export const BackTri = ({ size, style }: P) => (
  <svg viewBox="0 0 24 24" style={{ ...s(size), ...style }}><path d="M16.2 4.6c.9-.6 2 .1 2 1.1v12.6c0 1-1.1 1.7-2 1.1L6.6 13.1a1.3 1.3 0 0 1 0-2.2z" fill="#fff" /></svg>
)
export const SendTri = ({ size, style }: P) => (
  <svg viewBox="0 0 24 24" style={{ ...s(size), ...style }}><path d="M8.6 5.2c-.8-.5-1.8.1-1.8 1v11.6c0 .9 1 1.5 1.8 1l9.4-5.8c.8-.5.8-1.6 0-2z" fill="#fff" /></svg>
)
export const Trash = ({ size, style }: P) => (
  <svg viewBox="0 0 24 24" style={{ ...s(size), ...style }} fill="#fff">
    <rect x="4" y="4.6" width="16" height="2.6" rx="1.2" />
    <rect x="9" y="2.4" width="6" height="2.8" rx="1" />
    <path d="M5.6 8.6h12.8l-1 11.3a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8z" />
    <rect x="8.7" y="10.6" width="1.6" height="8" rx=".8" fill="#f7a3b8" />
    <rect x="11.2" y="10.6" width="1.6" height="8" rx=".8" fill="#f7a3b8" />
    <rect x="13.7" y="10.6" width="1.6" height="8" rx=".8" fill="#f7a3b8" />
  </svg>
)
export const PersonDots = ({ size, style }: P) => (
  <svg viewBox="0 0 32 32" style={{ ...s(size), ...style }} fill="#fff">
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2
      return <circle key={i} cx={16 + Math.cos(a) * 13} cy={16 + Math.sin(a) * 13} r="2.3" />
    })}
    <circle cx="16" cy="12.6" r="3.6" />
    <path d="M9.6 22.4c.6-3.6 3.2-5.6 6.4-5.6s5.8 2 6.4 5.6z" />
  </svg>
)
export const Glasses = ({ size, style }: P) => (
  <svg viewBox="0 0 32 32" style={{ ...s(size), ...style }} fill="#fff"><circle cx="9.5" cy="16" r="5.6" /><circle cx="22.5" cy="16" r="5.6" /></svg>
)
export const FourDots = ({ size, style }: P) => (
  <svg viewBox="0 0 32 32" style={{ ...s(size), ...style }} fill="none" stroke="#fff" strokeWidth="2.6">
    <circle cx="9" cy="9" r="4.6" /><circle cx="23" cy="9" r="4.6" /><circle cx="9" cy="23" r="4.6" /><circle cx="23" cy="23" r="4.6" />
  </svg>
)
export const Gear = ({ size, style }: P) => (
  <svg viewBox="0 0 24 24" style={{ ...s(size), ...style }}>
    <path fill="currentColor" d="M13.9 2.5l.4 2.3c.6.2 1.2.5 1.7.9l2.2-.8 1.9 3.3-1.8 1.5c.1.6.1 1.3 0 1.9l1.8 1.5-1.9 3.3-2.2-.8c-.5.4-1.1.7-1.7.9l-.4 2.3h-3.8l-.4-2.3c-.6-.2-1.2-.5-1.7-.9l-2.2.8-1.9-3.3 1.8-1.5a6 6 0 0 1 0-1.9L2 8.2l1.9-3.3 2.2.8c.5-.4 1.1-.7 1.7-.9l.4-2.3zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z" />
  </svg>
)
export const Crown = ({ size, style }: P) => (
  <svg viewBox="0 0 32 32" style={{ ...s(size), ...style }} fill="currentColor">
    <path d="M5 11.5l5.6 4.2L16 8l5.4 7.7 5.6-4.2-2 11.5H7z" /><rect x="7" y="24.2" width="18" height="2.8" rx="1.2" />
    <circle cx="5" cy="10.6" r="1.8" /><circle cx="16" cy="7" r="1.8" /><circle cx="27" cy="10.6" r="1.8" />
  </svg>
)
export const Cart = ({ size, style }: P) => (
  <svg viewBox="0 0 32 32" style={{ ...s(size), ...style }} fill="currentColor">
    <path d="M3.5 6.2h3.8c.7 0 1.3.5 1.4 1.1l.4 2h17.6c.9 0 1.5.8 1.3 1.7l-1.6 7.4c-.2.8-.8 1.3-1.6 1.3H11.6l.4 2h13.2v2.6H10.9c-.7 0-1.3-.5-1.4-1.1L6.2 8.8H3.5z" />
    <circle cx="12.4" cy="26.6" r="2.2" /><circle cx="23.4" cy="26.6" r="2.2" />
  </svg>
)
export const Brain = ({ size, style }: P) => (
  <svg viewBox="0 0 48 48" style={{ ...s(size), ...style }} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 9.5c-2-2.6-6.8-2.6-8.6.6-3.6-.4-6.4 2.6-5.6 6.2-3.2 1.6-3.8 6-1.2 8.4-2 3 0 7.4 3.6 7.6.6 3.8 5 5.6 8 3.6 1.4 2 3.2 2.6 3.8 2.4z" />
    <path d="M25 9.5c2-2.6 6.8-2.6 8.6.6 3.6-.4 6.4 2.6 5.6 6.2 3.2 1.6 3.8 6 1.2 8.4 2 3 0 7.4-3.6 7.6-.6 3.8-5 5.6-8 3.6-1.4 2-3.2 2.6-3.8 2.4z" />
    <path d="M24 9v29M15 16c2 0 3.6 1.4 3.6 3.4M12 25c2.4-.4 4.6.8 5.2 3M33 16c-2 0-3.6 1.4-3.6 3.4M36 25c-2.4-.4-4.6.8-5.2 3M18 33c0-2 1.6-3 3-3M30 33c0-2-1.6-3-3-3" />
  </svg>
)
export const People = ({ size, style }: P) => (
  <svg viewBox="0 0 48 48" style={{ ...s(size), ...style }} fill="currentColor">
    <circle cx="17" cy="16.5" r="6.4" /><path d="M4.5 37c.6-7.4 5.6-11.6 12.5-11.6S28.9 29.6 29.5 37z" />
    <circle cx="32.5" cy="15" r="5.8" /><path d="M31.5 23.6c6.8-.6 11.6 3.6 12.2 11.4H32.2c-.4-4.4-1.6-8.4-4.4-10.8 1-.4 2.2-.6 3.7-.6z" />
  </svg>
)
export const RoscoIcon = ({ size, style }: P) => (
  <svg viewBox="0 0 48 48" style={{ ...s(size), ...style }} fill="currentColor">
    {Array.from({ length: 14 }).map((_, i) => {
      const a = (i / 14) * Math.PI * 2 - Math.PI / 2
      return <circle key={i} cx={24 + Math.cos(a) * 17} cy={24 + Math.sin(a) * 17} r="3.1" />
    })}
    <circle cx="24" cy="20" r="4.6" /><path d="M15.6 32.4c.8-4.6 4.2-7.2 8.4-7.2s7.6 2.6 8.4 7.2z" />
  </svg>
)
export const Tv = ({ size, style }: P) => (
  <svg viewBox="0 0 48 48" style={{ ...s(size), ...style }} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round">
    <path d="M17 8l7 6 7-6" />
    <rect x="5.5" y="14" width="37" height="25" rx="4" />
    <rect x="10.5" y="18.5" width="21" height="16" rx="2.4" />
    <circle cx="37" cy="21.5" r="1.6" fill="currentColor" /><circle cx="37" cy="27.5" r="1.6" fill="currentColor" />
    <path d="M12 39v3M36 39v3" />
  </svg>
)
export const Share = ({ size, style }: P) => (
  <svg viewBox="0 0 24 24" style={{ ...s(size), ...style }} fill="currentColor">
    <circle cx="18" cy="5.5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="18.5" r="3" />
    <path d="M8.2 10.8l7.6-4.2.9 1.6-7.6 4.2zM8.2 13.2l.9-1.6 7.6 4.2-.9 1.6z" />
  </svg>
)
export const Medal = ({ size, style }: P) => (
  <svg viewBox="0 0 24 24" style={{ ...s(size), ...style }}>
    <path d="M6 2h4l2 5-3 2zM18 2h-4l-2 5 3 2z" fill="#f08a4b" />
    <circle cx="12" cy="15" r="7" fill="#f4a65d" /><circle cx="12" cy="15" r="4.6" fill="#fbd09a" />
    <path d="M12 12l1 2 2.1.3-1.5 1.5.4 2.1-2-1-2 1 .4-2.1-1.5-1.5L11 14z" fill="#f08a4b" />
  </svg>
)
export const Ticket = ({ size, style, className }: P) => (
  <svg viewBox="0 0 48 36" className={className} style={{ ...s(size), ...style }}>
    <g transform="rotate(-14 24 18)">
      <rect x="3" y="6" width="42" height="24" rx="5" fill="#f08d12" />
      <rect x="3" y="4" width="42" height="24" rx="5" fill="#ffb21f" />
      <path d="M33 4v24" stroke="#f08d12" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="18" cy="16" r="6.4" fill="#ffd36a" /><circle cx="18" cy="16" r="3" fill="#f08d12" />
    </g>
  </svg>
)
export const Grid9 = ({ size, style }: P) => (
  <svg viewBox="0 0 32 32" style={{ ...s(size), ...style }} fill="currentColor">
    {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <rect key={r * 3 + c} x={4 + c * 8.6} y={4 + r * 8.6} width="6.8" height="6.8" rx="1.6" />))}
  </svg>
)
export const DotsRing = ({ size, style }: P) => (
  <svg viewBox="0 0 32 32" style={{ ...s(size), ...style }} fill="currentColor">
    {Array.from({ length: 6 }).map((_, i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2
      return <circle key={i} cx={16 + Math.cos(a) * 9.5} cy={16 + Math.sin(a) * 9.5} r="4" />
    })}
  </svg>
)
export const Home = ({ size, style }: P) => (
  <svg viewBox="0 0 24 24" style={{ ...s(size), ...style }} fill="currentColor">
    <path d="M12 3.2 2.8 11h2.6v8.6c0 .6.5 1.1 1.1 1.1h3.9v-5.6h3.2v5.6h3.9c.6 0 1.1-.5 1.1-1.1V11h2.6z" />
  </svg>
)
export const Bulb = ({ size, style }: P) => (
  <svg viewBox="0 0 24 24" style={{ ...s(size), ...style }}>
    <path d="M12 2.6a6.6 6.6 0 0 0-3.9 11.9c.6.5 1 1.2 1 2V17h5.8v-.5c0-.8.4-1.5 1-2A6.6 6.6 0 0 0 12 2.6z" fill="#fff" />
    <rect x="9.1" y="17.8" width="5.8" height="1.6" rx=".8" fill="#fff6d6" />
    <rect x="9.6" y="20" width="4.8" height="1.6" rx=".8" fill="#fff6d6" />
    <path d="M10.4 13.6c0-1.6.8-2.2 1.6-2.2s1.6.6 1.6 2.2" stroke="#ffd34d" strokeWidth="1.2" fill="none" />
  </svg>
)
