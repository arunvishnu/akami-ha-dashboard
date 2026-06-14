import { useHA } from '../hooks/useHA'

const DOMAIN_ICONS = {
  light: { on: '💡', off: '🔆' },
  switch: { on: '🟢', off: '⚫' },
  sensor: { default: '📊' },
  binary_sensor: { on: '🟢', off: '⚫' },
  climate: { default: '🌡️' },
  media_player: { playing: '▶️', paused: '⏸️', idle: '📺', default: '📺' },
  cover: { open: '⬆️', closed: '⬇️', default: '🚪' },
  fan: { on: '🌀', off: '🔘' },
  lock: { locked: '🔒', unlocked: '🔓' },
  input_boolean: { on: '🟢', off: '⚫' },
  automation: { on: '⚡', off: '⚡' },
  default: { default: '🔘' },
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

export function EntityCard({ entityId, label, onToggle }) {
  const { states, callService } = useHA()
  const entity = states[entityId]
  const domain = entityId?.split('.')[0]
  const name = label || entity?.attributes?.friendly_name || entityId
  const stateVal = entity?.state || 'unavailable'
  const isOn = stateVal === 'on' || stateVal === 'playing' || stateVal === 'open' || stateVal === 'unlocked'
  const isToggleable = ['light', 'switch', 'fan', 'input_boolean', 'automation'].includes(domain)

  const handleClick = () => {
    if (!isToggleable || !entity) return
    callService(domain, 'toggle', { entity_id: entityId })
    onToggle?.()
  }

  return (
    <div
      className={`entity-card ${isOn ? 'state-on' : 'state-off'} ${isToggleable ? 'toggleable' : ''} ${stateVal === 'unavailable' ? 'unavailable' : ''}`}
      onClick={handleClick}
    >
      <div className="entity-icon">{getIcon(domain, stateVal)}</div>
      <div className="entity-info">
        <div className="entity-name">{name}</div>
        <div className="entity-state">{formatState(entity)}</div>
      </div>
      {isToggleable && (
        <div className={`toggle-switch ${isOn ? 'on' : 'off'}`} />
      )}
    </div>
  )
}
