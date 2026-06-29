import { Lightbulb } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { CardPowerButton } from './CardPowerButton'
import { CardDeviceIcon } from './CardDeviceIcon'
import { cn } from '../../lib/utils'

const ACCENT = '#fbbf24'

export function SimpleLightCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity = states[entityId]
  const domain = entityId?.split('.')[0]
  const name   = label || entity?.attributes?.friendly_name || entityId
  const isOn   = entity?.state === 'on'

  const toggle = () => callService(domain, 'toggle', { entity_id: entityId })

  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-4 transition-all duration-300',
      isOn
        ? 'bg-amber-950/30 border-amber-500/20'
        : 'bg-zinc-900/80 border-white/8'
    )}>
      {/* Icon */}
      <CardDeviceIcon icon={Lightbulb} isOn={isOn} color={ACCENT} />

      {/* Name + status */}
      <div className="text-center">
        <div className="text-sm font-semibold">{name}</div>
        <div className={cn('text-xs mt-0.5', isOn ? 'text-amber-400/70' : 'text-muted-foreground/40')}>
          {isOn ? 'On' : 'Off'}
        </div>
      </div>

      {/* Power button */}
      <div className="flex justify-center pt-1">
        <CardPowerButton isOn={isOn} onClick={toggle} color={ACCENT} />
      </div>
    </div>
  )
}
