import { useRef, useState, useEffect, useCallback } from 'react'
import { Fan } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { cn } from '../../lib/utils'

const ACCENT      = '#10b981'
const START_ANGLE = 225
const SWEEP       = 270
const STEP        = 25   // 4 discrete speeds

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

function pointerToPercent(e, svgEl) {
  const rect = svgEl.getBoundingClientRect()
  const dx = e.clientX - (rect.left + rect.width  / 2)
  const dy = e.clientY - (rect.top  + rect.height / 2)
  const angleClock = ((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360
  let rel = ((angleClock - START_ANGLE) + 360) % 360
  if (rel > SWEEP) rel = rel < SWEEP + (360 - SWEEP) / 2 ? SWEEP : 0
  const raw = (rel / SWEEP) * 100
  // Snap to nearest discrete step
  return Math.round(raw / STEP) * STEP
}

function SpeedDial({ percentage, isOn, onToggle, onCommit }) {
  const svgRef = useRef(null)
  const [local, setLocal]       = useState(percentage)
  const [dragging, setDragging] = useState(false)

  useEffect(() => { if (!dragging) setLocal(percentage) }, [percentage, dragging])

  const handlePointerDown = useCallback((e) => {
    if (!isOn) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    setLocal(pointerToPercent(e, svgRef.current))
  }, [isOn])

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return
    setLocal(pointerToPercent(e, svgRef.current))
  }, [dragging])

  const handlePointerUp = useCallback((e) => {
    if (!dragging) return
    setDragging(false)
    const pct = pointerToPercent(e, svgRef.current)
    setLocal(pct)
    onCommit(pct)
  }, [dragging, onCommit])

  const display      = dragging ? local : percentage
  const activeSweep  = SWEEP * Math.max(0, display) / 100
  const dot          = polarToXY(100, 100, 72, START_ANGLE + activeSweep)
  const speed        = display > 0 ? Math.round(display / STEP) : 0
  const maxSpeed     = Math.ceil(100 / STEP)
  const spinDuration = isOn && percentage > 0 ? `${1.5 - (percentage / 100)}s` : '1.5s'

  return (
    <div className="relative w-52 h-52 shrink-0">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className={cn('absolute inset-0 w-full h-full', isOn ? 'cursor-pointer' : 'cursor-default')}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {isOn && (
          <circle cx={100} cy={100} r={76} fill="none"
            stroke={ACCENT} strokeWidth={1} strokeOpacity={0.08} />
        )}
        {/* Background track — wider for easier hit */}
        <path
          d={arcPath(100, 100, 72, START_ANGLE, SWEEP)}
          fill="none" stroke="rgba(255,255,255,0.07)"
          strokeWidth={14} strokeLinecap="round"
        />
        {isOn && activeSweep > 0 && (
          <path
            d={arcPath(100, 100, 72, START_ANGLE, activeSweep)}
            fill="none" stroke={ACCENT}
            strokeWidth={10} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 5px ${ACCENT}90)` }}
          />
        )}
        {isOn && display > 0 && (
          <circle cx={dot.x} cy={dot.y} r={dragging ? 9 : 7} fill={ACCENT}
            style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }} />
        )}
        <text x={100} y={142} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.3)" fontSize={11} fontFamily="system-ui">
          {isOn && speed > 0 ? `Speed ${speed} of ${maxSpeed}` : ''}
        </text>
      </svg>

      {/* Fan icon — tap to toggle, pointer-events-none wrapper so SVG drag isn't blocked */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <button
          onClick={onToggle}
          className="h-28 w-28 rounded-full border-2 flex items-center justify-center transition-all duration-300 pointer-events-auto"
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

  const commit = (pct) => {
    if (pct <= 0) callService('fan', 'turn_off', { entity_id: entityId })
    else callService('fan', 'turn_on', { entity_id: entityId, percentage: Math.min(pct, 100) })
  }

  const decrease = () => commit(speed <= 1 ? 0 : (speed - 1) * STEP)
  const increase = () => { if (!isOn) commit(STEP); else commit(Math.min((speed + 1) * STEP, 100)) }

  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-300',
      isOn
        ? 'bg-emerald-950/30 border-emerald-500/20 shadow-[0_0_28px_rgba(16,185,129,0.07)]'
        : 'bg-zinc-900/80 border-white/8'
    )}>
      <div className="text-center">
        <div className="text-sm font-semibold">{name}</div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-emerald-400/70' : 'text-muted-foreground/40')}>
          {isOn ? `Speed ${speed} · ${percentage}%` : 'Fan is off'}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-2">
        <button
          onClick={decrease} disabled={!isOn}
          className={cn(
            'h-10 w-10 rounded-full border text-xl font-light flex items-center justify-center transition-all shrink-0',
            isOn ? 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
                 : 'border-white/5 text-white/15 cursor-not-allowed'
          )}
        >−</button>

        <SpeedDial
          percentage={isOn ? percentage : 0}
          isOn={isOn}
          onToggle={toggle}
          onCommit={commit}
        />

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
