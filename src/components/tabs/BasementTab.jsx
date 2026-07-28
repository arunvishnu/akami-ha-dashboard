import { useState } from 'react'
import { useHA } from '../../hooks/useHA'
import { RoomDetail } from '../RoomDetail'
import { FloorPlanFrame } from '../floorplan/FloorPlanFrame'
import { RoomCell } from '../floorplan/RoomCell'

const HA_ROOMS = [
  { id: 'basement_main', label: 'Basement', x: 0, y: 0, w: 540, h: 280 },
]

export function BasementTab() {
  const { states } = useHA()
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [tilted, setTilted] = useState(true)

  const toggle = (id) => setSelectedRoom(prev => prev === id ? null : id)

  return (
    <div className="p-3 flex flex-col gap-3">
      <FloorPlanFrame viewBox="0 0 540 280" tilted={tilted} onToggle={setTilted}>
        {HA_ROOMS.map(room => (
          <RoomCell
            key={room.id}
            room={room}
            isSelected={selectedRoom === room.id}
            onClick={() => toggle(room.id)}
            states={states}
          />
        ))}
      </FloorPlanFrame>

      {selectedRoom && (
        <RoomDetail
          roomId={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  )
}
