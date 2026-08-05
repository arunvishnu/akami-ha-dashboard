import { Lightbulb, Power, Fan, Music2, Blinds } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { ROOMS, FLOORS } from '../../layout'
import { Card } from '../ui/card'
import { Switch } from '../ui/switch'
import { cn } from '../../lib/utils'

const FLOOR_ORDER = ['first_floor', 'second_floor', 'outdoor', 'basement']
const OFFABLE_DOMAINS = ['light', 'switch', 'fan']

const DOMAIN_ICONS = {
  light:        Lightbulb,
  switch:       Power,
  fan:          Fan,
  media_player: Music2,
  cover:        Blinds,
}

function collectActiveEntities(states) {
  const entities = []

  for (const [roomId, room] of Object.entries(ROOMS)) {
    const { lights = [], switches = [], fan, media, covers = [] } = room.entities

    lights.forEach(id => { if (states[id]?.state === 'on') entities.push({ id, domain: 'light', roomId, room }) })
    switches.forEach(id => { if (states[id]?.state === 'on') entities.push({ id, domain: 'switch', roomId, room }) })
    if (fan && states[fan]?.state === 'on') entities.push({ id: fan, domain: 'fan', roomId, room })
    if (media && ['playing', 'paused'].includes(states[media]?.state)) entities.push({ id: media, domain: 'media_player', roomId, room })
    covers.forEach(id => { if (states[id]?.state === 'open') entities.push({ id, domain: 'cover', roomId, room }) })
  }

  return entities
}

function ActiveEntityCard({ entry, states, callService }) {
  const { id, domain, room } = entry
  const Icon = DOMAIN_ICONS[domain]
  const name = states[id]?.attributes?.friendly_name || room.label
  const isToggleable = OFFABLE_DOMAINS.includes(domain)

  const toggle = () => {
    if (!isToggleable) return
    callService(domain, 'turn_off', { entity_id: id })
  }

  return (
    <Card
      onClick={toggle}
      className={cn(
        'flex items-center gap-3 px-3 py-3 select-none transition-colors border-on/40 bg-on/5',
        isToggleable && 'cursor-pointer hover:bg-secondary/60 active:scale-[0.98]'
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-on/15 text-on">
        {Icon && <Icon size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight truncate">{name}</div>
        <div className="text-[11px] text-muted-foreground truncate">{room.label}</div>
      </div>
      {isToggleable && <Switch checked={true} onCheckedChange={toggle} />}
    </Card>
  )
}

export function ActiveTab() {
  const { states, callService } = useHA()
  const entities = collectActiveEntities(states)
  const totalCount = entities.length

  const turnOffAll = () => {
    entities.forEach(({ id, domain }) => {
      if (OFFABLE_DOMAINS.includes(domain)) callService(domain, 'turn_off', { entity_id: id })
    })
  }

  const floors = FLOOR_ORDER
    .map(id => FLOORS.find(f => f.id === id))
    .filter(Boolean)
    .map(floor => ({
      ...floor,
      entries: entities.filter(e => e.room.floor === floor.id),
    }))
    .filter(floor => floor.entries.length > 0)

  return (
    <div className="p-4 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {totalCount === 0 ? 'Nothing on' : `${totalCount} ${totalCount === 1 ? 'thing' : 'things'} on`}
        </h2>
        {totalCount > 0 && (
          <button
            onClick={turnOffAll}
            className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 transition-colors"
          >
            Turn Off All
          </button>
        )}
      </div>

      {totalCount === 0 && (
        <div className="text-sm text-muted-foreground text-center py-16">
          Everything's off ✨
        </div>
      )}

      {floors.map((floor) => (
        <section key={floor.id}>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <span>{floor.icon}</span>
            <span>{floor.label}</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {floor.entries.map((entry) => (
              <ActiveEntityCard key={entry.id} entry={entry} states={states} callService={callService} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
