import { useState } from 'react'
import { FLOOR_ROOMS } from '../../layout'
import { RoomCard } from '../RoomCard'
import { RoomDetail } from '../RoomDetail'

export function FloorTab({ floorId }) {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const rooms = FLOOR_ROOMS[floorId] || []

  return (
    <div className="floor-tab">
      <div className="room-grid">
        {rooms.map((roomId) => (
          <RoomCard
            key={roomId}
            roomId={roomId}
            onClick={() => setSelectedRoom(roomId)}
          />
        ))}
      </div>

      {selectedRoom && (
        <RoomDetail
          roomId={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  )
}
