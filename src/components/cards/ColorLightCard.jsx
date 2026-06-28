import { Power } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { cn } from '../../lib/utils'

const CT_PRESETS = [
  { label: 'Warm',    kelvin: 2700, icon: '🔆' },
  { label: 'Natural', kelvin: 4000, icon: '☀️' },
  { label: 'Cool',    kelvin: 6000, icon: '❄️' },
]

export function ColorLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity     = states[entityId]
  const name       = label || entity?.attributes?.friendly_name || entityId
  const isOn       = entity?.state === 'on'
  const brightness = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100)
    : null
  const ctKelvin   = entity?.attributes?.color_temp_kelvin
  const rgb        = entity?.attributes?.rgb_color
  const currentFx  = entity?.attributes?.effect
  const effectList = (entity?.attributes?.effect_list ?? []).filter(e => e !== 'none')
  const modes      = entity?.attributes?.supported_color_modes ?? []
  const hasColorTemp = modes.includes('color_temp')
  const minK       = entity?.attributes?.min_color_temp_kelvin ?? 2700
  const maxK       = entity?.attributes?.max_color_temp_kelvin ?? 6500

  const toggle      = () => callService('light', 'toggle', { entity_id: entityId })
  const setBright   = (v) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: v })
  const setColorTemp = (k) => callService('light', 'turn_on', { entity_id: entityId, color_temp_kelvin: k })
  const setEffect   = (fx) => callService('light', 'turn_on', { entity_id: entityId, effect: fx })

  const dotColor = rgb ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : '#fbbf24'
  const availableCT = CT_PRESETS.filter(p => p.kelvin >= minK && p.kelvin <= maxK)

  const activePreset = hasColorTemp && ctKelvin
    ? availableCT.reduce((best, p) =>
        Math.abs(p.kelvin - ctKelvin) < Math.abs(best.kelvin - ctKelvin) ? p : best, availableCT[0]
      )
    : null

  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300',
      isOn ? 'bg-card/80 border-white/10' : 'bg-card border-border'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {isOn
              ? [activePreset?.label, brightness != null ? `${brightness}%` : null].filter(Boolean).join(' · ')
              : 'Off'}
          </div>
        </div>
        <button
          onClick={toggle}
          className={cn(
            'h-9 w-9 rounded-full border flex items-center justify-center shrink-0 transition-all',
            isOn
              ? 'border-white/20 bg-white/10'
              : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
          )}
          style={isOn ? { color: dotColor } : {}}
        >
          <Power className="h-4 w-4" />
        </button>
      </div>

      {isOn && (
        <>
          {/* Brightness */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/40">1</span>
            <input
              type="range"
              min={1}
              max={100}
              value={brightness ?? 0}
              onChange={(e) => setBright(Number(e.target.value))}
              className="flex-1 h-1.5 cursor-pointer"
              style={{ accentColor: dotColor }}
            />
            <span className="text-[10px] text-muted-foreground/60 w-7 text-right">
              {brightness ?? 0}%
            </span>
          </div>

          {/* Color temp presets */}
          {hasColorTemp && availableCT.length > 0 && (
            <div className="flex gap-1.5">
              {availableCT.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setColorTemp(preset.kelvin)}
                  className={cn(
                    'flex-1 rounded-xl py-2 flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors',
                    activePreset?.label === preset.label
                      ? 'bg-white/15 text-white ring-1 ring-white/20'
                      : 'bg-secondary/60 hover:bg-secondary text-muted-foreground'
                  )}
                >
                  <span className="text-sm leading-none">{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Effects */}
          {effectList.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {effectList.map(fx => (
                <button
                  key={fx}
                  onClick={() => setEffect(fx)}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors shrink-0 whitespace-nowrap',
                    currentFx === fx
                      ? 'bg-white/15 text-white ring-1 ring-white/20'
                      : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {fx.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
