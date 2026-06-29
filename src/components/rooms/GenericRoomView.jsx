import { useHA } from '../../hooks/useHA'
import { ROOMS } from '../../layout'
import { SmartLightCard } from '../cards/SmartLightCard'
import { FanCard } from '../cards/FanCard'
import { MediaCard } from '../MediaCard'
import { cn } from '../../lib/utils'

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      {children}
    </h3>
  )
}

function sceneLabel(sceneId, roomId) {
  return sceneId
    .replace(/^scene\./, '')
    .replace(new RegExp(`^${roomId}_`), '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function SensorRow({ entityId, states }) {
  const entity = states[entityId]
  if (!entity) return null
  const name  = entity.attributes?.friendly_name ?? entityId
  const value = entity.state
  const unit  = entity.attributes?.unit_of_measurement ?? ''
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-muted-foreground truncate">{name}</span>
      <span className="text-xs font-medium tabular-nums shrink-0 ml-2">{value}{unit}</span>
    </div>
  )
}

export function GenericRoomView({ roomId }) {
  const { states, callService } = useHA()
  const room = ROOMS[roomId]
  if (!room) return null

  const {
    lights    = [],
    switches  = [],
    fan,
    temperature,
    occupancy,
    media,
    scenes    = [],
    sensors   = [],
  } = room.entities

  const tempState      = temperature ? states[temperature] : null
  const tempVal        = tempState ? `${Math.round(parseFloat(tempState.state))}°` : null
  const isOccupied     = occupancy ? states[occupancy]?.state === 'on' : null
  const lightsOnCount  = [...lights, ...switches].filter(id => states[id]?.state === 'on').length
  const fanOn          = fan ? states[fan]?.state === 'on' : false

  const activateScene  = (id) => callService('scene', 'turn_on', { entity_id: id })

  const hasContent = lights.length || switches.length || fan || media || scenes.length || sensors.length

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Header stats */}
      {(tempVal || isOccupied !== null || lightsOnCount > 0 || fanOn) && (
        <div className="flex items-center gap-3 flex-wrap">
          {tempVal && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>🌡️</span><span>{tempVal}</span>
            </div>
          )}
          {isOccupied !== null && (
            <div className={cn('flex items-center gap-1.5 text-xs', isOccupied ? 'text-amber-400' : 'text-muted-foreground')}>
              <span className={cn('h-1.5 w-1.5 rounded-full', isOccupied ? 'bg-amber-400' : 'bg-white/20')} />
              <span>{isOccupied ? 'Occupied' : 'Vacant'}</span>
            </div>
          )}
          {lightsOnCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <span>💡</span><span>{lightsOnCount} on</span>
            </div>
          )}
          {fanOn && (
            <div className="flex items-center gap-1.5 text-xs text-sky-400">
              <span>🌀</span><span>Fan on</span>
            </div>
          )}
        </div>
      )}

      {!hasContent && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground/30 text-sm py-16">
          No controls configured
        </div>
      )}

      {/* Scenes */}
      {scenes.length > 0 && (
        <div>
          <SectionTitle>Scenes</SectionTitle>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {scenes.map(s => (
              <button key={s} onClick={() => activateScene(s)}
                className="rounded-full bg-secondary hover:bg-secondary/70 px-3 py-1.5 text-xs font-medium transition-colors shrink-0">
                {sceneLabel(s, roomId)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lights */}
      {lights.length > 0 && (
        <div>
          <SectionTitle>Lights</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {lights.map(id => <SmartLightCard key={id} entityId={id} />)}
          </div>
        </div>
      )}

      {/* Fan */}
      {fan && (
        <div>
          <SectionTitle>Fan</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            <FanCard entityId={fan} />
          </div>
        </div>
      )}

      {/* Switches */}
      {switches.length > 0 && (
        <div>
          <SectionTitle>Switches</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {switches.map(id => <SmartLightCard key={id} entityId={id} forceType="simple" />)}
          </div>
        </div>
      )}

      {/* Media */}
      {media && (
        <div>
          <SectionTitle>Media</SectionTitle>
          <MediaCard entityId={media} />
        </div>
      )}

      {/* Sensors */}
      {sensors.length > 0 && (
        <div>
          <SectionTitle>Sensors</SectionTitle>
          <div className="rounded-xl border border-white/8 bg-card/40 px-3 divide-y divide-white/5">
            {sensors.map(id => <SensorRow key={id} entityId={id} states={states} />)}
          </div>
        </div>
      )}
    </div>
  )
}
