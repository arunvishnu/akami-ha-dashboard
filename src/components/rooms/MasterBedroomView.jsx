import { useHA } from '../../hooks/useHA'
import { ROOMS } from '../../layout'
import { SmartLightCard } from '../cards/SmartLightCard'
import { FanCard } from '../cards/FanCard'
import { MediaCard } from '../MediaCard'
import { cn } from '../../lib/utils'

const ROOM_ID = 'master_bedroom'

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      {children}
    </h3>
  )
}

function sceneLabel(sceneId) {
  return sceneId
    .replace(/^scene\.master_bedroom_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export function MasterBedroomView() {
  const { states, callService } = useHA()
  const room = ROOMS[ROOM_ID]
  const { lights = [], fan, media, scenes = [] } = room.entities

  const lightsOnCount = lights.filter(id => states[id]?.state === 'on').length
  const fanOn         = fan ? states[fan]?.state === 'on' : false

  const activateScene = (id) => callService('scene', 'turn_on', { entity_id: id })

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Header stats */}
      <div className="flex items-center gap-3 flex-wrap">
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

      {/* Scenes */}
      {scenes.length > 0 && (
        <div>
          <SectionTitle>Scenes</SectionTitle>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {scenes.map(s => (
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
