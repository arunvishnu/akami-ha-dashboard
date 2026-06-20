import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { useHistory } from '../hooks/useHistory'

// ── Data processing ────────────────────────────────────────────────────

const BUCKET_MS = 15 * 60 * 1000

function bucket(snapshots, getValue) {
  const map = {}
  for (const snap of snapshots) {
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

function buildChartData(history, series) {
  const buckets = {}
  for (const s of series) {
    const snapshots = history?.[s.id] ?? []
    const adapted = snapshots.map(snap => ({
      ...snap,
      state:      snap.s ?? snap.state,
      attributes: snap.a ?? snap.attributes ?? {},
    }))
    buckets[s.key] = bucket(adapted, s.getValue)
  }

  const allTimes = new Set(
    Object.values(buckets).flatMap(b => Object.keys(b).map(Number))
  )

  return Array.from(allTimes)
    .sort((a, b) => a - b)
    .map(t => {
      const pt = { time: t }
      for (const s of series) pt[s.key] = buckets[s.key]?.[t]
      return pt
    })
}

// ── Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, unit = '°F' }) {
  if (!active || !payload?.length) return null
  const d    = new Date(label)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1.5">{date} · {time}</div>
      {payload.map(p => p.value != null && (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground w-24">{p.name}</span>
          <span className="font-semibold tabular-nums">{p.value}{unit}</span>
        </div>
      ))}
    </div>
  )
}

function TimeTick({ x, y, payload }) {
  const label = new Date(payload.value).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
  return (
    <text x={x} y={y + 12} textAnchor="middle" fill="#6b7280" fontSize={11} fontFamily="system-ui">
      {label}
    </text>
  )
}

// ── Chart skeleton ─────────────────────────────────────────────────────

function Skeleton({ height = 240 }) {
  return (
    <div className="bg-card border border-border rounded-xl flex items-center justify-center" style={{ height }}>
      <div className="text-xs text-muted-foreground animate-pulse">Loading history…</div>
    </div>
  )
}

// ── TemperatureChart ───────────────────────────────────────────────────

/**
 * Generic temperature line chart.
 * series: Array<{ id, key, label, color, getValue: (snap) => number }>
 */
export function TemperatureChart({ title, series, hours = 24, height = 240, unit = '°F' }) {
  const yUnit = unit.startsWith('°') ? '°' : unit
  const entityIds = series.map(s => s.id)
  const { history, loading, error } = useHistory(entityIds, hours)

  if (loading) return <Skeleton height={height + 60} />
  if (error) return (
    <div className="bg-card border border-border rounded-xl flex items-center justify-center" style={{ height: height + 60 }}>
      <span className="text-xs text-muted-foreground">Unavailable: {error.message}</span>
    </div>
  )

  const data = buildChartData(history ?? {}, series)

  return (
    <div className="bg-card border border-border rounded-xl px-4 pt-4 pb-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {title}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <defs>
            {series.filter(s => s.area).map(s => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={s.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tick={<TimeTick />}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickCount={6}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={v => `${v}${yUnit}`}
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'system-ui' }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} unit={unit} />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 12, color: '#9ca3af' }}
            iconType="circle"
            iconSize={8}
          />
          {series.map(s => s.area ? (
            <Area
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
              type="monotone"
            />
          ) : (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
              type="monotone"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
