import { useState, useEffect } from 'react'
import { useHA } from '../../hooks/useHA'
import { HOME_ENTITIES } from '../../layout'

// ── Clock ─────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <div className="ht-clock">
      <div className="ht-greeting">{greeting()}</div>
      <div className="ht-clock-time">{time}</div>
      <div className="ht-clock-date">{date}</div>
    </div>
  )
}

// ── Weather ───────────────────────────────────────────────────────────

const CONDITION_ICONS = {
  'sunny': '☀️', 'clear-night': '🌙', 'cloudy': '☁️', 'partlycloudy': '⛅',
  'rainy': '🌧️', 'pouring': '🌧️', 'snowy': '❄️', 'lightning': '⛈️',
  'lightning-rainy': '⛈️', 'fog': '🌫️', 'windy': '💨', 'hail': '🌨️',
}

function Weather() {
  const { states } = useHA()
  const w     = states[HOME_ENTITIES.weather]
  const temp  = states['sensor.openweathermap_temperature']
  const hum   = states['sensor.openweathermap_humidity']
  const wind  = states['sensor.openweathermap_wind_speed']
  if (!w) return null

  const icon  = CONDITION_ICONS[w.state] || '🌤️'
  const unit  = temp?.attributes?.unit_of_measurement || '°'
  const label = w.state.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="ht-weather">
      <span className="ht-weather-icon">{icon}</span>
      <div className="ht-weather-info">
        <div className="ht-weather-temp">{temp?.state}{unit}</div>
        <div className="ht-weather-label">{label}</div>
      </div>
      <div className="ht-weather-meta">
        {hum  && <span>💧 {hum.state}%</span>}
        {wind && <span>💨 {wind.state} {wind.attributes?.unit_of_measurement}</span>}
      </div>
    </div>
  )
}

// ── Climate strip ─────────────────────────────────────────────────────

function ClimateStrip() {
  const { states } = useHA()
  const LABELS = { first_floor: '1st Floor', second_floor: '2nd Floor' }
  return (
    <div className="ht-climate-strip">
      {HOME_ENTITIES.climate.map((id) => {
        const e = states[id]
        if (!e) return null
        const key   = id.replace('climate.', '')
        const cur   = e.attributes?.current_temperature
        const tgt   = e.attributes?.temperature
        const unit  = e.attributes?.temperature_unit || '°'
        return (
          <div key={id} className="ht-climate-chip">
            <span className="ht-climate-label">{LABELS[key] || key}</span>
            <span className="ht-climate-cur">{cur}{unit}</span>
            {tgt && <span className="ht-climate-tgt">→ {tgt}{unit}</span>}
          </div>
        )
      })}
    </div>
  )
}

// ── People ────────────────────────────────────────────────────────────

function People() {
  const { states } = useHA()
  return (
    <div className="ht-section">
      <div className="ht-section-label">Who's Home</div>
      <div className="ht-people">
        {HOME_ENTITIES.people.map((id) => {
          const e = states[id]
          const isHome = e?.state === 'home'
          const name   = e?.attributes?.friendly_name || id.replace('person.', '')
          return (
            <div key={id} className={`ht-person ${isHome ? 'home' : 'away'}`}>
              <div className={`ht-person-avatar ${isHome ? 'home' : 'away'}`}>
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="ht-person-name">{name}</span>
              <span className="ht-person-status">{isHome ? '● Home' : '○ Away'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Occupancy ─────────────────────────────────────────────────────────

function Occupancy() {
  const { states } = useHA()
  const rooms = HOME_ENTITIES.occupancy
  return (
    <div className="ht-section">
      <div className="ht-section-label">Rooms</div>
      <div className="ht-occupancy">
        {rooms.map(({ roomId, label, entity }) => {
          const on = states[entity]?.state === 'on'
          return (
            <div key={roomId} className={`ht-occ-chip ${on ? 'occupied' : ''}`}>
              <span className={`occupancy-dot ${on ? 'occupied' : 'vacant'}`} />
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Quick lights ──────────────────────────────────────────────────────

function QuickLights() {
  const { states, callService } = useHA()
  const allOff = () => {
    HOME_ENTITIES.allLights.forEach(id => callService('light', 'turn_off', { entity_id: id }))
    HOME_ENTITIES.allSwitches.forEach(id => callService('switch', 'turn_off', { entity_id: id }))
  }
  return (
    <div className="ht-section">
      <div className="ht-section-label">Lights</div>
      <div className="ht-quick-lights">
        {HOME_ENTITIES.quickLights.map(({ label, entityId, icon, domain }) => {
          const isOn = states[entityId]?.state === 'on'
          return (
            <button
              key={entityId}
              className={`ht-light-btn ${isOn ? 'on' : 'off'}`}
              onClick={() => callService(domain, 'toggle', { entity_id: entityId })}
            >
              <span className="ht-light-icon">{icon}</span>
              <span className="ht-light-label">{label}</span>
              <div className={`toggle-switch ${isOn ? 'on' : 'off'}`} />
            </button>
          )
        })}
        <button className="ht-light-btn all-off" onClick={allOff}>
          <span className="ht-light-icon">🌙</span>
          <span className="ht-light-label">All Off</span>
        </button>
      </div>
    </div>
  )
}

// ── Scene strip ───────────────────────────────────────────────────────

function sceneLabel(id) {
  return id
    .replace('scene.family_room_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function SceneStrip() {
  const { states, callService } = useHA()
  const scenes = HOME_ENTITIES.homeScenes.filter(s => states[s])
  if (scenes.length === 0) return null
  return (
    <div className="ht-scene-strip">
      <div className="ht-scene-strip-label">Family Room</div>
      <div className="ht-scene-buttons">
        {scenes.map(s => (
          <button
            key={s}
            className="ht-scene-btn"
            onClick={() => callService('scene', 'turn_on', { entity_id: s })}
          >
            {sceneLabel(s)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Home tab ──────────────────────────────────────────────────────────

export function HomeTab() {
  return (
    <div className="home-tab">
      <div className="ht-status-bar">
        <Clock />
        <Weather />
        <ClimateStrip />
      </div>

      <div className="ht-main">
        <div className="ht-left">
          <People />
          <Occupancy />
        </div>
        <div className="ht-right">
          <QuickLights />
        </div>
      </div>

      <SceneStrip />
    </div>
  )
}
