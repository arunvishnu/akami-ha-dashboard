import { Fan } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { CardPowerButton } from './CardPowerButton'
import { CardDeviceIcon } from './CardDeviceIcon'
import { cn } from '../../lib/utils'

const ACCENT = '#10b981'  // emerald
const START_ANGLE = 225   // 7-o'clock
const SWEEP = 270         // 270° arc, 90° gap at bottom
const STEP = 25           // 4 speed steps

function polarToXY(cx, cy, r, angleClock) {
  const rad = (angleClock - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startAngle, sweepAngle) {
  if (sweepAngle <= 0) return ''
  const capped = Math.min(sweepAngle, 359.99)
  const s = polarToXY(cx, cy, r, startAngle)
  const e = polarToXY(cx, cy, r, startAngle + capped)
  const large = capped > 180 ? 1 : 0
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}

function SpeedDial({ percentage, isOn }) {
  const cx = 100, cy = 100, r = 68
  const activeSweep = SWEEP * Math.max(0, percentage) / 100
  const dotAngle = START_ANGLE + activeSweep
  const dot = polarToXY(cx, cy, r, dotAngle)
  const speed = percentage > 0 ? Math.ceil(percentage / STEP) : 0
  const maxSpeed = Math.ceil(100 / STEP)

  return (
    <svg viewBox="0 0 200 200" className="w-44 h-44">
      {isOn && (
        <circle cx={cx} cy={cy} r={r + 4} fill="none"
          stroke={ACCENT} strokeWidth={1} strokeOpacity={0.08} />
      )}
      <path
        d={arcPath(cx, cy, r, START_ANGLE, SWEEP)}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} strokeLinecap="round"
      />
      {isOn && activeSweep > 0 && (
        <path
          d={arcPath(cx, cy, r, START_ANGLE, activeSweep)}
          fill="none" stroke={ACCENT} strokeWidth={10} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${ACCENT}90)` }}
        />
      )}
      {isOn && percentage > 0 && (
        <circle cx={dot.x} cy={dot.y} r={7} fill={ACCENT}
          style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }} />
      )}
      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle"
        fill={isOn ? 'white' : 'rgba(255,255,255,0.2)'}
        fontSize={40} fontWeight="700" fontFamily="system-ui">
        {isOn && speed > 0 ? speed : '—'}
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.3)" fontSize={12} fontFamily="system-ui">
        {isOn ? `of ${maxSpeed}` : 'Speed'}
      </text>
    </svg>
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
    if (newSpeed <= 0) {
      callService('fan', 'turn_off', { entity_id: entityId })
    } else {
      callService('fan', 'turn_on', { entity_id: entityId, percentage: Math.min(newSpeed * STEP, 100) })
    }
  }

  const decrease = () => setSpeed(speed - 1)
  const increase = () => { if (!isOn) setSpeed(1); else setSpeed(Math.min(speed + 1, maxSpeed)) }

  const spinDuration = isOn && percentage > 0
    ? `${1.5 - (percentage / 100) * 1}s`
    : '1.5s'

  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-300',
      isOn
        ? 'bg-emerald-950/30 border-emerald-500/20 shadow-[0_0_28px_rgba(16,185,129,0.07)]'
        : 'bg-zinc-900/80 border-white/8'
    )}>
      {/* Icon */}
      <CardDeviceIcon icon={Fan} isOn={isOn} color={ACCENT} spin spinDuration={spinDuration} />

      {/* Name + status */}
      <div className="text-center">
        <div className="text-sm font-semibold">{name}</div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-emerald-400/70' : 'text-muted-foreground/40')}>
          {isOn ? `Speed ${speed} · ${percentage}%` : 'Fan is off'}
        </div>
      </div>

      {/* Speed dial + +/- controls */}
      <div className="flex items-center justify-between gap-2 px-2">
        <button
          onClick={decrease} disabled={!isOn}
          className={cn(
            'h-10 w-10 rounded-full border text-xl font-light flex items-center justify-center transition-all',
            isOn
              ? 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
              : 'border-white/5 text-white/15 cursor-not-allowed'
          )}
        >−</button>

        <SpeedDial percentage={isOn ? percentage : 0} isOn={isOn} />

        <button
          onClick={increase} disabled={isOn && speed >= maxSpeed}
          className={cn(
            'h-10 w-10 rounded-full border text-xl font-light flex items-center justify-center transition-all',
            isOn && speed >= maxSpeed
              ? 'border-white/5 text-white/15 cursor-not-allowed'
              : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
          )}
        >+</button>
      </div>

      {/* Power button */}
      <div className="flex justify-center pt-1">
        <CardPowerButton isOn={isOn} onClick={toggle} color={ACCENT} />
      </div>
    </div>
  )
}
