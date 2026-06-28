import { Power, Sparkles } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { cn } from '../../lib/utils'

// Curated subset shown by default; rest accessible via scroll
const FEATURED_EFFECTS = [
  'Solid', 'Breathe', 'Rainbow', 'Fire 2012', 'Twinkle',
  'Colorloop', 'Ripple', 'Meteor', 'Aurora', 'Bpm',
  'Sparkle', 'Lightning', 'Fireworks', 'Candle', 'Pacifica',
]

export function WledLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity     = states[entityId]
  const name       = label || entity?.attributes?.friendly_name || entityId
  const isOn       = entity?.state === 'on'
  const brightness = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100)
    : null
  const rgb         = entity?.attributes?.rgb_color
  const currentFx   = entity?.attributes?.effect
  const effectList  = entity?.attributes?.effect_list ?? []

  // Show featured first, then rest (deduped)
  const featured = FEATURED_EFFECTS.filter(e => effectList.includes(e))
  const rest     = effectList.filter(e => !FEATURED_EFFECTS.includes(e))
  const displayEffects = [...featured, ...rest]

  // Derive glow color from current rgb
  const glowStyle = isOn && rgb
    ? { boxShadow: `0 0 24px rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.15)` }
    : {}
  const rgbBorder = isOn && rgb
    ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.25)`
    : undefined

  const toggle   = () => callService('light', 'toggle', { entity_id: entityId })
  const setBright = (v) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: v })
  const setEffect = (fx) => callService('light', 'turn_on', { entity_id: entityId, effect: fx })

  const dotColor = rgb ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : '#fbbf24'

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300',
        isOn ? 'bg-card/80' : 'bg-card border-border'
      )}
      style={isOn ? { borderColor: rgbBorder ?? 'rgba(255,255,255,0.12)', ...glowStyle } : {}}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-muted-foreground/60 shrink-0" />
            <div className="text-sm font-semibold truncate">{name}</div>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isOn && rgb && (
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: dotColor }}
              />
            )}
            <div className="text-xs text-muted-foreground truncate">
              {isOn ? (currentFx && currentFx !== 'Solid' ? currentFx : brightness != null ? `${brightness}%` : 'On') : 'Off'}
            </div>
          </div>
        </div>
        <button
          onClick={toggle}
          className={cn(
            'h-9 w-9 rounded-full border flex items-center justify-center shrink-0 transition-all',
            isOn
              ? 'border-white/20 bg-white/10 text-white'
              : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
          )}
          style={isOn && rgb ? { borderColor: rgbBorder, color: dotColor } : {}}
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

          {/* Effects */}
          {displayEffects.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-1.5">
                Effects
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {displayEffects.map(fx => (
                  <button
                    key={fx}
                    onClick={() => setEffect(fx)}
                    className={cn(
                      'rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors shrink-0 whitespace-nowrap',
                      currentFx === fx
                        ? 'text-white ring-1'
                        : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                    style={currentFx === fx
                      ? { backgroundColor: `rgba(${rgb?.[0]??251},${rgb?.[1]??191},${rgb?.[2]??36},0.25)`, ringColor: dotColor, borderColor: dotColor }
                      : {}
                    }
                  >
                    {fx}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
