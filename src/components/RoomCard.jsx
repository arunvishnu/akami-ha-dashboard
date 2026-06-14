import { useHA } from '../hooks/useHA'
import { ROOMS } from '../layout'

export function RoomCard({ roomId, onClick }) {
  const { states } = useHA()
  const room = ROOMS[roomId]
  const { lights = [], fan, temperature, occupancy, media, switches = [] } = room.entities

  const lightsOn = lights.filter((id) => states[id]?.state === 'on').length
  const switchesOn = switches.filter((id) => states[id]?.state === 'on').length
  const totalOn = lightsOn + switchesOn
  const totalLights = lights.length + switches.length

  const isOccupied = occupancy ? states[occupancy]?.state === 'on' : null
  const temp = temperature ? states[temperature] : null
  const tempVal = temp ? `${temp.state}${temp.attributes?.unit_of_measurement || '°'}` : null
  const fanOn = fan ? states[fan]?.state === 'on' : false
  const mediaState = media ? states[media]?.state : null
  const isPlaying = ['playing', 'paused'].includes(mediaState)
  const mediaTitle = isPlaying ? states[media]?.attributes?.media_title : null

  return (
    <div className={`room-card ${totalOn > 0 ? 'room-active' : ''}`} onClick={onClick}>
      <div className="room-card-header">
        <span className="room-icon">{room.icon}</span>
        <span className="room-name">{room.label}</span>
        {isOccupied !== null && (
          <span className={`occupancy-dot ${isOccupied ? 'occupied' : 'vacant'}`} title={isOccupied ? 'Occupied' : 'Vacant'} />
        )}
      </div>

      <div className="room-card-stats">
        {totalLights > 0 && (
          <div className={`room-stat ${totalOn > 0 ? 'stat-on' : ''}`}>
            <span>💡</span>
            <span>{totalOn > 0 ? `${totalOn} on` : 'Off'}</span>
          </div>
        )}
        {tempVal && (
          <div className="room-stat">
            <span>🌡️</span>
            <span>{tempVal}</span>
          </div>
        )}
        {fanOn && (
          <div className="room-stat stat-on">
            <span>🌀</span>
            <span>On</span>
          </div>
        )}
        {isPlaying && (
          <div className="room-stat stat-on">
            <span>▶️</span>
            <span className="stat-text-clip">{mediaTitle || 'Playing'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
