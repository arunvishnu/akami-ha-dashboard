import { Power } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { cn } from '../../lib/utils'

export function DimmableLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity     = states[entityId]
  const name       = label || entity?.attributes?.friendly_name || entityId
  const isOn       = entity?.state === 'on'
  const brightness = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100)
    : null

  const toggle    = () => callService('light', 'toggle', { entity_id: entityId })
  const setBright = (v) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: v })

  return (
    <div className={cn(
      'rounded-2xl border px-4 py-3 flex flex-col gap-2.5 transition-colors',
      isOn ? 'bg-amber-950/20 border-amber-500/15' : 'bg-card border-border'
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{name}</div>
          <div className="text-xs text-muted-foreground">
            {isOn ? (brightness != null ? `${brightness}%` : 'On') : 'Off'}
          </div>
        </div>
        <button
          onClick={toggle}
          className={cn(
            'h-8 w-8 rounded-full border flex items-center justify-center shrink-0 transition-all',
            isOn
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
              : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          <Power className="h-3.5 w-3.5" />
        </button>
      </div>

      {isOn && brightness != null && (
        <div className="flex items-center gap-2">
          <span className="text-xs">🔅</span>
          <input
            type="range"
            min={1}
            max={100}
            value={brightness}
            onChange={(e) => setBright(Number(e.target.value))}
            className="flex-1 accent-amber-400 h-1.5 cursor-pointer"
          />
          <span className="text-xs">🔆</span>
        </div>
      )}
    </div>
  )
}
