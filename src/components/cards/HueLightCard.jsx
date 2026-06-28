import { Power } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { cn } from '../../lib/utils'

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
  const brightness = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100)
    : null
  const ctKelvin  = entity?.attributes?.color_temp_kelvin
  const minK      = entity?.attributes?.min_color_temp_kelvin ?? 2000
  const maxK      = entity?.attributes?.max_color_temp_kelvin ?? 6535

  const toggle      = () => callService('light', 'toggle', { entity_id: entityId })
  const setBright   = (v) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: v })
  const setColorTemp = (k) => callService('light', 'turn_on', { entity_id: entityId, color_temp_kelvin: k })

  const activePreset = ctKelvin
    ? PRESETS.reduce((best, p) =>
        Math.abs(p.kelvin - ctKelvin) < Math.abs(best.kelvin - ctKelvin) ? p : best
      )
    : null

  const availablePresets = PRESETS.filter(p => p.kelvin >= minK && p.kelvin <= maxK)

  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300',
      isOn
        ? 'bg-amber-950/35 border-amber-500/20 shadow-[0_0_24px_rgba(251,191,36,0.07)]'
        : 'bg-card border-border'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {isOn
              ? brightness != null ? `${brightness}% · ${activePreset?.label ?? ''}` : 'On'
              : 'Off'}
          </div>
        </div>
        <button
          onClick={toggle}
          className={cn(
            'h-9 w-9 rounded-full border flex items-center justify-center shrink-0 transition-all',
            isOn
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
              : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          <Power className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded when on */}
      {isOn && (
        <>
          {/* Big brightness display */}
          <div className="text-center py-1">
            <div className="text-5xl font-bold tabular-nums text-amber-300 leading-none">
              {brightness ?? '—'}
            </div>
            <div className="text-xs text-muted-foreground mt-1.5 uppercase tracking-widest">
              Brightness %
            </div>
          </div>

          {/* Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/40 w-4 text-right">1</span>
            <input
              type="range"
              min={1}
              max={100}
              value={brightness ?? 0}
              onChange={(e) => setBright(Number(e.target.value))}
              className="flex-1 accent-amber-400 h-1.5 cursor-pointer"
            />
            <span className="text-[10px] text-muted-foreground/40 w-6">100</span>
          </div>

          {/* Color temp presets */}
          {availablePresets.length > 0 && (
            <div className="grid grid-cols-4 gap-1.5">
              {availablePresets.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setColorTemp(preset.kelvin)}
                  className={cn(
                    'rounded-xl py-2.5 flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
                    activePreset?.label === preset.label
                      ? 'bg-amber-500/25 text-amber-300 ring-1 ring-amber-500/30'
                      : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="text-base leading-none">{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
