import { Power } from 'lucide-react'

export function CardPowerButton({ isOn, onClick, color = '#fbbf24' }) {
  return (
    <button
      onClick={onClick}
      className="h-14 w-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0"
      style={{
        borderColor: isOn ? color : 'rgba(255,255,255,0.12)',
        color:       isOn ? color : 'rgba(255,255,255,0.25)',
        boxShadow:   isOn ? `0 0 18px ${color}50` : 'none',
      }}
    >
      <Power className="h-6 w-6" />
    </button>
  )
}
