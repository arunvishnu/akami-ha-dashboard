import { useHA } from '../../hooks/useHA'
import { cn } from '../../lib/utils'

export function SimpleLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity  = states[entityId]
  const domain  = entityId?.split('.')[0]
  const name    = label || entity?.attributes?.friendly_name || entityId
  const isOn    = entity?.state === 'on'

  const toggle = () => callService(domain, 'toggle', { entity_id: entityId })

  return (
    <div
      onClick={toggle}
      className={cn(
        'rounded-xl border px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors',
        isOn ? 'bg-amber-950/15 border-amber-500/15' : 'bg-card border-border hover:bg-card/70'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={cn('text-base shrink-0', isOn ? 'opacity-100' : 'opacity-30')}>💡</span>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{name}</div>
          <div className="text-xs text-muted-foreground">{isOn ? 'On' : 'Off'}</div>
        </div>
      </div>

      {/* Toggle pill */}
      <div className={cn(
        'relative h-5 w-9 rounded-full transition-colors duration-200 shrink-0',
        isOn ? 'bg-on' : 'bg-secondary'
      )}>
        <span className={cn(
          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
          isOn && 'translate-x-4'
        )} />
      </div>
    </div>
  )
}
