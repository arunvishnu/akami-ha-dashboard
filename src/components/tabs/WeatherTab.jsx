import { useState, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Cell, LabelList,
} from 'recharts'
import { useHA } from '../../hooks/useHA'
import { useHistory } from '../../hooks/useHistory'
import { cn } from '../../lib/utils'
import { TemperatureChart } from '../TemperatureChart'

// ── Condition helpers ─────────────────────────────────────────────────

const CONDITION_ICONS = {
  'sunny':           '☀️',
  'clear-night':     '🌙',
  'cloudy':          '☁️',
  'partlycloudy':    '⛅',
  'rainy':           '🌧️',
  'pouring':         '🌧️',
  'snowy':           '❄️',
  'snowy-rainy':     '🌨️',
  'lightning':       '⛈️',
  'lightning-rainy': '⛈️',
  'fog':             '🌫️',
  'windy':           '💨',
  'windy-variant':   '💨',
  'hail':            '🌨️',
  'exceptional':     '⚠️',
}

const CONDITION_LABELS = {
  'sunny':           'Sunny',
  'clear-night':     'Clear Night',
  'cloudy':          'Cloudy',
  'partlycloudy':    'Partly Cloudy',
  'rainy':           'Rain',
  'pouring':         'Heavy Rain',
  'snowy':           'Snow',
  'snowy-rainy':     'Mixed Snow & Rain',
  'lightning':       'Thunderstorm',
  'lightning-rainy': 'Thunderstorm',
  'fog':             'Fog',
  'windy':           'Windy',
  'windy-variant':   'Very Windy',
  'hail':            'Hail',
  'exceptional':     'Exceptional',
}

function conditionIcon(c) { return CONDITION_ICONS[c] || '🌤️' }
function conditionLabel(c) { return CONDITION_LABELS[c] || (c?.replace(/-/g,' ').replace(/\b\w/g,s=>s.toUpperCase()) || '—') }

// ── Date helpers ───────────────────────────────────────────────────────

function parseForecastDate(datetime) {
  // OWM returns e.g. "2024-03-18T12:00:00+00:00" — parse as local time via date part only
  const d = new Date(datetime)
  return d
}

function dayLabel(d, index) {
  if (index === 0) return 'Today'
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function dateLabel(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function round(n) { return n != null ? Math.round(n) : '—' }
function roundSensor(state) { return state != null ? Math.round(parseFloat(state)) : '—' }

// ── Wind direction ─────────────────────────────────────────────────────

function windDir(bearing) {
  if (bearing == null) return ''
  const dirs = ['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(bearing / 45) % 8]
}

// ── Day column ────────────────────────────────────────────────────────

function DayColumn({ entry, index, selected, onClick }) {
  const d = parseForecastDate(entry.datetime)
  const isSelected = selected === index
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-colors min-w-[72px] flex-1',
        isSelected ? 'bg-secondary' : 'hover:bg-secondary/50'
      )}
    >
      <span className={cn('text-xs font-semibold', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
        {dayLabel(d, index)}
      </span>
      <span className="text-xs text-muted-foreground">{dateLabel(d)}</span>
      <span className="text-2xl leading-none my-1">{conditionIcon(entry.condition)}</span>
      <div className="flex items-baseline gap-1.5 text-sm">
        <span className="font-semibold">{round(entry.temperature)}°</span>
        <span className="text-muted-foreground text-xs">{round(entry.templow)}°</span>
      </div>
    </button>
  )
}

// ── Detail panel ───────────────────────────────────────────────────────

function DetailPanel({ entry, sunEntity }) {
  if (!entry) return null
  const d = parseForecastDate(entry.datetime)
  const nextRising  = sunEntity?.attributes?.next_rising
  const nextSetting = sunEntity?.attributes?.next_setting

  const stats = [
    { icon: '💨', label: 'Wind',     value: entry.wind_speed != null ? `${round(entry.wind_speed)} mph ${windDir(entry.wind_bearing)}` : '—' },
    { icon: '💧', label: 'Humidity', value: entry.humidity != null ? `${entry.humidity}%` : '—' },
    { icon: '🌧️', label: 'Precip.',  value: entry.precipitation_probability != null ? `${entry.precipitation_probability}%` : '—' },
    { icon: '🌅', label: 'Sunrise',  value: formatTime(nextRising) },
    { icon: '🌇', label: 'Sunset',   value: formatTime(nextSetting) },
  ]

  return (
    <div className="border-t border-border mt-2 pt-4 px-4 pb-4">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-4xl font-bold tabular-nums">{round(entry.temperature)}°</span>
        <span className="text-lg text-muted-foreground tabular-nums">/{round(entry.templow)}°</span>
        <span className="text-base font-medium text-foreground">{conditionLabel(entry.condition)}</span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
        {stats.map(s => (
          <div key={s.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>{s.icon}</span>
            <span>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 24h chart series ──────────────────────────────────────────────────

const fromState = s => parseFloat(s.state)

const TEMP_SERIES = [
  { id: 'sensor.openweathermap_temperature', key: 'temp',   label: 'Temperature', color: '#60a5fa', getValue: fromState, area: true },
  { id: 'sensor.openweathermap_feels_like',  key: 'feels',  label: 'Feels Like',  color: '#fb923c', getValue: fromState },
]

const HUMIDITY_SERIES = [
  { id: 'sensor.openweathermap_humidity', key: 'humidity', label: 'Humidity', color: '#38bdf8', getValue: fromState },
]


// ── Bar chart helpers ─────────────────────────────────────────────────

function BarChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1.5 font-medium">{label}</div>
      {payload.map(p => p.value != null && (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.fill ?? p.color }} />
          <span className="text-muted-foreground w-20">{p.name}</span>
          <span className="font-semibold tabular-nums">{p.value}{p.unit ?? ''}</span>
        </div>
      ))}
    </div>
  )
}

function ForecastBarCard({ title, children, height = 200 }) {
  return (
    <div className="bg-card border border-border rounded-xl px-4 pt-4 pb-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {title}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

const AXIS_TICK = { fill: '#6b7280', fontSize: 11, fontFamily: 'system-ui' }

// ── Sunrise / sunset chart ────────────────────────────────────────────

function hourToTime(h) {
  const hrs  = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  const ampm = hrs >= 12 ? 'PM' : 'AM'
  const disp = hrs === 0 ? 12 : hrs > 12 ? hrs - 12 : hrs
  return `${disp}:${String(mins).padStart(2, '0')} ${ampm}`
}

function DaylightYTick({ x, y, payload }) {
  const h = payload.value
  const label = h === 0 ? '12 AM' : h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`
  return (
    <text x={x} y={y + 4} textAnchor="end" fill="#6b7280" fontSize={10} fontFamily="system-ui">
      {label}
    </text>
  )
}

function DaylightTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const raw = payload.find(p => p.dataKey === 'daylight')?.payload
  if (!raw) return null
  const totalMins = Math.round(raw.daylight * 60)
  const dh = Math.floor(totalMins / 60)
  const dm = totalMins % 60
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1.5 font-medium">{label}</div>
      <div className="flex items-center gap-2 py-0.5">
        <span>🌅</span>
        <span className="text-muted-foreground w-14">Sunrise</span>
        <span className="font-semibold">{hourToTime(raw.sunriseRaw)}</span>
      </div>
      <div className="flex items-center gap-2 py-0.5">
        <span>🌇</span>
        <span className="text-muted-foreground w-14">Sunset</span>
        <span className="font-semibold">{hourToTime(raw.sunsetRaw)}</span>
      </div>
      <div className="flex items-center gap-2 py-0.5 pt-1.5 mt-1 border-t border-border">
        <span>☀️</span>
        <span className="text-muted-foreground w-14">Daylight</span>
        <span className="font-semibold">{dh}h {dm > 0 ? `${dm}m` : ''}</span>
      </div>
    </div>
  )
}

function DaylightChart() {
  const { states } = useHA()
  const sunEntity   = states['sun.sun']
  const { history, loading } = useHistory(['sun.sun'], 192) // 8 days

  const sunSnapshots = history?.['sun.sun'] ?? []

  // Extract rise/set transitions from recorder history
  const events = []
  let prevState = null
  for (const snap of sunSnapshots) {
    const state = snap.s ?? snap.state
    const ts    = snap.lu != null
      ? snap.lu * 1000
      : new Date(snap.last_changed ?? snap.last_updated).getTime()
    if (prevState === 'below_horizon' && state === 'above_horizon') events.push({ type: 'rise', ts })
    else if (prevState === 'above_horizon' && state === 'below_horizon') events.push({ type: 'set', ts })
    prevState = state
  }

  // Append next rise/set from live state attributes (covers today/tomorrow gaps)
  const nextRising  = sunEntity?.attributes?.next_rising
  const nextSetting = sunEntity?.attributes?.next_setting
  if (nextRising)  events.push({ type: 'rise', ts: new Date(nextRising).getTime() })
  if (nextSetting) events.push({ type: 'set',  ts: new Date(nextSetting).getTime() })

  // Group by calendar day
  const dayMap = new Map()
  for (const ev of events) {
    const d   = new Date(ev.ts)
    const key = `${d.getMonth()}-${d.getDate()}`
    if (!dayMap.has(key)) {
      dayMap.set(key, {
        sortKey: ev.ts,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      })
    }
    const hour = d.getHours() + d.getMinutes() / 60
    if (ev.type === 'rise') dayMap.get(key).sunrise = hour
    else                    dayMap.get(key).sunset  = hour
  }

  const chartData = Array.from(dayMap.values())
    .filter(d => d.sunrise != null && d.sunset != null)
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(-7)
    .map(d => ({
      day:        d.day,
      dark:       parseFloat(d.sunrise.toFixed(2)),
      daylight:   parseFloat((d.sunset - d.sunrise).toFixed(2)),
      sunriseRaw: d.sunrise,
      sunsetRaw:  d.sunset,
    }))

  if (loading || chartData.length === 0) return null

  return (
    <ForecastBarCard title="Sunrise & Sunset · Daylight Hours" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
        <XAxis dataKey="day" tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis
          domain={[4, 22]}
          ticks={[6, 9, 12, 15, 18, 21]}
          tick={<DaylightYTick />}
          tickLine={false}
          axisLine={false}
          width={42}
        />
        <Tooltip content={<DaylightTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="dark"     stackId="sun" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="daylight" stackId="sun" fill="#fbbf24"     radius={[3, 3, 3, 3]} opacity={0.85} isAnimationActive={false}>
          <LabelList
            dataKey="daylight"
            position="inside"
            style={{ fill: '#78350f', fontSize: 9, fontFamily: 'system-ui', fontWeight: '600' }}
            formatter={v => {
              const h = Math.floor(v)
              const m = Math.round((v - h) * 60)
              return `${h}h${m > 0 ? ` ${m}m` : ''}`
            }}
          />
        </Bar>
      </BarChart>
    </ForecastBarCard>
  )
}

// ── Weather tab ───────────────────────────────────────────────────────

export function WeatherTab() {
  const { states, callService, connectionStatus } = useHA()
  const [forecast, setForecast] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchForecast = useCallback(async () => {
    try {
      const result = await callService(
        'weather', 'get_forecasts',
        { entity_id: 'weather.openweathermap', type: 'daily' },
        { returnResponse: true }
      )
      const entries = result?.response?.['weather.openweathermap']?.forecast || []
      setForecast(entries.slice(0, 7))
      setError(null)
    } catch (e) {
      // Fall back to attributes.forecast for older HA versions
      const attr = states['weather.openweathermap']?.attributes?.forecast
      if (attr?.length) {
        setForecast(attr.slice(0, 7))
        setError(null)
      } else {
        setError('Could not load forecast data')
      }
    } finally {
      setLoading(false)
    }
  }, [callService, states])

  useEffect(() => {
    if (connectionStatus !== 'authenticated') return
    fetchForecast()
    const interval = setInterval(fetchForecast, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [connectionStatus, fetchForecast])

  const weatherEntity = states['weather.openweathermap']
  const sunEntity     = states['sun.sun']
  const currentTemp   = states['sensor.openweathermap_temperature']
  const currentHum    = states['sensor.openweathermap_humidity']
  const windSpeed     = states['sensor.openweathermap_wind_speed']

  if (loading && forecast.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        {connectionStatus !== 'authenticated' ? 'Connecting…' : 'Loading forecast…'}
      </div>
    )
  }

  if (error && forecast.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        {error}
      </div>
    )
  }

  const selectedEntry = forecast[selectedIdx] ?? null

  const highLowData = forecast.map((entry, i) => {
    const d = parseForecastDate(entry.datetime)
    return {
      day:  i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      high: Math.round(entry.temperature),
      low:  Math.round(entry.templow ?? entry.temperature - 10),
    }
  })

  const precipData = forecast.map((entry, i) => {
    const d = parseForecastDate(entry.datetime)
    return {
      day:    i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      precip: entry.precipitation_probability ?? 0,
    }
  })

  const allLows  = highLowData.map(d => d.low)
  const allHighs = highLowData.map(d => d.high)
  const yMin = allLows.length  ? Math.min(...allLows)  - 5 : 40
  const yMax = allHighs.length ? Math.max(...allHighs) + 5 : 100

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Current conditions card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌤️</span>
            <span className="font-semibold text-base">7-Day Forecast</span>
          </div>
          {currentTemp && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {currentTemp.state && (
                <span>{roundSensor(currentTemp.state)}{currentTemp.attributes?.unit_of_measurement}</span>
              )}
              {currentHum && <span>💧 {roundSensor(currentHum.state)}%</span>}
              {windSpeed && <span>💨 {roundSensor(windSpeed.state)} {windSpeed.attributes?.unit_of_measurement}</span>}
            </div>
          )}
        </div>

        {/* Day grid */}
        <div className="flex px-2 pb-2 overflow-x-auto gap-1">
          {forecast.map((entry, i) => (
            <DayColumn
              key={entry.datetime}
              entry={entry}
              index={i}
              selected={selectedIdx}
              onClick={() => setSelectedIdx(i)}
            />
          ))}
        </div>

        {/* Selected day detail */}
        <DetailPanel entry={selectedEntry} sunEntity={sunEntity} />
      </div>

      {/* Compact current conditions strip */}
      {weatherEntity && (() => {
        const feelsLike = weatherEntity.attributes?.apparent_temperature != null
          ? Math.round(weatherEntity.attributes.apparent_temperature)
          : states['sensor.openweathermap_feels_like']?.state
            ? roundSensor(states['sensor.openweathermap_feels_like'].state)
            : null
        const visibility = weatherEntity.attributes?.visibility != null
          ? `${round(weatherEntity.attributes.visibility)} ${weatherEntity.attributes?.visibility_unit || 'mi'}`
          : states['sensor.openweathermap_visibility']?.state
            ? `${states['sensor.openweathermap_visibility'].state} ${states['sensor.openweathermap_visibility'].attributes?.unit_of_measurement}`
            : null
        return (
          <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
            <span className="font-semibold text-foreground">
              {conditionIcon(weatherEntity.state)} {conditionLabel(weatherEntity.state)}
            </span>
            {currentTemp && (
              <span className="text-muted-foreground">
                {roundSensor(currentTemp.state)}°F{feelsLike != null ? ` · feels ${feelsLike}°` : ''}
              </span>
            )}
            {currentHum && <span className="text-muted-foreground">💧 {roundSensor(currentHum.state)}%</span>}
            {windSpeed && <span className="text-muted-foreground">💨 {roundSensor(windSpeed.state)} {windSpeed.attributes?.unit_of_measurement}</span>}
            {visibility && <span className="text-muted-foreground">👁 {visibility}</span>}
          </div>
        )
      })()}

      {/* 24h history charts */}
      <div className="grid grid-cols-2 gap-4">
        <TemperatureChart
          title="Temperature · Last 24h"
          series={TEMP_SERIES}
          height={180}
          unit="°F"
        />
        <TemperatureChart
          title="Humidity · Last 24h"
          series={HUMIDITY_SERIES}
          height={180}
          unit="%"
        />
      </div>

      {/* 7-day forecast bar charts */}
      {forecast.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <ForecastBarCard title="7-Day High / Low  °F" height={180}>
            <BarChart data={highLowData} margin={{ top: 18, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
              <XAxis dataKey="day" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis domain={[yMin, yMax]} tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={v => `${v}°`} width={36} />
              <Tooltip content={<BarChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, color: '#9ca3af' }} iconType="circle" iconSize={8} />
              <Bar dataKey="high" name="High" fill="#f97316" radius={[3, 3, 0, 0]} unit="°">
                <LabelList dataKey="high" position="top" style={{ fill: '#f97316', fontSize: 10, fontFamily: 'system-ui' }} formatter={v => `${v}°`} />
              </Bar>
              <Bar dataKey="low" name="Low" fill="#60a5fa" radius={[3, 3, 0, 0]} unit="°">
                <LabelList dataKey="low" position="top" style={{ fill: '#60a5fa', fontSize: 10, fontFamily: 'system-ui' }} formatter={v => `${v}°`} />
              </Bar>
            </BarChart>
          </ForecastBarCard>

          <ForecastBarCard title="7-Day Precipitation Chance" height={180}>
            <BarChart data={precipData} margin={{ top: 18, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
              <XAxis dataKey="day" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={36} />
              <Tooltip content={<BarChartTooltip />} />
              <Bar dataKey="precip" name="Precip. %" radius={[3, 3, 0, 0]} unit="%">
                {precipData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.precip >= 70 ? '#3b82f6' : entry.precip >= 40 ? '#60a5fa' : '#93c5fd'}
                  />
                ))}
                <LabelList dataKey="precip" position="top" style={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'system-ui' }} formatter={v => v > 0 ? `${v}%` : ''} />
              </Bar>
            </BarChart>
          </ForecastBarCard>
        </div>
      )}

      {/* Sunrise / sunset daylight chart */}
      <DaylightChart />
    </div>
  )
}
