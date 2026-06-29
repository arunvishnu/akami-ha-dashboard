import { useState, useEffect } from 'react'
import { Lightbulb } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { CardPowerButton } from './CardPowerButton'
import { CardDeviceIcon } from './CardDeviceIcon'
import { cn } from '../../lib/utils'

const CT_PRESETS = [
  { label: 'Warm',    kelvin: 2700, icon: '🔆' },
  { label: 'Natural', kelvin: 4000, icon: '☀️' },
  { label: 'Cool',    kelvin: 6000, icon: '❄️' },
]

export function ColorLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity    = states[entityId]
  const name      = label || entity?.attributes?.friendly_name || entityId
  const isOn      = entity?.state === 'on'
  const rawBright = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100) : 0
  const ctKelvin   = entity?.attributes?.color_temp_kelvin
  const rgb        = entity?.attributes?.rgb_color
  const currentFx  = entity?.attributes?.effect
  const effectList = (entity?.attributes?.effect_list ?? []).filter(e => e !== 'none')
  const modes      = entity?.attributes?.supported_color_modes ?? []
  const hasColorTemp = modes.includes('color_temp')
  const minK       = entity?.attributes?.min_color_temp_kelvin ?? 2700
  const maxK       = entity?.attributes?.max_color_temp_kelvin ?? 6500

  const [localBright, setLocalBright] = useState(rawBright)
  const [dragging, setDragging]       = useState(false)

  useEffect(() => { if (!dragging) setLocalBright(rawBright) }, [rawBright, dragging])

  const toggle       = () => callService('light', 'toggle', { entity_id: entityId })
  const commitBright = (v) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: v })
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

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-300',
        isOn ? 'bg-zinc-900/90 border-white/12' : 'bg-zinc-900/80 border-white/8'
      )}
      style={glowStyle}
    >
      {/* Icon */}
      <CardDeviceIcon icon={Lightbulb} isOn={isOn} color={accent} />

      {/* Name + status */}
      <div className="text-center">
        <div className="text-sm font-semibold">{name}</div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-white/60' : 'text-muted-foreground/50')}>
          {isOn
            ? [activePreset?.label, currentFx && currentFx !== 'none' ? currentFx : null].filter(Boolean).join(' · ') || `${localBright}%`
            : 'Light is off'}
        </div>
      </div>

      {/* Brightness slider */}
      <div className={cn('flex items-center gap-2 transition-opacity', !isOn && 'opacity-20')}>
        <span className="text-base shrink-0">🔅</span>
        <input
          type="range" min={1} max={100} value={localBright || 1}
          onChange={(e) => { setDragging(true); setLocalBright(Number(e.target.value)) }}
          onMouseUp={(e)  => { setDragging(false); commitBright(Number(e.currentTarget.value)) }}
          onTouchEnd={(e) => { setDragging(false); commitBright(Number(e.currentTarget.value)) }}
          className="flex-1 cursor-pointer"
          style={{ height: '6px', accentColor: isOn ? dotColor : '#fff' }}
        />
        <span className="text-[10px] text-muted-foreground/50 w-7 text-right tabular-nums">{localBright}%</span>
      </div>

      {/* Color temp presets */}
      {hasColorTemp && availableCT.length > 0 && (
        <div className={cn('flex gap-1.5 transition-opacity', !isOn && 'opacity-20')}>
          {availableCT.map(preset => (
            <button key={preset.label} onClick={() => setColorTemp(preset.kelvin)}
              className={cn(
                'flex-1 rounded-xl py-2.5 flex flex-col items-center gap-1 text-[10px] font-medium transition-all',
                isOn && activePreset?.label === preset.label
                  ? 'bg-white/15 text-white ring-1 ring-white/25'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
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

      {/* Power button */}
      <div className="flex justify-center pt-1">
        <CardPowerButton isOn={isOn} onClick={toggle} color={accent} />
      </div>
    </div>
  )
}
