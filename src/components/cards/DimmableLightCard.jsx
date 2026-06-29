import { useState, useEffect } from 'react'
import { useHA } from '../../hooks/useHA'
import { CardPowerButton } from './CardPowerButton'
import { cn } from '../../lib/utils'

const ACCENT = '#fbbf24'

export function DimmableLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity    = states[entityId]
  const name      = label || entity?.attributes?.friendly_name || entityId
  const isOn      = entity?.state === 'on'
  const rawBright = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100)
    : 0

  const [localBright, setLocalBright] = useState(rawBright)
  const [dragging, setDragging]       = useState(false)

  useEffect(() => {
    if (!dragging) setLocalBright(rawBright)
  }, [rawBright, dragging])

  const toggle       = () => callService('light', 'toggle', { entity_id: entityId })
  const commitBright = (v) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: v })

  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-300',
      isOn
        ? 'bg-amber-950/30 border-amber-500/20'
        : 'bg-zinc-900/80 border-white/8'
    )}>
      {/* Header */}
      <div>
        <div className="text-sm font-semibold">{name}</div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-amber-400/70' : 'text-muted-foreground/50')}>
          {isOn ? `${localBright}% brightness` : 'Light is off'}
        </div>
      </div>

      {/* Large light icon */}
      <div className="flex items-center justify-center py-3">
        <div className={cn(
          'h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300',
          isOn
            ? 'bg-amber-400/20 shadow-[0_0_30px_rgba(251,191,36,0.3)]'
            : 'bg-white/5'
        )}>
          <span className={cn('text-4xl leading-none transition-all', !isOn && 'grayscale opacity-20')}>
            💡
          </span>
        </div>
      </div>

      {/* Brightness slider */}
      <div className={cn('flex items-center gap-2 transition-opacity', !isOn && 'opacity-25')}>
        <span className="text-base shrink-0">🔅</span>
        <input
          type="range"
          min={1}
          max={100}
          value={localBright || 1}
          onChange={(e) => { setDragging(true); setLocalBright(Number(e.target.value)) }}
          onMouseUp={(e)  => { setDragging(false); commitBright(Number(e.currentTarget.value)) }}
          onTouchEnd={(e) => { setDragging(false); commitBright(Number(e.currentTarget.value)) }}
          className="flex-1 accent-amber-400 cursor-pointer"
          style={{ height: '6px' }}
        />
        <span className="text-[10px] text-muted-foreground/50 w-7 text-right tabular-nums">
          {localBright}%
        </span>
      </div>

      {/* Power button */}
      <div className="flex justify-center pt-1">
        <CardPowerButton isOn={isOn} onClick={toggle} color={ACCENT} />
      </div>
    </div>
  )
}
