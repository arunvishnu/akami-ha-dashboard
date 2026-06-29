import { Lightbulb } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { BrightnessDial } from './BrightnessDial'
import { cn } from '../../lib/utils'

const ACCENT = '#fbbf24'

const PRESETS = [
  { label: 'Candle',  kelvin: 2200 },
  { label: 'Warm',    kelvin: 2700 },
  { label: 'Natural', kelvin: 4000 },
  { label: 'Cool',    kelvin: 6500 },
]

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
        color={ACCENT}
        icon={Lightbulb}
        step={10}
        onToggle={toggle}
        onCommit={commit}
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
