import { Lightbulb } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { BrightnessDial } from './BrightnessDial'
import { cn } from '../../lib/utils'

const ACCENT = '#fbbf24'

export function DimmableLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity    = states[entityId]
  const name      = label || entity?.attributes?.friendly_name || entityId
  const isOn      = entity?.state === 'on'
  const brightness = entity?.attributes?.brightness != null
    ? Math.round((entity.attributes.brightness / 255) * 100) : 0

  const toggle = () => callService('light', 'toggle', { entity_id: entityId })
  const commit = (pct) => callService('light', 'turn_on', { entity_id: entityId, brightness_pct: Math.max(1, Math.min(100, pct)) })

  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-300',
      isOn
        ? 'bg-amber-950/30 border-amber-500/20'
        : 'bg-zinc-900/80 border-white/8'
    )}>
      <BrightnessDial
        brightness={brightness}
        isOn={isOn}
        color={ACCENT}
        icon={Lightbulb}
        step={10}
        onToggle={toggle}
        onCommit={commit}
      />

      <div className="text-center">
        <div className="text-sm font-semibold">{name}</div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-amber-400/70' : 'text-muted-foreground/50')}>
          {isOn ? `${brightness}%` : 'Light is off'}
        </div>
      </div>
    </div>
  )
}
