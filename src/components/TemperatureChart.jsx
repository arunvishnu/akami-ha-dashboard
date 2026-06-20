import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { useHistory } from '../hooks/useHistory'

// ── Config ─────────────────────────────────────────────────────────────

const ENTITIES = [
  { id: 'sensor.openweathermap_temperature', key: 'outdoor', label: 'Outdoor',    color: '#60a5fa', getValue: s => parseFloat(s.state) },
  { id: 'climate.first_floor',               key: 'floor1',  label: '1st Floor',  color: '#f97316', getValue: s => s.attributes?.current_temperature },
  { id: 'climate.second_floor',              key: 'floor2',  label: '2nd Floor',  color: '#a855f7', getValue: s => s.attributes?.current_temperature },
]

const BUCKET_MS   = 15 * 60 * 1000  // 15-minute buckets

// ── Data processing ────────────────────────────────────────────────────
// WS history format: { [entity_id]: [{ s, a, lu }, ...] }
// lu = last_updated as Unix seconds (float)

function bucket(snapshots, getValue) {
  const map = {}
  for (const snap of snapshots) {
    // WS format uses lu (seconds) and s/a; REST format uses last_changed and state/attributes
    const ts = snap.lu != null
      ? snap.lu * 1000
      : new Date(snap.last_changed ?? snap.last_updated).getTime()
    const v = getValue(snap)
    if (v == null || isNaN(v)) continue
    const t = Math.floor(ts / BUCKET_MS) * BUCKET_MS
    map[t] = parseFloat(parseFloat(v).toFixed(1))
  }
  return map
}

function buildChartData(history) {
  // history is a dict: { entity_id: [...snapshots] }
  const buckets = {}
  for (const entity of ENTITIES) {
    // WS format uses s/a; adapt getValue to handle both formats
    const snapshots = history?.[entity.id] ?? []
    const adapted = snapshots.map(snap => ({
      ...snap,
      state:      snap.s ?? snap.state,
      attributes: snap.a ?? snap.attributes ?? {},
    }))
    buckets[entity.key] = bucket(adapted, entity.getValue)
  }

  const allTimes = new Set(
    Object.values(buckets).flatMap(b => Object.keys(b).map(Number))
  )

  return Array.from(allTimes)
    .sort((a, b) => a - b)
    .map(t => ({
      time:    t,
      outdoor: buckets.outdoor[t],
      floor1:  buckets.floor1[t],
      floor2:  buckets.floor2[t],
    }))
}

// ── Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = new Date(label)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1.5">{date} · {time}</div>
      {payload.map(p => p.value != null && (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground w-20">{p.name}</span>
          <span className="font-semibold tabular-nums">{p.value}°F</span>
        </div>
      ))}
    </div>
  )
}

// ── X-axis tick ────────────────────────────────────────────────────────

function timeTick({ x, y, payload }) {
  const d = new Date(payload.value)
  const label = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
  return (
    <text x={x} y={y + 12} textAnchor="middle" fill="#6b7280" fontSize={11} fontFamily="system-ui">
      {label}
    </text>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="h-64 bg-card border border-border rounded-xl flex items-center justify-center">
      <div className="text-xs text-muted-foreground animate-pulse">Loading history…</div>
    </div>
  )
}

// ── TemperatureChart ───────────────────────────────────────────────────

export function TemperatureChart() {
  const entityIds = ENTITIES.map(e => e.id)
  const { history, loading, error } = useHistory(entityIds, 24)

  if (loading) return <ChartSkeleton />
  if (error)   return (
    <div className="h-24 bg-card border border-border rounded-xl flex items-center justify-center">
      <span className="text-xs text-muted-foreground">History unavailable: {error.message}</span>
    </div>
  )

  const data = buildChartData(history ?? [])

  return (
    <div className="bg-card border border-border rounded-xl px-4 pt-4 pb-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Temperature · Last 24 Hours
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />

          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tick={timeTick}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickCount={8}
          />

          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={v => `${v}°`}
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'system-ui' }}
            tickLine={false}
            axisLine={false}
            width={36}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 12, color: '#9ca3af' }}
            iconType="circle"
            iconSize={8}
          />

          {ENTITIES.map(e => (
            <Line
              key={e.key}
              dataKey={e.key}
              name={e.label}
              stroke={e.color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
