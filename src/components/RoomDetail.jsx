import { useEffect } from 'react'
import { useHA } from '../hooks/useHA'
import { ROOMS } from '../layout'
import { LightCard } from './LightCard'
import { MediaCard } from './MediaCard'
import { EntityCard } from './EntityCard'

function sceneLabel(sceneId, roomId) {
  const prefix = `scene.${roomId}_`
  const raw = sceneId.startsWith(prefix)
    ? sceneId.slice(prefix.length)
    : sceneId.replace('scene.', '')
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function SectionTitle({ children }) {
  return <div className="detail-section-title">{children}</div>
}

export function RoomDetail({ roomId, onClose }) {
  const { states, callService } = useHA()
  const room = ROOMS[roomId]
  const { lights = [], fan, temperature, occupancy, media, switches = [], scenes = [] } = room.entities

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const tempEntity = temperature ? states[temperature] : null
  const tempVal = tempEntity
    ? `${tempEntity.state}${tempEntity.attributes?.unit_of_measurement || '°'}`
    : null

  const occupancyState = occupancy ? states[occupancy]?.state : null

  const activateScene = (sceneId) =>
    callService('scene', 'turn_on', { entity_id: sceneId })

  // Filter scenes to those that exist in current states
  const availableScenes = scenes.filter((s) => states[s])

  return (
    <div className="room-detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="room-detail-panel">
        <div className="room-detail-header">
          <div className="room-detail-title">
            <span className="room-icon-lg">{room.icon}</span>
            <h2>{room.label}</h2>
          </div>
          <div className="room-detail-meta">
            {tempVal && <span className="detail-temp">🌡️ {tempVal}</span>}
            {occupancyState !== null && (
              <span className={`detail-occupancy ${occupancyState === 'on' ? 'occupied' : ''}`}>
                {occupancyState === 'on' ? '🟢 Occupied' : '⚫ Vacant'}
              </span>
            )}
            <button className="browser-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="room-detail-body">
          {availableScenes.length > 0 && (
            <div className="detail-section">
              <SectionTitle>Scenes</SectionTitle>
              <div className="scene-row">
                {availableScenes.map((s) => (
                  <button key={s} className="scene-btn" onClick={() => activateScene(s)}>
                    {sceneLabel(s, roomId)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {lights.length > 0 && (
            <div className="detail-section">
              <SectionTitle>Lights</SectionTitle>
              <div className="detail-cards">
                {lights.map((id) => (
                  <LightCard key={id} entityId={id} />
                ))}
              </div>
            </div>
          )}

          {fan && (
            <div className="detail-section">
              <SectionTitle>Fan</SectionTitle>
              <div className="detail-cards">
                <EntityCard entityId={fan} />
              </div>
            </div>
          )}

          {switches.length > 0 && (
            <div className="detail-section">
              <SectionTitle>Switches</SectionTitle>
              <div className="detail-cards">
                {switches.map((id) => (
                  <EntityCard key={id} entityId={id} />
                ))}
              </div>
            </div>
          )}

          {media && (
            <div className="detail-section">
              <SectionTitle>Media</SectionTitle>
              <div className="detail-cards">
                <MediaCard entityId={media} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
