import { Lightbulb } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { BrightnessDial } from './BrightnessDial'
import { cn } from '../../lib/utils'

const CT_PRESETS = [
  { label: 'Warm',    kelvin: 2700 },
  { label: 'Natural', kelvin: 4000 },
  { label: 'Cool',    kelvin: 6000 },
]

export function ColorLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity    = states[entityId]
  const name      = label || entity?.attributes?.friendly_name || entityId
  const isOn      = entity?.state === 'on'
  const brightness = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100) : 0
  const ctKelvin   = entity?.attributes?.color_temp_kelvin
  const rgb        = entity?.attributes?.rgb_color
  const currentFx  = entity?.attributes?.effect
  const effectList = (entity?.attributes?.effect_list ?? []).filter(e => e !== 'none')
  const modes      = entity?.attributes?.supported_color_modes ?? []
  const hasColorTemp = modes.includes('color_temp')
  const minK       = entity?.attributes?.min_color_temp_kelvin ?? 2700
  const maxK       = entity?.attributes?.max_color_temp_kelvin ?? 6500

  const toggle       = () => callService('light', 'toggle', { entity_id: entityId })
  const commit       = (v) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: Math.max(1, Math.min(100, v)) })
  const setColorTemp = (k) => callService('light', 'turn_on', { entity_id: entityId, color_temp_kelvin: k })
  const setEffect    = (fx) => callService('light', 'turn_on', { entity_id: entityId, effect: fx })

  const availableCT  = CT_PRESETS.filter(p => p.kelvin >= minK && p.kelvin <= maxK)
  const activePreset = hasColorTemp && ctKelvin
    ? availableCT.reduce((best, p) =>
        Math.abs(p.kelvin - ctKelvin) < Math.abs(best.kelvin - ctKelvin) ? p : best, availableCT[0])
    : null

  const dotColor  = rgb ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : '#fbbf24'
  const accent    = isOn && rgb ? dotColor : '#fbbf24'
  const glowStyle = isOn && rgb ? { boxShadow: `0 0 28px rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.12)` } : {}

  const statusText = isOn
    ? [activePreset?.label, currentFx && currentFx !== 'none' ? currentFx : null].filter(Boolean).join(' · ') || `${brightness}%`
    : 'Light is off'

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-300',
        isOn ? 'bg-zinc-900/90 border-white/12' : 'bg-zinc-900/80 border-white/8'
      )}
      style={glowStyle}
    >
      <BrightnessDial
        brightness={brightness}
        isOn={isOn}
        color={accent}
        icon={Lightbulb}
        step={10}
        onToggle={toggle}
        onCommit={commit}
      />

      <div className="text-center">
        <div className="text-sm font-semibold">{name}</div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-white/60' : 'text-muted-foreground/50')}>
          {statusText}
        </div>
      </div>

      {/* Color temp segmented strip */}
      {hasColorTemp && availableCT.length > 0 && (
        <div className={cn(
          'flex rounded-xl overflow-hidden border transition-opacity',
          !isOn && 'opacity-20',
          isOn ? 'border-white/10' : 'border-white/6'
        )}>
          {availableCT.map((preset, i) => {
            const active = isOn && activePreset?.label === preset.label
            return (
              <button key={preset.label} onClick={() => setColorTemp(preset.kelvin)}
                className={cn(
                  'flex-1 py-2 text-[11px] font-medium transition-all',
                  i > 0 && 'border-l',
                  i > 0 && (isOn ? 'border-white/10' : 'border-white/6'),
                  active
                    ? 'bg-white/15 text-white'
                    : 'bg-white/5 text-muted-foreground/60 hover:bg-white/10 hover:text-foreground'
                )}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Effects */}
      {effectList.length > 0 && (
        <div className={cn('transition-opacity', !isOn && 'opacity-20')}>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-1.5">Effects</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {effectList.map(fx => (
              <button key={fx} onClick={() => setEffect(fx)}
                className={cn(
                  'rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all shrink-0 whitespace-nowrap',
                  isOn && currentFx === fx
                    ? 'bg-white/15 text-white ring-1 ring-white/20'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                )}
              >
                {fx.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
