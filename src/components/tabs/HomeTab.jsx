import { useState, useEffect } from 'react'
import { useHA } from '../../hooks/useHA'
import { HOME_ENTITIES } from '../../layout'
import { cn } from '../../lib/utils'

// ── Toggle ─────────────────────────────────────────────────────────────

function Toggle({ isOn }) {
  return (
    <div className={cn(
      'relative h-5 w-9 rounded-full transition-colors duration-200 shrink-0',
      isOn ? 'bg-on' : 'bg-secondary'
    )}>
      <span className={cn(
        'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
        isOn && 'translate-x-4'
      )} />
    </div>
  )
}

// ── Clock ──────────────────────────────────────────────────────────────

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
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground font-medium">{greeting()}</div>
      <div className="text-2xl font-bold tracking-tight tabular-nums">{time}</div>
      <div className="text-xs text-muted-foreground">{date}</div>
    </div>
  )
}

// ── Weather ────────────────────────────────────────────────────────────

const CONDITION_ICONS = {
  'sunny': '☀️', 'clear-night': '🌙', 'cloudy': '☁️', 'partlycloudy': '⛅',
  'rainy': '🌧️', 'pouring': '🌧️', 'snowy': '❄️', 'lightning': '⛈️',
  'lightning-rainy': '⛈️', 'fog': '🌫️', 'windy': '💨', 'hail': '🌨️',
}

function Weather() {
  const { states } = useHA()
  const w    = states[HOME_ENTITIES.weather]
  const temp = states['sensor.openweathermap_temperature']
  const hum  = states['sensor.openweathermap_humidity']
  const wind = states['sensor.openweathermap_wind_speed']
  if (!w) return null

  const icon  = CONDITION_ICONS[w.state] || '🌤️'
  const unit  = temp?.attributes?.unit_of_measurement || '°'
  const label = w.state.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-3xl leading-none">{icon}</span>
      <div className="min-w-0">
        <div className="text-xl font-bold tabular-nums">{temp?.state}{unit}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
          {hum  && <span>💧 {hum.state}%</span>}
          {wind && <span>💨 {wind.state} {wind.attributes?.unit_of_measurement}</span>}
        </div>
      </div>
    </div>
  )
}

// ── Climate strip ──────────────────────────────────────────────────────

function ClimateStrip() {
  const { states } = useHA()
  const LABELS = { first_floor: '1st Floor', second_floor: '2nd Floor' }
  return (
    <div className="flex gap-2">
      {HOME_ENTITIES.climate.map((id) => {
        const e = states[id]
        if (!e) return null
        const key  = id.replace('climate.', '')
        const cur  = e.attributes?.current_temperature
        const tgt  = e.attributes?.temperature
        const unit = e.attributes?.temperature_unit || '°'
        return (
          <div key={id} className="bg-secondary rounded-lg px-3 py-2 min-w-0">
            <div className="text-xs text-muted-foreground">{LABELS[key] || key}</div>
            <div className="text-base font-semibold tabular-nums">{cur}{unit}</div>
            {tgt && <div className="text-xs text-muted-foreground">→ {tgt}{unit}</div>}
          </div>
        )
      })}
    </div>
  )
}

// ── People ─────────────────────────────────────────────────────────────

function People() {
  const { states } = useHA()
  return (
    <section>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Who's Home</h2>
      <div className="flex flex-col gap-2">
        {HOME_ENTITIES.people.map((id) => {
          const e      = states[id]
          const isHome = e?.state === 'home'
          const name   = e?.attributes?.friendly_name || id.replace('person.', '')
          return (
            <div key={id} className="flex items-center gap-3">
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                isHome ? 'bg-on/20 text-on' : 'bg-secondary text-muted-foreground'
              )}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{name}</div>
                <div className={cn('text-xs', isHome ? 'text-on' : 'text-muted-foreground')}>
                  {isHome ? '● Home' : '○ Away'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Occupancy ──────────────────────────────────────────────────────────

function Occupancy() {
  const { states } = useHA()
  return (
    <section>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rooms</h2>
      <div className="flex flex-wrap gap-2">
        {HOME_ENTITIES.occupancy.map(({ roomId, label, entity }) => {
          const on = states[entity]?.state === 'on'
          return (
            <div
              key={roomId}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                on
                  ? 'bg-on/15 text-on'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', on ? 'bg-on' : 'bg-muted-foreground')} />
              {label}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Quick lights ───────────────────────────────────────────────────────

function QuickLights() {
  const { states, callService } = useHA()
  const allOff = () => {
    HOME_ENTITIES.allLights.forEach(id => callService('light', 'turn_off', { entity_id: id }))
    HOME_ENTITIES.allSwitches.forEach(id => callService('switch', 'turn_off', { entity_id: id }))
  }

  return (
    <section>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Lights</h2>
      <div className="flex flex-col gap-2">
        {HOME_ENTITIES.quickLights.map(({ label, entityId, icon, domain }) => {
          const isOn = states[entityId]?.state === 'on'
          return (
            <button
              key={entityId}
              onClick={() => callService(domain, 'toggle', { entity_id: entityId })}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors',
                'bg-card border',
                isOn ? 'border-on/30' : 'border-border'
              )}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className="flex-1 text-sm font-medium">{label}</span>
              <Toggle isOn={isOn} />
            </button>
          )
        })}
        <button
          onClick={allOff}
          className="flex items-center gap-3 rounded-xl px-4 py-3 bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <span className="text-lg leading-none">🌙</span>
          <span className="flex-1 text-sm font-medium text-muted-foreground">All Off</span>
        </button>
      </div>
    </section>
  )
}

// ── Scene strip ────────────────────────────────────────────────────────

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
    <div className="border-t border-border px-4 py-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Family Room</div>
      <div className="flex gap-2 flex-wrap">
        {scenes.map(s => (
          <button
            key={s}
            onClick={() => callService('scene', 'turn_on', { entity_id: s })}
            className="rounded-full bg-secondary hover:bg-secondary/70 px-4 py-1.5 text-xs font-medium transition-colors"
          >
            {sceneLabel(s)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Home tab ───────────────────────────────────────────────────────────

export function HomeTab() {
  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div className="flex items-start gap-6 px-4 py-4 border-b border-border flex-wrap">
        <Clock />
        <Weather />
        <ClimateStrip />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto grid grid-cols-[1fr_1fr] gap-4 p-4 items-start">
        <div className="flex flex-col gap-4">
          <People />
          <Occupancy />
        </div>
        <div>
          <QuickLights />
        </div>
      </div>

      <SceneStrip />
    </div>
  )
}
