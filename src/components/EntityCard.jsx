import { useHA } from '../hooks/useHA'
import { cn } from '../lib/utils'

const DOMAIN_ICONS = {
  light:         { on: '💡', off: '💡' },
  switch:        { on: '🟢', off: '⚫' },
  sensor:        { default: '📊' },
  binary_sensor: { on: '🟢', off: '⚫' },
  climate:       { default: '🌡️' },
  media_player:  { playing: '▶️', paused: '⏸️', idle: '📺', default: '📺' },
  cover:         { open: '⬆️', closed: '⬇️', default: '🚪' },
  fan:           { on: '🌀', off: '🌀' },
  lock:          { locked: '🔒', unlocked: '🔓' },
  input_boolean: { on: '🟢', off: '⚫' },
  automation:    { on: '⚡', off: '⚡' },
  default:       { default: '🔘' },
}

function getIcon(domain, state) {
  const icons = DOMAIN_ICONS[domain] || DOMAIN_ICONS.default
  return icons[state] || icons.on || icons.default || '🔘'
}

function formatState(entity) {
  if (!entity) return 'unavailable'
  const { state, attributes } = entity
  const unit = attributes?.unit_of_measurement
  return unit ? `${state} ${unit}` : state
}

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

export function EntityCard({ entityId, label, onToggle }) {
  const { states, callService } = useHA()
  const entity   = states[entityId]
  const domain   = entityId?.split('.')[0]
  const name     = label || entity?.attributes?.friendly_name || entityId
  const stateVal = entity?.state || 'unavailable'
  const isOn     = ['on', 'playing', 'open', 'unlocked'].includes(stateVal)
  const isToggleable = ['light', 'switch', 'fan', 'input_boolean', 'automation'].includes(domain)
  const isUnavailable = stateVal === 'unavailable'

  const handleClick = () => {
    if (!isToggleable || !entity) return
    callService(domain, 'toggle', { entity_id: entityId })
    onToggle?.()
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 rounded-xl bg-card border p-3 transition-colors',
        isToggleable && 'cursor-pointer hover:bg-card/70',
        isOn ? 'border-on/25' : 'border-border',
        isUnavailable && 'opacity-40'
      )}
    >
      <span className="text-lg leading-none shrink-0">{getIcon(domain, stateVal)}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-xs text-muted-foreground">{formatState(entity)}</div>
      </div>
      {isToggleable && <Toggle isOn={isOn} />}
    </div>
  )
}
