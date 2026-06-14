// Home Assistant connection config
// Set these via environment variables in a .env file:
//   VITE_HA_URL=http://homeassistant.local:8123
//   VITE_HA_TOKEN=your_long_lived_access_token

export const HA_URL = import.meta.env.VITE_HA_URL || 'http://homeassistant.local:8123'
export const HA_TOKEN = import.meta.env.VITE_HA_TOKEN || ''

export const WS_URL = HA_URL.replace(/^http/, 'ws') + '/api/websocket'
export const REST_URL = HA_URL + '/api'
