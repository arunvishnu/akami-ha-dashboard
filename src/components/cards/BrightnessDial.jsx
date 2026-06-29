import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '../../lib/utils'

const START_ANGLE = 225
const SWEEP       = 270

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

function pointerToPercent(e, svgEl, step = 1) {
  const rect = svgEl.getBoundingClientRect()
  const dx = e.clientX - (rect.left + rect.width  / 2)
  const dy = e.clientY - (rect.top  + rect.height / 2)
  const angleClock = ((Math.atan2(dy, dx) * 180 / Math.PI) + 90 + 360) % 360
  let rel = ((angleClock - START_ANGLE) + 360) % 360
  if (rel > SWEEP) rel = rel < SWEEP + (360 - SWEEP) / 2 ? SWEEP : 0
  const raw = (rel / SWEEP) * 100
  return step > 1 ? Math.round(raw / step) * step : Math.round(raw)
}

/**
 * Reusable circular brightness arc dial with drag + +/- controls.
 *
 * Props:
 *   brightness  — current 0-100 value from HA
 *   isOn        — whether the device is on
 *   color       — accent color string (hex)
 *   icon        — lucide icon component rendered inside the circle
 *   step        — increment for +/- buttons (default 10)
 *   onToggle    — called on icon click
 *   onCommit    — called with final pct on drag end or +/- press
 */
export function BrightnessDial({ brightness, isOn, color = '#fbbf24', icon: Icon, step = 10, onToggle, onCommit }) {
  const svgRef = useRef(null)
  const [local, setLocal]       = useState(brightness)
  const [dragging, setDragging] = useState(false)

  useEffect(() => { if (!dragging) setLocal(brightness) }, [brightness, dragging])

  const handlePointerDown = useCallback((e) => {
    if (!isOn) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    setLocal(pointerToPercent(e, svgRef.current, step))
  }, [isOn, step])

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return
    setLocal(pointerToPercent(e, svgRef.current, step))
  }, [dragging, step])

  const handlePointerUp = useCallback((e) => {
    if (!dragging) return
    setDragging(false)
    const pct = pointerToPercent(e, svgRef.current, step)
    setLocal(pct)
    onCommit(pct)
  }, [dragging, step, onCommit])

  const display     = dragging ? local : brightness
  const activeSweep = SWEEP * Math.max(0, display) / 100
  const dot         = polarToXY(100, 100, 82, START_ANGLE + activeSweep)

  const decrease = () => { if (isOn) onCommit(Math.max(1,   display - step)) }
  const increase = () => { if (!isOn) onCommit(step); else onCommit(Math.min(100, display + step)) }

  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <button
        onClick={decrease}
        disabled={!isOn || display <= 0}
        className={cn(
          'h-10 w-10 rounded-full border text-xl font-light flex items-center justify-center transition-all shrink-0',
          isOn && display > 0
            ? 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
            : 'border-white/5 text-white/15 cursor-not-allowed'
        )}
      >−</button>

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
            <circle cx={100} cy={100} r={86} fill="none"
              stroke={color} strokeWidth={1} strokeOpacity={0.08} />
          )}
          <path
            d={arcPath(100, 100, 82, START_ANGLE, SWEEP)}
            fill="none" stroke="rgba(255,255,255,0.07)"
            strokeWidth={14} strokeLinecap="round"
          />
          {isOn && activeSweep > 0 && (
            <path
              d={arcPath(100, 100, 82, START_ANGLE, activeSweep)}
              fill="none" stroke={color}
              strokeWidth={10} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 5px ${color}90)` }}
            />
          )}
          {isOn && display > 0 && (
            <circle cx={dot.x} cy={dot.y} r={dragging ? 9 : 7} fill={color}
              style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
          )}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={onToggle}
            className="h-28 w-28 rounded-full border-2 flex items-center justify-center transition-all duration-300 pointer-events-auto"
            style={{
              borderColor: isOn ? color : 'rgba(255,255,255,0.12)',
              boxShadow:   isOn ? `0 0 28px ${color}55` : 'none',
            }}
          >
            <Icon
              className="h-12 w-12 transition-all duration-300"
              style={{ color: isOn ? color : 'rgba(255,255,255,0.25)' }}
            />
          </button>
        </div>
      </div>

      <button
        onClick={increase}
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
