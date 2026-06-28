import { useHA } from '../../hooks/useHA'
import { ROOMS } from '../../layout'
import { SmartLightCard } from '../cards/SmartLightCard'
import { MediaCard } from '../MediaCard'
import { EntityCard } from '../EntityCard'
import { cn } from '../../lib/utils'

const ROOM_ID = 'family_room'

// Additional lights beyond the group entity in layout.js
const EXTRA_LIGHTS = [
  { id: 'light.family_room_family_room_fan_light', label: 'Fan Light' },
  { id: 'light.family_room_floor_lamp',            label: 'Floor Lamp' },
]

const COVER_LABELS = {
  'cover.family_room_family_room_2_story_windows_top_left':     'Top Left',
  'cover.family_room_family_room_2_story_windows_top_right':    'Top Right',
  'cover.family_room_family_room_2_story_windows_bottom_left':  'Bottom Left',
  'cover.family_room_family_room_2_story_windows_bottom_right': 'Bottom Right',
}

const EXTRA_SCENES = [
  'scene.family_room_arctic_aurora',
  'scene.family_room_dance',
  'scene.family_room_dance_2',
  'scene.family_room_carousel',
]

function sceneLabel(sceneId) {
  return sceneId
    .replace('scene.family_room_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      {children}
    </h3>
  )
}

function CoverCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity = states[entityId]
  if (!entity) return null

  const pos = entity.attributes?.current_position ?? null
  const isOpen = entity.state === 'open' || entity.state === 'opening'
  const isMoving = entity.state === 'opening' || entity.state === 'closing'

  return (
    <div className={cn(
      'rounded-xl border p-3 flex flex-col gap-2 transition-colors',
      isOpen ? 'bg-amber-500/8 border-amber-500/30' : 'bg-card border-border'
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        {pos !== null && (
          <span className="text-[10px] text-muted-foreground">{pos}%</span>
        )}
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => callService('cover', 'open_cover', { entity_id: entityId })}
          className="flex-1 text-[10px] py-1 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors font-medium"
        >
          ↑ Open
        </button>
        {isMoving && (
          <button
            onClick={() => callService('cover', 'stop_cover', { entity_id: entityId })}
            className="flex-1 text-[10px] py-1 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors font-medium"
          >
            ■ Stop
          </button>
        )}
        <button
          onClick={() => callService('cover', 'close_cover', { entity_id: entityId })}
          className="flex-1 text-[10px] py-1 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors font-medium"
        >
          ↓ Close
        </button>
      </div>
    </div>
  )
}

export function FamilyRoomView() {
  const { states, callService } = useHA()
  const room = ROOMS[ROOM_ID]
  const { lights = [], fan, temperature, occupancy, media, switches = [], scenes = [], covers = [] } = room.entities

  const tempState  = temperature ? states[temperature] : null
  const tempVal    = tempState ? `${Math.round(parseFloat(tempState.state))}°` : null
  const isOccupied = occupancy ? states[occupancy]?.state === 'on' : null
  const fanOn      = fan ? states[fan]?.state === 'on' : false
  const lightsOnCount = [...lights, ...switches, ...EXTRA_LIGHTS.map(l => l.id)]
    .filter(id => states[id]?.state === 'on').length

  const allScenes = [...new Set([...scenes, ...EXTRA_SCENES])].filter(s => states[s])
  const activateScene = (id) => callService('scene', 'turn_on', { entity_id: id })

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Header stats */}
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

      {/* Camera placeholder */}
      <div className="rounded-xl border border-dashed border-border/40 bg-card/40 h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
        <span className="text-4xl">📷</span>
        <span className="text-xs tracking-wide">Camera — coming soon</span>
      </div>

      {/* Scenes */}
      {allScenes.length > 0 && (
        <div>
          <SectionTitle>Scenes</SectionTitle>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allScenes.map(s => (
              <button
                key={s}
                onClick={() => activateScene(s)}
                className="rounded-full bg-secondary hover:bg-secondary/70 px-3 py-1.5 text-xs font-medium transition-colors shrink-0"
              >
                {sceneLabel(s)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lights */}
      <div>
        <SectionTitle>Lights</SectionTitle>
        <div className="flex flex-col gap-2">
          {lights.map(id => <SmartLightCard key={id} entityId={id} />)}
          {EXTRA_LIGHTS.map(({ id }) =>
            states[id] ? <SmartLightCard key={id} entityId={id} /> : null
          )}
        </div>
      </div>

      {/* Fan */}
      {fan && (
        <div>
          <SectionTitle>Fan</SectionTitle>
          <EntityCard entityId={fan} />
        </div>
      )}

      {/* Windows */}
      {covers.length > 0 && (
        <div>
          <SectionTitle>Windows</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {covers.map(id => (
              <CoverCard key={id} entityId={id} label={COVER_LABELS[id] ?? id} />
            ))}
          </div>
        </div>
      )}

      {/* Switches */}
      {switches.length > 0 && (
        <div>
          <SectionTitle>Switches</SectionTitle>
          <div className="flex flex-col gap-2">
            {switches.map(id => <EntityCard key={id} entityId={id} />)}
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
    </div>
  )
}
