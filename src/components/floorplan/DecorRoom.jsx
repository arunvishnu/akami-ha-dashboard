const GAP = 3

export function DecorRoom({ room }) {
  const { x, y, w, h, label } = room
  return (
    <g>
      <rect
        x={x + GAP}
        y={y + GAP}
        width={w - GAP * 2}
        height={h - GAP * 2}
        rx={5}
        fill="rgba(255,255,255,0.02)"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={1}
      />
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.18)"
        fontSize={9}
        fontFamily="system-ui"
      >
        {label}
      </text>
    </g>
  )
}
