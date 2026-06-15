import { useState } from 'react'
import { FLOOR_ROOMS } from '../../layout'
import { RoomCard } from '../RoomCard'
import { RoomDetail } from '../RoomDetail'

export function FloorTab({ floorId }) {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const rooms = FLOOR_ROOMS[floorId] || []

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
