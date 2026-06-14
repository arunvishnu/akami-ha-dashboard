import { useHA } from '../../hooks/useHA'
import { HOME_ENTITIES, ROOMS } from '../../layout'
import { ClimateCard } from '../ClimateCard'

function WeatherWidget() {
  const { states } = useHA()
  const w = states[HOME_ENTITIES.weather]
  if (!w) return null

  const temp = states['sensor.openweathermap_temperature']
  const condition = w.attributes?.friendly_name ? w.state : w.state
  const humidity = states['sensor.openweathermap_humidity']
  const wind = states['sensor.openweathermap_wind_speed']

  const CONDITION_ICONS = {
    'sunny': '☀️', 'clear-night': '🌙', 'cloudy': '☁️',
    'partlycloudy': '⛅', 'rainy': '🌧️', 'snowy': '❄️',
    'lightning': '⛈️', 'lightning-rainy': '⛈️', 'fog': '🌫️',
    'windy': '💨', 'hail': '🌨️', 'pouring': '🌧️',
  }
  const icon = CONDITION_ICONS[w.state] || '🌤️'
  const unit = temp?.attributes?.unit_of_measurement || '°'

  return (
    <div className="home-weather">
      <div className="weather-main">
        <span className="weather-icon">{icon}</span>
        <div>
          <div className="weather-temp">{temp?.state}{unit}</div>
          <div className="weather-condition">{w.state.replace(/-/g, ' ')}</div>
        </div>
      </div>
      <div className="weather-details">
        {humidity && <span>💧 {humidity.state}%</span>}
        {wind && <span>💨 {wind.state} {wind.attributes?.unit_of_measurement}</span>}
      </div>
    </div>
  )
}

function OccupancyOverview() {
  const { states } = useHA()
  const rooms = HOME_ENTITIES.occupancy

  return (
    <div className="occupancy-grid">
      {rooms.map(({ roomId, label, entity }) => {
        const isOn = states[entity]?.state === 'on'
        return (
          <div key={roomId} className={`occupancy-chip ${isOn ? 'occupied' : ''}`}>
            <span className={`occupancy-dot ${isOn ? 'occupied' : 'vacant'}`} />
            {label}
          </div>
        )
      })}
    </div>
  )
}

function ActiveMedia() {
  const { states } = useHA()
  const mediaRooms = Object.entries(ROOMS).filter(([, r]) => r.entities.media)
  const active = mediaRooms.filter(([, r]) => {
    const s = states[r.entities.media]?.state
    return s === 'playing' || s === 'paused'
  })

  if (active.length === 0) return <div className="home-empty-state">Nothing playing</div>

  return (
    <div className="active-media-list">
      {active.map(([roomId, room]) => {
        const entity = states[room.entities.media]
        const title = entity?.attributes?.media_title
        const artist = entity?.attributes?.media_artist
        const isPlaying = entity?.state === 'playing'
        return (
          <div key={roomId} className="active-media-row">
            <span className="room-icon">{room.icon}</span>
            <div className="active-media-info">
              <div className="active-media-room">{room.label}</div>
              {title && <div className="active-media-title">{title}{artist ? ` · ${artist}` : ''}</div>}
            </div>
            <span className="active-media-state">{isPlaying ? '▶️' : '⏸️'}</span>
          </div>
        )
      })}
    </div>
  )
}

function QuickControls() {
  const { callService } = useHA()

  const allLightsOff = () => {
    HOME_ENTITIES.allLights.forEach((id) =>
      callService('light', 'turn_off', { entity_id: id })
    )
  }

  const allSwitchesOff = () => {
    HOME_ENTITIES.allSwitches.forEach((id) =>
      callService('switch', 'turn_off', { entity_id: id })
    )
  }

  const goodNight = () => {
    allLightsOff()
    allSwitchesOff()
  }

  return (
    <div className="quick-controls">
      <button className="quick-btn" onClick={allLightsOff}>
        <span>💡</span> All Lights Off
      </button>
      <button className="quick-btn" onClick={allSwitchesOff}>
        <span>🔌</span> All Switches Off
      </button>
      <button className="quick-btn danger" onClick={goodNight}>
        <span>🌙</span> Good Night
      </button>
    </div>
  )
}

export function HomeTab() {
  return (
    <div className="home-tab">
      <div className="home-grid">
        <div className="home-section wide">
          <div className="home-section-title">Weather</div>
          <WeatherWidget />
        </div>

        <div className="home-section">
          <div className="home-section-title">Climate</div>
          <div className="detail-cards">
            {HOME_ENTITIES.climate.map((id) => (
              <ClimateCard key={id} entityId={id} />
            ))}
          </div>
        </div>

        <div className="home-section">
          <div className="home-section-title">Occupancy</div>
          <OccupancyOverview />
        </div>

        <div className="home-section">
          <div className="home-section-title">Now Playing</div>
          <ActiveMedia />
        </div>

        <div className="home-section">
          <div className="home-section-title">Quick Controls</div>
          <QuickControls />
        </div>
      </div>
    </div>
  )
}
