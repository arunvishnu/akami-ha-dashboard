import { useHA } from '../hooks/useHA'
import { ROOMS } from '../layout'
import { cn } from '../lib/utils'

export function RoomCard({ roomId, onClick }) {
  const { states } = useHA()
  const room = ROOMS[roomId]
  const { lights = [], fan, temperature, occupancy, media, switches = [], sensors = [] } = room.entities

  const lightsOn    = lights.filter(id => states[id]?.state === 'on').length
  const switchesOn  = switches.filter(id => states[id]?.state === 'on').length
  const totalOn     = lightsOn + switchesOn
  const totalLights = lights.length + switches.length

  const isOccupied  = occupancy ? states[occupancy]?.state === 'on' : null
  const temp        = temperature ? states[temperature] : null
  const tempVal     = temp ? `${temp.state}${temp.attributes?.unit_of_measurement || '°'}` : null
  const fanOn       = fan ? states[fan]?.state === 'on' : false
  const mediaState  = media ? states[media]?.state : null
  const isPlaying   = ['playing', 'paused'].includes(mediaState)
  const mediaTitle  = isPlaying ? states[media]?.attributes?.media_title : null

  const isActive = totalOn > 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col gap-3 rounded-xl p-4 text-left transition-colors w-full',
        'bg-card border',
        isActive ? 'border-on/25' : 'border-border',
        'hover:bg-card/80'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none">{room.icon}</span>
          <span className="text-sm font-semibold truncate">{room.label}</span>
        </div>
        {isOccupied !== null && (
          <span
            className={cn('h-2 w-2 rounded-full shrink-0 mt-1', isOccupied ? 'bg-on' : 'bg-border')}
            title={isOccupied ? 'Occupied' : 'Vacant'}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {totalLights > 0 && (
          <span className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            totalOn > 0 ? 'bg-on/15 text-on' : 'bg-secondary text-muted-foreground'
          )}>
            💡 {totalOn > 0 ? `${totalOn} on` : 'Off'}
          </span>
        )}
        {tempVal && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            🌡️ {tempVal}
          </span>
        )}
        {fanOn && (
          <span className="rounded-full bg-on/15 text-on px-2 py-0.5 text-xs font-medium">
            🌀 On
          </span>
        )}
        {isPlaying && (
          <span className="rounded-full bg-on/15 text-on px-2 py-0.5 text-xs font-medium max-w-[120px] truncate">
            ▶ {mediaTitle || 'Playing'}
          </span>
        )}
        {sensors.slice(0, 2).map((id) => {
          const e = states[id]
          if (!e) return null
          const unit = e.attributes?.unit_of_measurement || ''
          const name = (e.attributes?.friendly_name || id).split(' ').pop()
          return (
            <span key={id} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {name}: {e.state}{unit}
            </span>
          )
        })}
      </div>
    </button>
  )
}
