import { getRoomStatus } from './roomStatus'

const GAP = 3

export function RoomCell({ room, isSelected, onClick, states }) {
  const { isLit, isOccupied, tempVal, statusText, isActive } = getRoomStatus(room.id, states)
  const { x, y, w, h, label } = room
  const cx = x + w / 2
  const cy = y + h / 2

  const fill = isSelected
    ? 'rgba(251,191,36,0.22)'
    : isLit
      ? 'rgba(251,191,36,0.10)'
      : 'rgba(255,255,255,0.04)'
  const stroke = isSelected
    ? 'rgba(251,191,36,0.95)'
    : isLit
      ? 'rgba(251,191,36,0.45)'
      : 'rgba(255,255,255,0.12)'
  const labelColor = isLit ? 'rgba(251,191,36,0.95)' : 'rgba(255,255,255,0.7)'

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect
        x={x + GAP}
        y={y + GAP}
        width={w - GAP * 2}
        height={h - GAP * 2}
        rx={6}
        fill={fill}
        stroke={stroke}
        strokeWidth={isSelected ? 1.5 : 1}
        style={{ transition: 'fill 0.4s, stroke 0.3s' }}
      />

      <text
        x={cx}
        y={cy + (tempVal ? -7 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        fontSize={10}
        fontWeight="600"
        fontFamily="system-ui"
        style={{ userSelect: 'none' }}
      >
        {label}
      </text>

      {tempVal && (
        <text
          x={cx}
          y={cy + 9}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={9}
          fontFamily="system-ui"
        >
          {tempVal}
        </text>
      )}

      {statusText && (
        <text
          x={cx}
          y={y + h - GAP - 9}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isActive ? 'rgba(251,191,36,0.65)' : 'rgba(255,255,255,0.2)'}
          fontSize={6.5}
          fontFamily="system-ui"
          style={{ userSelect: 'none' }}
        >
          {statusText}
        </text>
      )}

      {isOccupied !== null && (
        <circle
          cx={x + w - GAP - 8}
          cy={y + GAP + 8}
          r={4}
          fill={isOccupied ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.15)'}
          style={{ transition: 'fill 0.3s' }}
        />
      )}

      {isLit && (
        <circle
          cx={x + GAP + 8}
          cy={y + GAP + 8}
          r={3}
          fill="rgba(251,191,36,0.8)"
        />
      )}
    </g>
  )
}
