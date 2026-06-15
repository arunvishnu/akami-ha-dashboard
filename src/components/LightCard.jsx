import { useHA } from '../hooks/useHA'
import { cn } from '../lib/utils'

function Toggle({ isOn }) {
  return (
    <div className={cn(
      'relative h-5 w-9 rounded-full transition-colors duration-200 shrink-0',
      isOn ? 'bg-on' : 'bg-secondary'
    )}>
      <span className={cn(
        'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
        isOn && 'translate-x-4'
      )} />
    </div>
  )
}

export function LightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity     = states[entityId]
  const name       = label || entity?.attributes?.friendly_name || entityId
  const isOn       = entity?.state === 'on'
  const brightness = entity?.attributes?.brightness
    ? Math.round((entity.attributes.brightness / 255) * 100)
    : null

  const toggle = () => callService('light', 'toggle', { entity_id: entityId })

  const setBrightness = (val) =>
    callService('light', 'turn_on', { entity_id: entityId, brightness_pct: val })

  return (
    <div className={cn(
      'rounded-xl bg-card border p-3 transition-colors',
      isOn ? 'border-on/25' : 'border-border'
    )}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={toggle}>
        <span className={cn('text-lg leading-none shrink-0', !isOn && 'opacity-35')}>💡</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{name}</div>
          <div className="text-xs text-muted-foreground">
            {isOn ? (brightness != null ? `${brightness}%` : 'On') : 'Off'}
          </div>
        </div>
        <Toggle isOn={isOn} />
      </div>

      {isOn && brightness != null && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <span className="text-xs">🔅</span>
          <input
            type="range"
            min={1}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-xs">🔆</span>
        </div>
      )}
    </div>
  )
}
