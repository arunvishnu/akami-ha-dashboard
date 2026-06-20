import { useHA } from '../../hooks/useHA'
import { cn } from '../../lib/utils'
import { TemperatureChart } from '../TemperatureChart'

// ── Ring geometry ──────────────────────────────────────────────────────

const SZ = 260
const CX = SZ / 2, CY = SZ / 2
const R = 108          // dot radius
const N = 52           // number of dots
const DOT_R = 4        // dot radius
const START = 225      // degrees from 12-o'clock, clockwise (7:30 position)
const SWEEP = 270      // total arc span

function polar(deg) {
  const rad = (deg - 90) * Math.PI / 180
  return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)]
}

// Blue (#3b82f6) → Orange (#f97316) gradient across the arc
function dotColor(t) {
  const r = Math.round(59  + t * (249 - 59))
  const g = Math.round(130 + t * (115 - 130))
  const b = Math.round(246 + t * (22  - 246))
  return `rgb(${r},${g},${b})`
}

function tempToAngle(temp, mn, mx) {
  return START + Math.max(0, Math.min(1, (temp - mn) / (mx - mn))) * SWEEP
}

// ── Mode config ────────────────────────────────────────────────────────

const MODES = {
  heat:      { label: 'Heat', icon: '🔥', color: '#f97316' },
  cool:      { label: 'Cool', icon: '❄️', color: '#3b82f6' },
  heat_cool: { label: 'Auto', icon: '🔁', color: '#a855f7' },
  off:       { label: 'Off',  icon: '⏻',  color: '#525252' },
}

const ACTION_LABEL = {
  heating: 'HEATING', cooling: 'COOLING', idle: 'IDLE', off: 'OFF', fan: 'FAN',
}

// ── Dotted ring ────────────────────────────────────────────────────────

function DotRing({ target, targetHigh, targetLow, mode, action, minT, maxT, onDown, onUp, onLowDown, onLowUp, onHighDown, onHighUp }) {
  const isHeatCool = mode === 'heat_cool'
  const isOff = mode === 'off'

  const setAngle  = !isHeatCool && target    != null ? tempToAngle(target,    minT, maxT) : null
  const lowAngle  =  isHeatCool && targetLow != null ? tempToAngle(targetLow,  minT, maxT) : null
  const highAngle =  isHeatCool && targetHigh!= null ? tempToAngle(targetHigh, minT, maxT) : null

  const isHeating = action === 'heating'
  const isCooling = action === 'cooling'
  const isActive  = isHeating || isCooling

  const dots = Array.from({ length: N }, (_, i) => {
    const t   = i / (N - 1)
    const deg = START + t * SWEEP
    const [x, y] = polar(deg)

    let inZone = false
    if (isHeatCool) {
      inZone = lowAngle != null && highAngle != null && deg >= lowAngle && deg <= highAngle
    } else {
      inZone = setAngle != null && deg <= setAngle
    }

    // Active state: override dot color to solid action color
    let color
    if (isActive && inZone) {
      color = isHeating ? '#f97316' : '#3b82f6'
    } else {
      color = dotColor(t)
    }

    const opacity = isOff ? 0.12 : inZone ? 1 : 0.22

    return { x: x.toFixed(1), y: y.toFixed(1), color, opacity }
  })

  const actionColor = isHeating ? '#f97316' : isCooling ? '#3b82f6' : '#555'

  return (
    <div className="relative mx-auto" style={{ width: SZ, height: SZ }}>
      <svg width={SZ} height={SZ} className="absolute inset-0">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={DOT_R} fill={d.color} opacity={d.opacity} />
        ))}
        {/* Action label inside ring */}
        <text
          x={CX} y={CY - 50}
          textAnchor="middle" fontSize="10" fontFamily="system-ui"
          letterSpacing="0.14em" fontWeight={isActive ? '600' : '400'}
          fill={isActive ? actionColor : '#555'}
        >
          {ACTION_LABEL[action] || 'IDLE'}
        </text>
        {/* Min / max temp labels */}
        {(() => {
          const [lx, ly] = polar(START)
          const [rx, ry] = polar(START + SWEEP)
          return (
            <>
              <text x={lx} y={ly + 18} textAnchor="middle" fontSize="10" fill="#555" fontFamily="system-ui">{Math.round(minT)}°</text>
              <text x={rx} y={ry + 18} textAnchor="middle" fontSize="10" fill="#555" fontFamily="system-ui">{Math.round(maxT)}°</text>
            </>
          )
        })()}
      </svg>

      {/* Setpoint controls overlaid in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none">
        {!isHeatCool ? (
          <div className="flex items-center gap-4">
            <button
              onClick={onDown}
              className="h-10 w-10 rounded-full bg-secondary hover:bg-secondary/70 text-xl font-light flex items-center justify-center transition-colors"
            >
              −
            </button>
            <div className="text-[2.75rem] font-bold tabular-nums leading-none w-24 text-center">
              {target != null ? Math.round(target) : '--'}°
            </div>
            <button
              onClick={onUp}
              className="h-10 w-10 rounded-full bg-secondary hover:bg-secondary/70 text-xl font-light flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {[
              { label: 'Heat', color: 'text-orange-400', val: targetLow,  onMinus: onLowDown,  onPlus: onLowUp  },
              { label: 'Cool', color: 'text-blue-400',   val: targetHigh, onMinus: onHighDown, onPlus: onHighUp },
            ].map(({ label, color, val, onMinus, onPlus }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={cn('text-xs font-medium w-8', color)}>{label}</span>
                <button onClick={onMinus} className="h-7 w-7 rounded-full bg-secondary text-sm flex items-center justify-center">−</button>
                <span className="text-2xl font-bold tabular-nums w-12 text-center">{val != null ? Math.round(val) : '--'}°</span>
                <button onClick={onPlus}  className="h-7 w-7 rounded-full bg-secondary text-sm flex items-center justify-center">+</button>
              </div>
            ))}
          </div>
        )}
        <div className="text-xs text-muted-foreground tracking-wide mt-0.5">
          °Fahrenheit
        </div>
      </div>
    </div>
  )
}

// ── Climate card ───────────────────────────────────────────────────────

function ClimateCard({ entityId }) {
  const { states, callService } = useHA()
  const entity = states[entityId]
  if (!entity) return (
    <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-center text-muted-foreground text-sm">
      Connecting…
    </div>
  )

  const a            = entity.attributes || {}
  const mode         = entity.state
  const action       = a.hvac_action
  const current      = a.current_temperature
  const target       = a.temperature
  const targetHigh   = a.target_temp_high
  const targetLow    = a.target_temp_low
  const humidity     = a.current_humidity
  const fanMode      = a.fan_mode
  const presetMode   = a.preset_mode
  const hvacModes    = (a.hvac_modes || ['off', 'heat', 'cool', 'heat_cool']).filter(m => MODES[m])
  const presetModes  = a.preset_modes || []
  const minT         = a.min_temp ?? 45
  const maxT         = a.max_temp ?? 92
  const name         = a.friendly_name || entityId
  const isHeatCool   = mode === 'heat_cool'
  const isHeating    = action === 'heating'
  const isCooling    = action === 'cooling'
  const isActive     = isHeating || isCooling
  const actionColor  = isHeating ? 'text-orange-400' : isCooling ? 'text-blue-400' : 'text-muted-foreground'
  const actionBorder = isHeating ? '#f97316' : isCooling ? '#3b82f6' : undefined

  const svc = (service, data) => callService('climate', service, { entity_id: entityId, ...data })

  const setTemp  = (d) => svc('set_temperature', { temperature: Math.round((target ?? current ?? 70) + d) })
  const setLow   = (d) => svc('set_temperature', { target_temp_high: Math.round(targetHigh ?? 76), target_temp_low: Math.round((targetLow ?? 68) + d) })
  const setHigh  = (d) => svc('set_temperature', { target_temp_high: Math.round((targetHigh ?? 76) + d), target_temp_low: Math.round(targetLow ?? 68) })
  const setMode  = (m) => svc('set_hvac_mode',   { hvac_mode: m })
  const setFan   = (f) => svc('set_fan_mode',     { fan_mode: f })
  const setPreset = (p) => svc('set_preset_mode', { preset_mode: p })

  return (
    <div
      className="bg-card rounded-2xl p-5 flex flex-col gap-4 border transition-colors"
      style={{ borderColor: actionBorder ?? 'hsl(var(--border))' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Thermostat</div>
          <div className="text-base font-semibold mt-0.5">{name}</div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="text-4xl font-bold tabular-nums leading-none">
            {current != null ? Math.round(current) : '--'}°
          </div>
          {isActive ? (
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: `${actionBorder}22`, color: actionBorder }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: actionBorder }} />
              {isHeating ? 'Heating' : 'Cooling'}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              {action === 'off' ? 'Off' : 'Idle'}
            </div>
          )}
        </div>
      </div>

      {/* Dotted ring */}
      <DotRing
        target={target} targetHigh={targetHigh} targetLow={targetLow}
        mode={mode} action={action} minT={minT} maxT={maxT}
        onDown={() => setTemp(-1)} onUp={() => setTemp(+1)}
        onLowDown={() => setLow(-1)} onLowUp={() => setLow(+1)}
        onHighDown={() => setHigh(-1)} onHighUp={() => setHigh(+1)}
      />

      {/* Mode buttons */}
      <div className="grid grid-cols-4 gap-2">
        {hvacModes.map(m => {
          const cfg = MODES[m]
          const active = mode === m
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all',
                active ? 'bg-secondary' : 'bg-muted hover:bg-secondary/40'
              )}
              style={active ? { boxShadow: `inset 0 0 0 1px ${cfg.color}55` } : undefined}
            >
              <span className="text-lg leading-none">{cfg.icon}</span>
              <span className={cn('text-[11px] font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>
                {cfg.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Status chips + fan toggle */}
      <div className="flex gap-2 flex-wrap">
        {humidity != null && (
          <div className="flex items-center gap-1.5 bg-secondary/50 rounded-full px-3 py-1 text-xs text-muted-foreground">
            💧 {humidity}%
          </div>
        )}
        {fanMode && (
          <button
            onClick={() => setFan(fanMode === 'auto' ? 'on' : 'auto')}
            className="flex items-center gap-1.5 bg-secondary/50 hover:bg-secondary rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors"
          >
            🌀 Fan {fanMode}
          </button>
        )}
        {presetMode && (
          <div className="flex items-center gap-1.5 bg-secondary/50 rounded-full px-3 py-1 text-xs text-muted-foreground">
            🌿 {presetMode}
          </div>
        )}
      </div>

      {/* Preset pills */}
      {presetModes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {presetModes.map(p => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors capitalize',
                presetMode === p
                  ? 'bg-secondary text-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-secondary/50'
              )}
            >
              {p === 'away_indefinitely' ? 'Away ∞' : p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Chart series definitions ───────────────────────────────────────────

const fromState = s => parseFloat(s.state)
const fromAttr  = s => s.attributes?.current_temperature

const OVERVIEW_SERIES = [
  { id: 'sensor.openweathermap_temperature', key: 'outdoor', label: 'Outdoor',   color: '#60a5fa', getValue: fromState, area: true },
  { id: 'climate.first_floor',               key: 'floor1',  label: '1st Floor', color: '#f97316', getValue: fromAttr  },
  { id: 'climate.second_floor',              key: 'floor2',  label: '2nd Floor', color: '#a855f7', getValue: fromAttr  },
]

const FLOOR1_SERIES = [
  { id: 'climate.first_floor',            key: 'thermo',      label: 'Thermostat',  color: '#f97316', getValue: fromAttr,  area: true },
  { id: 'sensor.family_room_temperature', key: 'family_room', label: 'Family Room', color: '#34d399', getValue: fromState },
]

const FLOOR2_SERIES = [
  { id: 'climate.second_floor',              key: 'thermo', label: 'Thermostat',       color: '#a855f7', getValue: fromAttr,  area: true },
  { id: 'sensor.akshit_bedroom_temperature', key: 'akshit', label: "Akshit's Bedroom", color: '#60a5fa', getValue: fromState },
  { id: 'sensor.ami_bedroom_temperature',    key: 'ami',    label: "Ami's Bedroom",    color: '#f472b6', getValue: fromState },
  { id: 'sensor.arun_office_temperature',    key: 'office', label: 'Office',           color: '#facc15', getValue: fromState },
]

// ── Climate tab ────────────────────────────────────────────────────────

export function ClimateTab() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ClimateCard entityId="climate.first_floor" />
        <ClimateCard entityId="climate.second_floor" />
      </div>

      <TemperatureChart
        title="Temperature · Last 24 Hours"
        series={OVERVIEW_SERIES}
        height={220}
      />

      <div className="grid grid-cols-2 gap-4">
        <TemperatureChart
          title="1st Floor · Rooms vs Thermostat"
          series={FLOOR1_SERIES}
          height={200}
        />
        <TemperatureChart
          title="2nd Floor · Rooms vs Thermostat"
          series={FLOOR2_SERIES}
          height={200}
        />
      </div>
    </div>
  )
}
