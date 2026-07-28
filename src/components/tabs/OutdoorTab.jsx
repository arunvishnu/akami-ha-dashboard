import { useState } from 'react'
import { useHA } from '../../hooks/useHA'
import { RoomDetail } from '../RoomDetail'
import { FloorPlanFrame } from '../floorplan/FloorPlanFrame'
import { RoomCell } from '../floorplan/RoomCell'

// SVG viewBox 0 0 540 330
// Top (y 0-104):    Front Yard (full width)
// Mid (y 107-224):  Driveway | Garage | Front Porch
// Bottom (y 227-330): Deck (centered, 1/3 width)

const HA_ROOMS = [
  { id: 'front_yard',  label: 'Front Yard',   x: 0,   y: 0,   w: 540, h: 104 },
  { id: 'driveway',    label: 'Driveway',     x: 0,   y: 107, w: 180, h: 117 },
  { id: 'garage',      label: 'Garage',       x: 180, y: 107, w: 180, h: 117 },
  { id: 'front_porch', label: 'Front Porch',  x: 360, y: 107, w: 180, h: 117 },
  { id: 'deck',        label: 'Deck',         x: 180, y: 227, w: 180, h: 103 },
]

export function OutdoorTab() {
  const { states } = useHA()
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [tilted, setTilted] = useState(true)

  const toggle = (id) => setSelectedRoom(prev => prev === id ? null : id)

  return (
    <div className="p-3 flex flex-col gap-3">
      <FloorPlanFrame viewBox="0 0 540 330" tilted={tilted} onToggle={setTilted}>
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
