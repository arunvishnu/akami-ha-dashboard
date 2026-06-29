import { useState, useEffect } from 'react'
import { useHA } from '../../hooks/useHA'
import { CardPowerButton } from './CardPowerButton'
import { cn } from '../../lib/utils'

const ACCENT = '#fbbf24'

const PRESETS = [
  { label: 'Candle',  kelvin: 2200, icon: '🕯️' },
  { label: 'Warm',    kelvin: 2700, icon: '🔆' },
  { label: 'Natural', kelvin: 4000, icon: '☀️' },
  { label: 'Cool',    kelvin: 6500, icon: '❄️' },
]

export function HueLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity    = states[entityId]
  const name      = label || entity?.attributes?.friendly_name || entityId
  const isOn      = entity?.state === 'on'
  const rawBright = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100) : 0
  const ctKelvin  = entity?.attributes?.color_temp_kelvin
  const minK      = entity?.attributes?.min_color_temp_kelvin ?? 2000
  const maxK      = entity?.attributes?.max_color_temp_kelvin ?? 6535

  const [localBright, setLocalBright] = useState(rawBright)
  const [dragging, setDragging]       = useState(false)
  useEffect(() => { if (!dragging) setLocalBright(rawBright) }, [rawBright, dragging])

  const toggle       = () => callService('light', 'toggle', { entity_id: entityId })
  const commitBright = (v) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: v })
  const setColorTemp = (k) => callService('light', 'turn_on', { entity_id: entityId, color_temp_kelvin: k })

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
      {/* Header */}
      <div>
        <div className="text-sm font-semibold">{name}</div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-amber-400/70' : 'text-muted-foreground/40')}>
          {isOn ? `${activePreset?.label ?? ''} · ${localBright}%` : 'Light is off'}
        </div>
      </div>

      {/* Big brightness number */}
      <div className={cn('text-center py-1 transition-opacity', !isOn && 'opacity-20')}>
        <div className={cn('text-5xl font-bold tabular-nums leading-none', isOn ? 'text-amber-300' : 'text-white/40')}>
          {isOn ? localBright : '—'}
        </div>
        <div className="text-[10px] text-muted-foreground/40 mt-2 uppercase tracking-widest">Brightness %</div>
      </div>

      {/* Slider */}
      <div className={cn('flex items-center gap-2 transition-opacity', !isOn && 'opacity-20')}>
        <span className="text-[10px] text-muted-foreground/40 w-4 text-right shrink-0">1</span>
        <input
          type="range" min={1} max={100} value={localBright || 1}
          onChange={(e) => { setDragging(true); setLocalBright(Number(e.target.value)) }}
          onMouseUp={(e)  => { setDragging(false); commitBright(Number(e.currentTarget.value)) }}
          onTouchEnd={(e) => { setDragging(false); commitBright(Number(e.currentTarget.value)) }}
          className="flex-1 accent-amber-400 cursor-pointer" style={{ height: '6px' }}
        />
        <span className="text-[10px] text-muted-foreground/40 w-6 shrink-0">100</span>
      </div>

      {/* Color temp presets */}
      {availablePresets.length > 0 && (
        <div className={cn('grid grid-cols-4 gap-1.5 transition-opacity', !isOn && 'opacity-20')}>
          {availablePresets.map(preset => {
            const active = isOn && activePreset?.label === preset.label
            return (
              <button key={preset.label} onClick={() => setColorTemp(preset.kelvin)}
                className={cn(
                  'rounded-xl py-2.5 flex flex-col items-center gap-1 text-[10px] font-medium transition-all',
                  active
                    ? 'bg-amber-500/25 text-amber-300 ring-1 ring-amber-500/40'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                )}
              >
                <span className={cn('text-base leading-none', !isOn && 'grayscale opacity-40')}>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Power button */}
      <div className="flex justify-center pt-1">
        <CardPowerButton isOn={isOn} onClick={toggle} color={ACCENT} />
      </div>
    </div>
  )
}
