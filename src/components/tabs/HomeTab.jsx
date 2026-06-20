import { useState, useEffect } from 'react'
import {
  Sofa, ChefHat, Layers, BedDouble, Sparkles, Lamp, Leaf, Sun,
  Moon,
} from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { HOME_ENTITIES } from '../../layout'
import { cn } from '../../lib/utils'
import { Card } from '../ui/card'
import { Switch } from '../ui/switch'

const CONTROL_ICONS = { Sofa, ChefHat, Layers, BedDouble, Sparkles, Lamp, Leaf, Sun }

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

  const r = (v) => v != null ? Math.round(parseFloat(v)) : null

  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-3xl leading-none">{icon}</span>
      <div className="min-w-0">
        <div className="text-xl font-bold tabular-nums">{r(temp?.state)}{unit}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
          {hum  && <span>💧 {r(hum.state)}%</span>}
          {wind && <span>💨 {r(wind.state)} {wind.attributes?.unit_of_measurement}</span>}
        </div>
      </div>
    </div>
  )
}

// ── Climate strip ──────────────────────────────────────────────────────

function ClimateStrip({ onNavigate }) {
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
          <button
            key={id}
            onClick={() => onNavigate?.('climate')}
            className="bg-secondary rounded-lg px-3 py-2 min-w-0 text-left hover:bg-secondary/70 transition-colors"
          >
            <div className="text-xs text-muted-foreground">{LABELS[key] || key}</div>
            <div className="text-base font-semibold tabular-nums">{cur}{unit}</div>
            {tgt && <div className="text-xs text-muted-foreground">→ {tgt}{unit}</div>}
          </button>
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

// ── Quick controls ─────────────────────────────────────────────────────

function QuickControls() {
  const { states, callService } = useHA()

  const allOff = () => {
    HOME_ENTITIES.allLights.forEach(id => callService('light', 'turn_off', { entity_id: id }))
    HOME_ENTITIES.allSwitches.forEach(id => callService('switch', 'turn_off', { entity_id: id }))
  }

  return (
    <section>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Controls</h2>
      <div className="grid grid-cols-2 gap-2">
        {HOME_ENTITIES.quickControls.map((control) => {
          const Icon = CONTROL_ICONS[control.icon]
          const isOn = control.entities.some(e => states[e.id]?.state === 'on')
          const toggle = () => {
            const action = isOn ? 'turn_off' : 'turn_on'
            control.entities.forEach(({ id, domain }) =>
              callService(domain, action, { entity_id: id })
            )
          }
          return (
            <Card
              key={control.label}
              onClick={toggle}
              className={cn(
                'flex items-center gap-3 px-3 py-3 cursor-pointer select-none transition-colors',
                'hover:bg-secondary/60 active:scale-[0.98]',
                isOn ? 'border-on/40 bg-on/5' : 'border-border'
              )}
            >
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                isOn ? 'bg-on/15 text-on' : 'bg-secondary text-muted-foreground'
              )}>
                {Icon && <Icon size={16} />}
              </div>
              <span className="flex-1 text-sm font-medium leading-tight">{control.label}</span>
              <Switch checked={isOn} onCheckedChange={toggle} />
            </Card>
          )
        })}

        {/* All Off */}
        <Card
          onClick={allOff}
          className="col-span-2 flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-secondary/60 transition-colors active:scale-[0.99]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Moon size={16} />
          </div>
          <span className="flex-1 text-sm font-medium text-muted-foreground">All Lights Off</span>
        </Card>
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

export function HomeTab({ onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div className="flex items-start gap-6 px-4 py-4 border-b border-border flex-wrap">
        <Clock />
        <Weather />
        <ClimateStrip onNavigate={onNavigate} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto grid grid-cols-[1fr_1fr] gap-4 p-4 items-start">
        <div className="flex flex-col gap-4">
          <People />
          <Occupancy />
        </div>
        <div>
          <QuickControls />
        </div>
      </div>

      <SceneStrip />
    </div>
  )
}
