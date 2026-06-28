import { useState } from 'react'
import { useHA } from '../../hooks/useHA'
import { ROOMS } from '../../layout'
import { RoomDetail } from '../RoomDetail'

// SVG viewBox 0 0 540 330
// Top (y 0-150):   Library | Family Room (expanded) | Kitchen | Sun Room (protrusion right)
// Bottom (y 153-330): Living Room | Foyer | Dining Room* | Laundry | Garage*
// * = decorative, no HA entities

const GAP = 3

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

// Staircase inside Foyer
const STAIR_STEPS = 7
const STAIR_X = 110
const STAIR_Y = 175
const STAIR_W = 52
const STAIR_H = 80

function getRoomStatus(roomId, states) {
  const room = ROOMS[roomId]
  if (!room) return { isLit: false, isOccupied: null, tempVal: null, statusText: null, isActive: false }
  const { lights = [], switches = [], fan, occupancy, temperature } = room.entities

  const lightsOn = lights.filter(id => states[id]?.state === 'on').length
  const switchesOn = switches.filter(id => states[id]?.state === 'on').length
  const fanOn = fan ? states[fan]?.state === 'on' : false
  const isLit = lightsOn > 0 || switchesOn > 0
  const isActive = isLit || fanOn

  const isOccupied = occupancy ? states[occupancy]?.state === 'on' : null
  const tempState = temperature ? states[temperature] : null
  const tempVal = tempState ? `${Math.round(parseFloat(tempState.state))}°` : null

  const parts = []
  if (lightsOn > 0) parts.push(lights.length === 1 ? 'light' : `${lightsOn}/${lights.length} lights`)
  if (switchesOn > 0) parts.push(switchesOn === 1 && switches.length === 1 ? 'switch' : `${switchesOn} sw`)
  if (fanOn) parts.push('fan')
  const hasControllable = lights.length > 0 || switches.length > 0 || fan
  const statusText = parts.length > 0 ? parts.join(' · ') : (hasControllable ? 'off' : null)

  return { isLit, isOccupied, tempVal, statusText, isActive }
}

function StairCase() {
  const steps = Array.from({ length: STAIR_STEPS })
  const stepH = STAIR_H / STAIR_STEPS
  return (
    <g>
      <rect
        x={STAIR_X}
        y={STAIR_Y}
        width={STAIR_W}
        height={STAIR_H}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={0.5}
      />
      {steps.map((_, i) => (
        <line
          key={i}
          x1={STAIR_X}
          y1={STAIR_Y + i * stepH}
          x2={STAIR_X + STAIR_W}
          y2={STAIR_Y + i * stepH}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={0.5}
        />
      ))}
      <text
        x={STAIR_X + STAIR_W / 2}
        y={STAIR_Y + STAIR_H + 10}
        textAnchor="middle"
        fill="rgba(255,255,255,0.2)"
        fontSize={7}
        fontFamily="system-ui"
      >
        stairs
      </text>
    </g>
  )
}

function RoomCell({ room, isSelected, onClick, states }) {
  const { isLit, isOccupied, tempVal, statusText, isActive } = getRoomStatus(room.id, states)
  const { x, y, w, h, label } = room
  const cx = x + w / 2
  const cy = y + h / 2

  const fill = isSelected
    ? 'rgba(251,191,36,0.22)'
    : isLit
      ? 'rgba(251,191,36,0.10)'
      : 'rgba(255,255,255,0.04)'
  const stroke = isSelected
    ? 'rgba(251,191,36,0.95)'
    : isLit
      ? 'rgba(251,191,36,0.45)'
      : 'rgba(255,255,255,0.12)'
  const labelColor = isLit ? 'rgba(251,191,36,0.95)' : 'rgba(255,255,255,0.7)'

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect
        x={x + GAP}
        y={y + GAP}
        width={w - GAP * 2}
        height={h - GAP * 2}
        rx={6}
        fill={fill}
        stroke={stroke}
        strokeWidth={isSelected ? 1.5 : 1}
        style={{ transition: 'fill 0.4s, stroke 0.3s' }}
      />

      <text
        x={cx}
        y={cy + (tempVal ? -7 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        fontSize={10}
        fontWeight="600"
        fontFamily="system-ui"
        style={{ userSelect: 'none' }}
      >
        {label}
      </text>

      {tempVal && (
        <text
          x={cx}
          y={cy + 9}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={9}
          fontFamily="system-ui"
        >
          {tempVal}
        </text>
      )}

      {statusText && (
        <text
          x={cx}
          y={y + h - GAP - 9}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isActive ? 'rgba(251,191,36,0.65)' : 'rgba(255,255,255,0.2)'}
          fontSize={6.5}
          fontFamily="system-ui"
          style={{ userSelect: 'none' }}
        >
          {statusText}
        </text>
      )}

      {isOccupied !== null && (
        <circle
          cx={x + w - GAP - 8}
          cy={y + GAP + 8}
          r={4}
          fill={isOccupied ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.15)'}
          style={{ transition: 'fill 0.3s' }}
        />
      )}

      {isLit && (
        <circle
          cx={x + GAP + 8}
          cy={y + GAP + 8}
          r={3}
          fill="rgba(251,191,36,0.8)"
        />
      )}
    </g>
  )
}

export function FirstFloorTab() {
  const { states } = useHA()
  const [selectedRoom, setSelectedRoom] = useState(null)

  const toggle = (id) => setSelectedRoom(prev => prev === id ? null : id)

  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <svg
          viewBox="0 0 540 330"
          className="w-full select-none"
          style={{ maxHeight: '68vh' }}
        >
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

          {/* Decorative rooms */}
          {DECOR_ROOMS.map(room => (
            <g key={room.label}>
              <rect
                x={room.x + GAP}
                y={room.y + GAP}
                width={room.w - GAP * 2}
                height={room.h - GAP * 2}
                rx={5}
                fill="rgba(255,255,255,0.02)"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth={1}
              />
              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.18)"
                fontSize={9}
                fontFamily="system-ui"
              >
                {room.label}
              </text>
            </g>
          ))}

          {/* Staircase inside Foyer */}
          <StairCase />

          {/* HA-connected rooms */}
          {HA_ROOMS.map(room => (
            <RoomCell
              key={room.id}
              room={room}
              isSelected={selectedRoom === room.id}
              onClick={() => toggle(room.id)}
              states={states}
            />
          ))}
        </svg>
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
