import { useHA } from '../hooks/useHA'

const MODE_ICONS = { heat: '🔥', cool: '❄️', auto: '♻️', heat_cool: '🔄', off: '⏹️', fan_only: '🌀', dry: '💧' }

export function ClimateCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity = states[entityId]
  const name = label || entity?.attributes?.friendly_name || entityId
  const currentTemp = entity?.attributes?.current_temperature
  const targetTemp = entity?.attributes?.temperature
  const mode = entity?.state
  const unit = entity?.attributes?.temperature_unit || '°'

  const adjustTemp = (delta) => {
    if (!targetTemp) return
    callService('climate', 'set_temperature', {
      entity_id: entityId,
      temperature: Math.round((targetTemp + delta) * 2) / 2,
    })
  }

  return (
    <div className="climate-card">
      <div className="entity-icon">{MODE_ICONS[mode] || '🌡️'}</div>
      <div className="entity-info">
        <div className="entity-name">{name}</div>
        <div className="entity-state">{mode}</div>
      </div>
      <div className="climate-temps">
        {currentTemp != null && (
          <div className="current-temp">{currentTemp}{unit}</div>
        )}
        {targetTemp != null && mode !== 'off' && (
          <div className="target-temp-row">
            <button className="temp-btn" onClick={() => adjustTemp(-0.5)}>−</button>
            <span className="target-temp">{targetTemp}{unit}</span>
            <button className="temp-btn" onClick={() => adjustTemp(0.5)}>+</button>
          </div>
        )}
      </div>
    </div>
  )
}
