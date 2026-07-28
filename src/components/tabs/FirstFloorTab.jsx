import { useState } from 'react'
import { useHA } from '../../hooks/useHA'
import { RoomDetail } from '../RoomDetail'
import { FloorPlanFrame } from '../floorplan/FloorPlanFrame'
import { RoomCell } from '../floorplan/RoomCell'
import { StairCase } from '../floorplan/StairCase'
import { DecorRoom } from '../floorplan/DecorRoom'

// SVG viewBox 0 0 540 330
// Top (y 0-150):   Library | Family Room (expanded) | Kitchen | Sun Room (protrusion right)
// Bottom (y 153-330): Living Room | Foyer | Dining Room* | Laundry | Garage*
// * = decorative, no HA entities

const HA_ROOMS = [
  { id: 'library',     label: 'Library',     x: 0,   y: 0,   w: 82,  h: 150 },
  { id: 'family_room', label: 'Family Room', x: 85,  y: 0,   w: 200, h: 150 },
  { id: 'kitchen',     label: 'Kitchen',     x: 288, y: 0,   w: 130, h: 150 },
  { id: 'sun_room',    label: 'Sun Room',    x: 421, y: 0,   w: 116, h: 95  },
  { id: 'living_room', label: 'Living Room', x: 0,   y: 153, w: 100, h: 177 },
  { id: 'foyer',       label: 'Foyer',       x: 103, y: 153, w: 90,  h: 177 },
  { id: 'laundry',     label: 'Laundry',     x: 314, y: 153, w: 60,  h: 177 },
]

const DECOR_ROOMS = [
  { label: 'Dining Room', x: 196, y: 153, w: 115, h: 140 },
  { label: 'Garage',      x: 377, y: 153, w: 160, h: 177 },
]

export function FirstFloorTab() {
  const { states } = useHA()
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [tilted, setTilted] = useState(true)

  const toggle = (id) => setSelectedRoom(prev => prev === id ? null : id)

  return (
    <div className="p-3 flex flex-col gap-3">
      <FloorPlanFrame viewBox="0 0 540 330" tilted={tilted} onToggle={setTilted}>
        {/* Horizontal divider between top and bottom sections */}
        <line
          x1={0} y1={151.5}
          x2={418} y2={151.5}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />

        {/* Sun Room protrusion connector — dashed line showing it extends from kitchen */}
        <line
          x1={421} y1={95}
          x2={421} y2={150}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
          strokeDasharray="3,3"
        />

        {DECOR_ROOMS.map(room => <DecorRoom key={room.label} room={room} />)}

        {/* Staircase inside Foyer */}
        <StairCase x={110} y={175} w={52} h={80} />

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
