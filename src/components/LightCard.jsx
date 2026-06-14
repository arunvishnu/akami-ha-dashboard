import { useState } from 'react'
import { useHA } from '../hooks/useHA'

export function LightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity = states[entityId]
  const name = label || entity?.attributes?.friendly_name || entityId
  const isOn = entity?.state === 'on'
  const brightness = entity?.attributes?.brightness
    ? Math.round((entity.attributes.brightness / 255) * 100)
    : null
  const colorTemp = entity?.attributes?.color_temp
  const supportsColor = entity?.attributes?.supported_color_modes?.some(
    (m) => ['hs', 'rgb', 'xy', 'color_temp'].includes(m)
  )

  const toggle = () => callService('light', 'toggle', { entity_id: entityId })

  const setBrightness = (val) => {
    callService('light', 'turn_on', {
      entity_id: entityId,
      brightness_pct: val,
    })
  }

  return (
    <div className={`light-card ${isOn ? 'state-on' : 'state-off'}`}>
      <div className="light-header" onClick={toggle}>
        <div className="light-icon" style={{ opacity: isOn ? 1 : 0.35 }}>
          💡
        </div>
        <div className="entity-info">
          <div className="entity-name">{name}</div>
          <div className="entity-state">
            {isOn ? (brightness != null ? `${brightness}%` : 'On') : 'Off'}
          </div>
        </div>
        <div className={`toggle-switch ${isOn ? 'on' : 'off'}`} />
      </div>
      {isOn && brightness != null && (
        <div className="brightness-row">
          <span className="dim-label">🔅</span>
          <input
            type="range"
            min={1}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="brightness-slider"
          />
          <span className="dim-label">🔆</span>
        </div>
      )}
    </div>
  )
}
