export function StairCase({ x, y, w, h, steps = 7 }) {
  const stepH = h / steps
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={0.5}
      />
      {Array.from({ length: steps }).map((_, i) => (
        <line
          key={i}
          x1={x}
          y1={y + i * stepH}
          x2={x + w}
          y2={y + i * stepH}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={0.5}
        />
      ))}
      <text
        x={x + w / 2}
        y={y + h + 10}
        textAnchor="middle"
        fill="rgba(255,255,255,0.2)"
        fontSize={7}
        fontFamily="system-ui"
      >
        stairs
      </text>
    </g>
  )
}
