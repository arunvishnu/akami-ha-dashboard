import { useState } from 'react'
import { useHA } from '../../hooks/useHA'
import { RoomDetail } from '../RoomDetail'
import { FloorPlanFrame } from '../floorplan/FloorPlanFrame'
import { RoomCell } from '../floorplan/RoomCell'
import { StairCase } from '../floorplan/StairCase'
import { DecorRoom } from '../floorplan/DecorRoom'

// SVG viewBox 0 0 540 330
// Top (y 0-150):   Office | Master Bedroom (wide) | Bathroom (decor)
// Bottom (y 153-330): Ami's Bedroom | Hallway/Landing (decor, stairs) | Guest Bedroom | Akshit's Bedroom

const HA_ROOMS = [
  { id: 'office',         label: 'Office',           x: 0,   y: 0,   w: 170, h: 150 },
  { id: 'master_bedroom', label: 'Master Bedroom',   x: 173, y: 0,   w: 220, h: 150 },
  { id: 'ami_bedroom',    label: "Ami's Bedroom",    x: 0,   y: 153, w: 165, h: 177 },
  { id: 'guest_bedroom',  label: 'Guest Bedroom',    x: 271, y: 153, w: 93,  h: 177 },
  { id: 'akshit_bedroom', label: "Akshit's Bedroom", x: 367, y: 153, w: 170, h: 177 },
]

const DECOR_ROOMS = [
  { label: 'Bathroom', x: 396, y: 0,   w: 141, h: 150 },
  { label: 'Hallway',  x: 168, y: 153, w: 100, h: 177 },
]

export function SecondFloorTab() {
  const { states } = useHA()
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [tilted, setTilted] = useState(true)

  const toggle = (id) => setSelectedRoom(prev => prev === id ? null : id)

  return (
    <div className="p-3 flex flex-col gap-3">
      <FloorPlanFrame viewBox="0 0 540 330" tilted={tilted} onToggle={setTilted}>
        {/* Horizontal divider */}
        <line
          x1={0} y1={151.5}
          x2={540} y2={151.5}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />

        {DECOR_ROOMS.map(room => <DecorRoom key={room.label} room={room} />)}

        {/* Staircase inside Hallway */}
        <StairCase x={180} y={180} w={52} h={80} />

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
