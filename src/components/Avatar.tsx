export interface AvatarDef { id: string; bg: [string, string]; emoji?: string; price: number; name: string }
export const AVATARS: AvatarDef[] = [
  { id: 'classic', bg: ['#2aa6f6', '#0a83e6'], price: 0, name: 'Clásico' },
  { id: 'naranja', bg: ['#ffb056', '#f6731f'], price: 0, name: 'Naranja' },
  { id: 'verde', bg: ['#6fdc4b', '#2fb12a'], price: 0, name: 'Verde' },
  { id: 'rosa', bg: ['#ff9ec0', '#e8508a'], price: 15, name: 'Rosa' },
  { id: 'zorro', bg: ['#ffd27a', '#f39a2b'], emoji: '🦊', price: 30, name: 'Zorro' },
  { id: 'panda', bg: ['#d9ecff', '#8fbdf0'], emoji: '🐼', price: 30, name: 'Panda' },
  { id: 'leon', bg: ['#ffe08a', '#f2b32c'], emoji: '🦁', price: 40, name: 'León' },
  { id: 'rana', bg: ['#a6f08a', '#3fbf3a'], emoji: '🐸', price: 40, name: 'Rana' },
  { id: 'unicornio', bg: ['#f3c6ff', '#b06cf0'], emoji: '🦄', price: 60, name: 'Unicornio' },
  { id: 'pulpo', bg: ['#ffb3a6', '#ef5b4a'], emoji: '🐙', price: 60, name: 'Pulpo' },
  { id: 'cohete', bg: ['#9fd8ff', '#3c8ef0'], emoji: '🚀', price: 80, name: 'Cohete' },
  { id: 'corona', bg: ['#fff0a6', '#f5c518'], emoji: '👑', price: 120, name: 'Corona' }
]
export function avatarById(id: string) { return AVATARS.find((a) => a.id === id) ?? AVATARS[0] }

export function AvatarFace({ id, className = '' }: { id: string; className?: string }) {
  const a = avatarById(id)
  return (
    <span className={`avatar-face ${className}`} style={{ background: `radial-gradient(circle at 50% 30%, ${a.bg[0]}, ${a.bg[1]} 80%)` }}>
      {a.emoji ? (
        <span className="avatar-emoji">{a.emoji}</span>
      ) : (
        <svg viewBox="0 0 100 100" className="avatar-sil">
          <circle cx="50" cy="38" r="19" fill="#fff" />
          <path d="M14 100c2-24 17-37 36-37s34 13 36 37z" fill="#fff" />
        </svg>
      )}
    </span>
  )
}
