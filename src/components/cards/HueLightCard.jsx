import { useRef, useState, useEffect, useCallback } from 'react'
import { Lightbulb } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { cn } from '../../lib/utils'

const ACCENT      = '#fbbf24'
const START_ANGLE = 225
const SWEEP       = 270
const STEP        = 10

const PRESETS = [
  { label: 'Candle',  kelvin: 2200 },
  { label: 'Warm',    kelvin: 2700 },
  { label: 'Natural', kelvin: 4000 },
  { label: 'Cool',    kelvin: 6500 },
]

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
  // atan2 gives math angle (0=right, CCW). Convert to clock angle (0=top, CW).
  const angleClock = ((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360
  // Map into arc: how far past START_ANGLE, mod 360
  let rel = ((angleClock - START_ANGLE) + 360) % 360
  // Dead zone (> SWEEP): snap to whichever end is closer
  if (rel > SWEEP) rel = rel < SWEEP + (360 - SWEEP) / 2 ? SWEEP : 0
  return Math.round((rel / SWEEP) * 100)
}

function BrightnessDial({ brightness, isOn, onToggle, onCommit, onDecrease, onIncrease }) {
  const svgRef  = useRef(null)
  const [local, setLocal]     = useState(brightness)
  const [dragging, setDragging] = useState(false)

  // Sync from HA when not dragging
  useEffect(() => { if (!dragging) setLocal(brightness) }, [brightness, dragging])

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

  const display     = dragging ? local : brightness
  const activeSweep = SWEEP * Math.max(0, display) / 100
  const dot         = polarToXY(100, 100, 72, START_ANGLE + activeSweep)

  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <button
        onClick={onDecrease}
        disabled={!isOn || display <= 0}
        className={cn(
          'h-10 w-10 rounded-full border text-xl font-light flex items-center justify-center transition-all shrink-0',
          isOn && display > 0
            ? 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
            : 'border-white/5 text-white/15 cursor-not-allowed'
        )}
      >−</button>

      <div className="relative w-52 h-52 shrink-0">
        {/* Draggable SVG arc */}
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
          {/* Background track — wider hit area */}
          <path
            d={arcPath(100, 100, 72, START_ANGLE, SWEEP)}
            fill="none" stroke="rgba(255,255,255,0.07)"
            strokeWidth={14} strokeLinecap="round"
          />
          {/* Active arc */}
          {isOn && activeSweep > 0 && (
            <path
              d={arcPath(100, 100, 72, START_ANGLE, activeSweep)}
              fill="none" stroke={ACCENT}
              strokeWidth={10} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 5px ${ACCENT}90)` }}
            />
          )}
          {/* Indicator dot */}
          {isOn && display > 0 && (
            <circle cx={dot.x} cy={dot.y} r={dragging ? 9 : 7} fill={ACCENT}
              style={{ filter: `drop-shadow(0 0 6px ${ACCENT})`, transition: 'r 0.1s' }} />
          )}
        </svg>

        {/* Bulb icon — tap to toggle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={onToggle}
            className="h-28 w-28 rounded-full border-2 flex items-center justify-center transition-all duration-300 pointer-events-auto"
            style={{
              borderColor: isOn ? ACCENT : 'rgba(255,255,255,0.12)',
              boxShadow:   isOn ? `0 0 28px ${ACCENT}55` : 'none',
            }}
          >
            <Lightbulb
              className="h-12 w-12 transition-all duration-300"
              style={{ color: isOn ? ACCENT : 'rgba(255,255,255,0.25)' }}
            />
          </button>
        </div>
      </div>

      <button
        onClick={onIncrease}
        disabled={isOn && display >= 100}
        className={cn(
          'h-10 w-10 rounded-full border text-xl font-light flex items-center justify-center transition-all shrink-0',
          isOn && display >= 100
            ? 'border-white/5 text-white/15 cursor-not-allowed'
            : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
        )}
      >+</button>
    </div>
  )
}

export function HueLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity    = states[entityId]
  const name      = label || entity?.attributes?.friendly_name || entityId
  const isOn      = entity?.state === 'on'
  const brightness = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100) : 0
  const ctKelvin  = entity?.attributes?.color_temp_kelvin
  const minK      = entity?.attributes?.min_color_temp_kelvin ?? 2000
  const maxK      = entity?.attributes?.max_color_temp_kelvin ?? 6535

  const toggle      = () => callService('light', 'toggle', { entity_id: entityId })
  const commit      = (pct) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: Math.max(1, Math.min(100, pct)) })
  const setColorTemp = (k) => callService('light', 'turn_on', { entity_id: entityId, color_temp_kelvin: k })

  const decrease = () => { if (isOn) commit(brightness - STEP) }
  const increase = () => { if (!isOn) callService('light', 'turn_on', { entity_id: entityId, brightness_pct: STEP }); else commit(brightness + STEP) }

  const availablePresets = PRESETS.filter(p => p.kelvin >= minK && p.kelvin <= maxK)
  const activePreset = ctKelvin
    ? availablePresets.reduce((best, p) =>
        Math.abs(p.kelvin - ctKelvin) < Math.abs(best.kelvin - ctKelvin) ? p : best, availablePresets[0])
    : null

  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-300',
      isOn
        ? 'bg-amber-950/40 border-amber-500/25 shadow-[0_0_28px_rgba(251,191,36,0.08)]'
        : 'bg-zinc-900/80 border-white/8'
    )}>
      <BrightnessDial
        brightness={brightness}
        isOn={isOn}
        onToggle={toggle}
        onCommit={commit}
        onDecrease={decrease}
        onIncrease={increase}
      />

      <div className="text-center">
        <div className="text-sm font-semibold">{name}</div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-amber-400/70' : 'text-muted-foreground/40')}>
          {isOn ? `${activePreset?.label ?? 'Custom'} · ${brightness}%` : 'Light is off'}
        </div>
      </div>

      {availablePresets.length > 0 && (
        <div className={cn(
          'flex rounded-xl overflow-hidden border transition-opacity',
          !isOn && 'opacity-20',
          isOn ? 'border-white/10' : 'border-white/6'
        )}>
          {availablePresets.map((preset, i) => {
            const active = isOn && activePreset?.label === preset.label
            return (
              <button
                key={preset.label}
                onClick={() => setColorTemp(preset.kelvin)}
                className={cn(
                  'flex-1 py-2 text-[11px] font-medium transition-all',
                  i > 0 && 'border-l',
                  i > 0 && (isOn ? 'border-white/10' : 'border-white/6'),
                  active
                    ? 'bg-amber-500/25 text-amber-300'
                    : 'bg-white/5 text-muted-foreground/60 hover:bg-white/10 hover:text-foreground'
                )}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
