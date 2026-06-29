import { Fan } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { cn } from '../../lib/utils'

const ACCENT = '#10b981'
const START_ANGLE = 225
const SWEEP = 270
const STEP = 25

function polarToXY(cx, cy, r, angleClock) {
  const rad = (angleClock - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startAngle, sweepAngle) {
  if (sweepAngle <= 0) return ''
  const capped = Math.min(sweepAngle, 359.99)
  const s = polarToXY(cx, cy, r, startAngle)
  const e = polarToXY(cx, cy, r, startAngle + capped)
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${capped > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}

function SpeedDial({ percentage, isOn, onToggle }) {
  const cx = 100, cy = 100, r = 72
  const activeSweep = SWEEP * Math.max(0, percentage) / 100
  const dotAngle = START_ANGLE + activeSweep
  const dot = polarToXY(cx, cy, r, dotAngle)
  const speed = percentage > 0 ? Math.ceil(percentage / STEP) : 0
  const maxSpeed = Math.ceil(100 / STEP)
  const spinDuration = isOn && percentage > 0 ? `${1.5 - (percentage / 100)}s` : '1.5s'

  return (
    <div className="relative w-52 h-52 shrink-0">
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
        {isOn && (
          <circle cx={cx} cy={cy} r={r + 4} fill="none"
            stroke={ACCENT} strokeWidth={1} strokeOpacity={0.08} />
        )}
        <path
          d={arcPath(cx, cy, r, START_ANGLE, SWEEP)}
          fill="none" stroke="rgba(255,255,255,0.07)"
          strokeWidth={10} strokeLinecap="round"
        />
        {isOn && activeSweep > 0 && (
          <path
            d={arcPath(cx, cy, r, START_ANGLE, activeSweep)}
            fill="none" stroke={ACCENT}
            strokeWidth={10} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 5px ${ACCENT}90)` }}
          />
        )}
        {isOn && percentage > 0 && (
          <circle cx={dot.x} cy={dot.y} r={7} fill={ACCENT}
            style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }} />
        )}
        {/* Speed label below center */}
        <text x={cx} y={cy + 42} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.3)" fontSize={11} fontFamily="system-ui">
          {isOn && speed > 0 ? `Speed ${speed} of ${maxSpeed}` : ''}
        </text>
      </svg>

      {/* Fan icon — tap to toggle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={onToggle}
          className="h-28 w-28 rounded-full border-2 flex items-center justify-center transition-all duration-300"
          style={{
            borderColor: isOn ? ACCENT : 'rgba(255,255,255,0.12)',
            boxShadow:   isOn ? `0 0 28px ${ACCENT}55` : 'none',
          }}
        >
          <Fan
            className="h-12 w-12 transition-all duration-300"
            style={{
              color: isOn ? ACCENT : 'rgba(255,255,255,0.25)',
              ...(isOn ? { animation: `spin ${spinDuration} linear infinite` } : {}),
            }}
          />
        </button>
      </div>
    </div>
  )
}

export function FanCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity     = states[entityId]
  const name       = label || entity?.attributes?.friendly_name || entityId
  const isOn       = entity?.state === 'on'
  const percentage = entity?.attributes?.percentage ?? 0
  const speed      = percentage > 0 ? Math.ceil(percentage / STEP) : 0
  const maxSpeed   = Math.ceil(100 / STEP)

  const toggle = () => callService('fan', 'toggle', { entity_id: entityId })
  const setSpeed = (newSpeed) => {
    if (newSpeed <= 0) callService('fan', 'turn_off', { entity_id: entityId })
    else callService('fan', 'turn_on', { entity_id: entityId, percentage: Math.min(newSpeed * STEP, 100) })
  }
  const decrease = () => setSpeed(speed - 1)
  const increase = () => { if (!isOn) setSpeed(1); else setSpeed(Math.min(speed + 1, maxSpeed)) }

  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-300',
      isOn
        ? 'bg-emerald-950/30 border-emerald-500/20 shadow-[0_0_28px_rgba(16,185,129,0.07)]'
        : 'bg-zinc-900/80 border-white/8'
    )}>
      {/* Name + status */}
      <div className="text-center">
        <div className="text-sm font-semibold">{name}</div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-emerald-400/70' : 'text-muted-foreground/40')}>
          {isOn ? `Speed ${speed} · ${percentage}%` : 'Fan is off'}
        </div>
      </div>

      {/* Speed dial with embedded fan icon */}
      <div className="flex items-center justify-between gap-2 px-2">
        <button
          onClick={decrease} disabled={!isOn}
          className={cn(
            'h-10 w-10 rounded-full border text-xl font-light flex items-center justify-center transition-all shrink-0',
            isOn ? 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
                 : 'border-white/5 text-white/15 cursor-not-allowed'
          )}
        >−</button>

        <SpeedDial percentage={isOn ? percentage : 0} isOn={isOn} onToggle={toggle} />

        <button
          onClick={increase} disabled={isOn && speed >= maxSpeed}
          className={cn(
            'h-10 w-10 rounded-full border text-xl font-light flex items-center justify-center transition-all shrink-0',
            isOn && speed >= maxSpeed
              ? 'border-white/5 text-white/15 cursor-not-allowed'
              : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
          )}
        >+</button>
      </div>
    </div>
  )
}
