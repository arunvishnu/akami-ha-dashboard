import { useEffect } from 'react'
import { useHA } from '../hooks/useHA'
import { ROOMS } from '../layout'
import { LightCard } from './LightCard'
import { MediaCard } from './MediaCard'
import { EntityCard } from './EntityCard'
import { cn } from '../lib/utils'

function sceneLabel(sceneId, roomId) {
  const prefix = `scene.${roomId}_`
  const raw = sceneId.startsWith(prefix)
    ? sceneId.slice(prefix.length)
    : sceneId.replace('scene.', '')
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      {children}
    </h3>
  )
}

export function RoomDetail({ roomId, onClose }) {
  const { states, callService } = useHA()
  const room = ROOMS[roomId]
  const { lights = [], fan, temperature, occupancy, media, switches = [], scenes = [], sensors = [] } = room.entities

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const tempEntity     = temperature ? states[temperature] : null
  const tempVal        = tempEntity
    ? `${tempEntity.state}${tempEntity.attributes?.unit_of_measurement || '°'}`
    : null
  const occupancyState = occupancy ? states[occupancy]?.state : null
  const availableScenes = scenes.filter((s) => states[s])

  const activateScene = (sceneId) =>
    callService('scene', 'turn_on', { entity_id: sceneId })

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute right-0 top-0 h-full w-80 bg-card border-l border-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl leading-none">{room.icon}</span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate">{room.label}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {tempVal && (
                  <span className="text-xs text-muted-foreground">🌡️ {tempVal}</span>
                )}
                {occupancyState !== null && (
                  <span className={cn('text-xs', occupancyState === 'on' ? 'text-on' : 'text-muted-foreground')}>
                    {occupancyState === 'on' ? '● Occupied' : '○ Vacant'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0 ml-2"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {availableScenes.length > 0 && (
            <div>
              <SectionTitle>Scenes</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {availableScenes.map((s) => (
                  <button
                    key={s}
                    onClick={() => activateScene(s)}
                    className="rounded-full bg-secondary hover:bg-secondary/70 px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {sceneLabel(s, roomId)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {lights.length > 0 && (
            <div>
              <SectionTitle>Lights</SectionTitle>
              <div className="flex flex-col gap-2">
                {lights.map((id) => <LightCard key={id} entityId={id} />)}
              </div>
            </div>
          )}

          {fan && (
            <div>
              <SectionTitle>Fan</SectionTitle>
              <EntityCard entityId={fan} />
            </div>
          )}

          {switches.length > 0 && (
            <div>
              <SectionTitle>Switches</SectionTitle>
              <div className="flex flex-col gap-2">
                {switches.map((id) => <EntityCard key={id} entityId={id} />)}
              </div>
            </div>
          )}

          {media && (
            <div>
              <SectionTitle>Media</SectionTitle>
              <MediaCard entityId={media} />
            </div>
          )}

          {sensors.length > 0 && (
            <div>
              <SectionTitle>Sensors</SectionTitle>
              <div className="flex flex-col gap-2">
                {sensors.map((id) => <EntityCard key={id} entityId={id} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
