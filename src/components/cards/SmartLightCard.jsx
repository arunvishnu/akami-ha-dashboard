import { useHA } from '../../hooks/useHA'
import { HueLightCard } from './HueLightCard'
import { WledLightCard } from './WledLightCard'
import { ColorLightCard } from './ColorLightCard'
import { DimmableLightCard } from './DimmableLightCard'
import { SimpleLightCard } from './SimpleLightCard'

export function detectLightType(entity) {
  if (!entity) return 'simple'
  const modes      = entity.attributes?.supported_color_modes ?? []
  const effectList = entity.attributes?.effect_list ?? []

  // WLED: rgb-only + large effect library (100+)
  if (modes.includes('rgb') && !modes.includes('color_temp') && effectList.length > 20) {
    return 'wled'
  }
  // Hue: color_temp + xy (Hue-specific combination)
  if (modes.includes('color_temp') && modes.includes('xy')) {
    return 'hue'
  }
  // Generic color/ct light (Govee, Tuya, etc.)
  if (modes.includes('color_temp') || modes.includes('rgb')) {
    return 'color'
  }
  // Brightness only (fan lights, dimmers)
  if (modes.includes('brightness')) {
    return 'dimmable'
  }
  // Switch-controlled or unknown
  return 'simple'
}

const CARD_MAP = {
  hue:      HueLightCard,
  wled:     WledLightCard,
  color:    ColorLightCard,
  dimmable: DimmableLightCard,
  simple:   SimpleLightCard,
}

export function SmartLightCard({ entityId, label, forceType }) {
  const { states } = useHA()
  const entity = states[entityId]
  const type   = forceType ?? detectLightType(entity)
  const Card   = CARD_MAP[type] ?? SimpleLightCard
  return <Card entityId={entityId} label={label} />
}
