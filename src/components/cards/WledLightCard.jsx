import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { useHA } from '../../hooks/useHA'

import { CardDeviceIcon } from './CardDeviceIcon'
import { cn } from '../../lib/utils'

const FEATURED_EFFECTS = [
  'Solid', 'Breathe', 'Rainbow', 'Fire 2012', 'Twinkle',
  'Colorloop', 'Ripple', 'Meteor', 'Aurora', 'Bpm',
  'Sparkle', 'Lightning', 'Fireworks', 'Candle', 'Pacifica',
]

export function WledLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity    = states[entityId]
  const name      = label || entity?.attributes?.friendly_name || entityId
  const isOn      = entity?.state === 'on'
  const rawBright = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100) : 0
  const rgb        = entity?.attributes?.rgb_color
  const currentFx  = entity?.attributes?.effect
  const effectList = entity?.attributes?.effect_list ?? []

  const [localBright, setLocalBright] = useState(rawBright)
  const [dragging, setDragging]       = useState(false)

  useEffect(() => { if (!dragging) setLocalBright(rawBright) }, [rawBright, dragging])

  const toggle       = () => callService('light', 'toggle', { entity_id: entityId })
  const commitBright = (v) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: v })
  const setEffect    = (fx) => callService('light', 'turn_on', { entity_id: entityId, effect: fx })

  const featured = FEATURED_EFFECTS.filter(e => effectList.includes(e))
  const rest     = effectList.filter(e => !FEATURED_EFFECTS.includes(e))
  const displayEffects = [...featured, ...rest]

  const dotColor    = isOn && rgb ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : '#a78bfa'
  const glowStyle   = isOn && rgb ? { boxShadow: `0 0 28px rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.15)` } : {}
  const borderColor = isOn && rgb ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.25)` : 'rgba(255,255,255,0.08)'

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-300',
        isOn ? 'bg-zinc-900/90' : 'bg-zinc-900/80'
      )}
      style={{ borderColor, ...glowStyle }}
    >
      {/* Icon */}
      <CardDeviceIcon icon={Sparkles} isOn={isOn} color={dotColor} onClick={toggle} />

      {/* Name + status */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5">
          {isOn && rgb && (
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
          )}
          <div className="text-sm font-semibold">{name}</div>
        </div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-white/60' : 'text-muted-foreground/40')}>
          {isOn
            ? (currentFx && currentFx !== 'Solid' ? currentFx : `${localBright}% · Solid`)
            : 'Strip is off'}
        </div>
      </div>

      {/* Color swatch strip */}
      <div className={cn(
        'h-8 rounded-xl overflow-hidden transition-all duration-500',
        isOn && rgb ? 'opacity-100' : 'opacity-10'
      )}>
        {isOn && rgb
          ? (
            <div className="w-full h-full rounded-xl" style={{
              background: `linear-gradient(90deg, rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.3), rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.7), rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.3))`,
            }} />
          )
          : <div className="w-full h-full rounded-xl bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-amber-500/20" />
        }
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
          style={{ height: '6px', accentColor: dotColor }}
        />
        <span className="text-[10px] text-muted-foreground/50 w-7 text-right tabular-nums">{localBright}%</span>
      </div>

      {/* Effects */}
      {displayEffects.length > 0 && (
        <div className={cn('transition-opacity', !isOn && 'opacity-20')}>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-1.5">Effects</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {displayEffects.map(fx => (
              <button key={fx} onClick={() => setEffect(fx)}
                className={cn(
                  'rounded-lg px-2.5 py-1.5 text-[10px] font-medium shrink-0 whitespace-nowrap transition-all',
                  isOn && currentFx === fx
                    ? 'text-white ring-1'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                )}
                style={isOn && currentFx === fx
                  ? { backgroundColor: `rgba(${rgb?.[0]??167},${rgb?.[1]??139},${rgb?.[2]??250},0.2)` }
                  : {}}
              >
                {fx}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
