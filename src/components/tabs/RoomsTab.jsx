import { useState } from 'react'
import { useHA } from '../../hooks/useHA'
import { ROOMS } from '../../layout'
import { FamilyRoomView } from '../rooms/FamilyRoomView'
import { OfficeView } from '../rooms/OfficeView'
import { MasterBedroomView } from '../rooms/MasterBedroomView'
import { GenericRoomView } from '../rooms/GenericRoomView'
import { RoomDetail } from '../RoomDetail'
import { cn } from '../../lib/utils'

const FLOOR_ORDER = ['first_floor', 'second_floor', 'outdoor', 'basement']
const FLOOR_LABELS = {
  first_floor:  '1st Floor',
  second_floor: '2nd Floor',
  outdoor:      'Outdoor',
  basement:     'Basement',
}

function RoomSidebarItem({ roomId, room, isSelected, onClick, states }) {
  const { lights = [], switches = [], fan, occupancy, temperature } = room.entities
  const lightsOn = [...lights, ...switches].filter(id => states[id]?.state === 'on').length
  const fanOn    = fan ? states[fan]?.state === 'on' : false
  const isLit    = lightsOn > 0 || fanOn
  const isOccupied = occupancy ? states[occupancy]?.state === 'on' : null
  const tempState  = temperature ? states[temperature] : null
  const tempVal    = tempState ? `${Math.round(parseFloat(tempState.state))}°` : null

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2.5 flex flex-col gap-0.5 border-b border-border/30 transition-colors border-l-2',
        isSelected
          ? 'bg-amber-500/10 border-l-amber-500/80 text-amber-400'
          : 'border-l-transparent hover:bg-white/5 text-foreground/80'
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-medium truncate leading-tight">{room.label}</span>
        <div className="flex gap-1 items-center shrink-0">
          {isLit && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
          {isOccupied === true && <span className="h-1.5 w-1.5 rounded-full bg-amber-300/50" />}
        </div>
      </div>
      {tempVal && (
        <span className="text-[10px] text-muted-foreground">{tempVal}</span>
      )}
    </button>
  )
}

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

export function RoomsTab() {
  const { states } = useHA()
  const [selectedRoom, setSelectedRoom] = useState('family_room')

  const grouped = FLOOR_ORDER
    .map(floorId => ({
      floorId,
      label: FLOOR_LABELS[floorId],
      rooms: Object.entries(ROOMS).filter(([, r]) => r.floor === floorId),
    }))
    .filter(g => g.rooms.length > 0)

  const CustomView = CUSTOM_VIEWS[selectedRoom]

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-[118px] border-r border-border overflow-y-auto shrink-0 flex flex-col bg-card/20">
        {grouped.map(({ floorId, label, rooms }) => (
          <div key={floorId}>
            <div className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40 sticky top-0 bg-background/90 backdrop-blur-sm">
              {label}
            </div>
            {rooms.map(([roomId, room]) => (
              <RoomSidebarItem
                key={roomId}
                roomId={roomId}
                room={room}
                isSelected={selectedRoom === roomId}
                onClick={() => setSelectedRoom(roomId)}
                states={states}
              />
            ))}
          </div>
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
