import { ROOMS } from '../../layout'

export function getRoomStatus(roomId, states) {
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
