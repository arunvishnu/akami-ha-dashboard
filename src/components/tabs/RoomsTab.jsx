import { useState } from 'react'
import { useHA } from '../../hooks/useHA'
import { ROOMS, FLOORS } from '../../layout'
import { FamilyRoomView } from '../rooms/FamilyRoomView'
import { OfficeView } from '../rooms/OfficeView'
import { MasterBedroomView } from '../rooms/MasterBedroomView'
import { GenericRoomView } from '../rooms/GenericRoomView'
import { RoomDetail } from '../RoomDetail'
import { cn } from '../../lib/utils'

const FLOOR_ORDER = ['first_floor', 'second_floor', 'outdoor', 'basement']

// Rooms with custom views — others fall back to embedded RoomDetail
const GENERIC_ROOMS = [
  'kitchen', 'foyer', 'library', 'living_room', 'sun_room', 'laundry',
  'akshit_bedroom', 'ami_bedroom', 'guest_bedroom', 'basement_main',
  'front_porch', 'driveway', 'garage', 'deck', 'front_yard',
]

const CUSTOM_VIEWS = {
  family_room:    FamilyRoomView,
  office:         OfficeView,
  master_bedroom: MasterBedroomView,
  ...Object.fromEntries(GENERIC_ROOMS.map(id => [id, () => <GenericRoomView roomId={id} />])),
}

function RoomChip({ room, isSelected, onClick, states }) {
  const { lights = [], switches = [], fan, occupancy } = room.entities
  const lightsOn = [...lights, ...switches].filter(id => states[id]?.state === 'on').length
  const fanOn    = fan ? states[fan]?.state === 'on' : false
  const isLit    = lightsOn > 0 || fanOn
  const isOccupied = occupancy ? states[occupancy]?.state === 'on' : false

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors border shrink-0',
        isSelected
          ? 'bg-on/15 border-on/50 text-on font-semibold'
          : 'bg-card border-border text-foreground/80 hover:bg-card/80'
      )}
    >
      <span className="text-base leading-none">{room.icon}</span>
      <span>{room.label}</span>
      {isLit && <span className="h-1.5 w-1.5 rounded-full bg-on shrink-0" />}
      {isOccupied && <span className="h-1.5 w-1.5 rounded-full bg-on/40 shrink-0" />}
    </button>
  )
}

export function RoomsTab() {
  const { states } = useHA()

  const floors = FLOOR_ORDER
    .map(id => FLOORS.find(f => f.id === id))
    .filter(Boolean)
    .map(floor => ({
      ...floor,
      rooms: Object.entries(ROOMS).filter(([, r]) => r.floor === floor.id),
    }))
    .filter(floor => floor.rooms.length > 0)

  const [selectedFloor, setSelectedFloor] = useState(floors[0]?.id)
  const currentFloor = floors.find(f => f.id === selectedFloor) || floors[0]
  const [selectedRoom, setSelectedRoom] = useState(currentFloor?.rooms[0]?.[0])

  const handleFloorChange = (floorId) => {
    setSelectedFloor(floorId)
    const floor = floors.find(f => f.id === floorId)
    setSelectedRoom(floor?.rooms[0]?.[0])
  }

  const CustomView = CUSTOM_VIEWS[selectedRoom]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Floor picker */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 overflow-x-auto shrink-0">
        {floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => handleFloorChange(floor.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap rounded-md transition-colors border shrink-0',
              currentFloor?.id === floor.id
                ? 'bg-background text-foreground font-semibold border-on/40 shadow-sm'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-card'
            )}
          >
            <span className="text-base leading-none">{floor.icon}</span>
            <span>{floor.label}</span>
          </button>
        ))}
      </div>

      {/* Room picker */}
      <div className="flex items-center gap-1.5 px-3 pb-3 overflow-x-auto shrink-0 border-b border-border">
        {currentFloor?.rooms.map(([roomId, room]) => (
          <RoomChip
            key={roomId}
            room={room}
            isSelected={selectedRoom === roomId}
            onClick={() => setSelectedRoom(roomId)}
            states={states}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {CustomView
          ? <CustomView />
          : <RoomDetail roomId={selectedRoom} embedded />
        }
      </div>
    </div>
  )
}
