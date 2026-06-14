import { useState, useMemo, useEffect, useRef } from 'react'
import { useHA } from '../hooks/useHA'

const DOMAIN_LABELS = {
  light: 'Lights',
  switch: 'Switches',
  sensor: 'Sensors',
  binary_sensor: 'Binary Sensors',
  climate: 'Climate',
  media_player: 'Media',
  cover: 'Covers',
  fan: 'Fans',
  lock: 'Locks',
  input_boolean: 'Input Booleans',
  automation: 'Automations',
  script: 'Scripts',
  scene: 'Scenes',
  camera: 'Cameras',
  person: 'People',
  device_tracker: 'Trackers',
  weather: 'Weather',
  sun: 'Sun',
  number: 'Numbers',
  select: 'Selects',
  input_select: 'Input Selects',
  input_number: 'Input Numbers',
  input_text: 'Input Text',
  timer: 'Timers',
  counter: 'Counters',
  zone: 'Zones',
  update: 'Updates',
}

const DOMAIN_ICON = {
  light: '💡', switch: '🔌', sensor: '📊', binary_sensor: '🔘',
  climate: '🌡️', media_player: '📺', cover: '🚪', fan: '🌀',
  lock: '🔒', input_boolean: '🔘', automation: '⚡', script: '📜',
  scene: '🎭', camera: '📷', person: '👤', device_tracker: '📍',
  weather: '🌤️', sun: '☀️', number: '🔢', update: '🔄',
}

// Domains that are rarely useful on a dashboard
const HIDDEN_DOMAINS = new Set(['persistent_notification', 'conversation', 'tts', 'stt'])

export function EntityBrowser({ onAdd, onClose, existingEntityIds }) {
  const { states } = useHA()
  const [search, setSearch] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('all')
  const searchRef = useRef(null)

  useEffect(() => {
    searchRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const { domains, filtered } = useMemo(() => {
    const allEntities = Object.values(states).filter(
      (e) => !HIDDEN_DOMAINS.has(e.entity_id.split('.')[0])
    )

    const domainSet = {}
    allEntities.forEach((e) => {
      const d = e.entity_id.split('.')[0]
      domainSet[d] = (domainSet[d] || 0) + 1
    })

    const q = search.toLowerCase()
    const filtered = allEntities
      .filter((e) => {
        const domain = e.entity_id.split('.')[0]
        if (selectedDomain !== 'all' && domain !== selectedDomain) return false
        if (q) {
          const name = (e.attributes?.friendly_name || '').toLowerCase()
          return e.entity_id.toLowerCase().includes(q) || name.includes(q)
        }
        return true
      })
      .sort((a, b) => {
        const na = a.attributes?.friendly_name || a.entity_id
        const nb = b.attributes?.friendly_name || b.entity_id
        return na.localeCompare(nb)
      })

    return { domains: domainSet, filtered }
  }, [states, search, selectedDomain])

  const existingSet = new Set(existingEntityIds)

  return (
    <div className="browser-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="browser-panel">
        <div className="browser-header">
          <h2 className="browser-title">Add Entity</h2>
          <button className="browser-close" onClick={onClose}>✕</button>
        </div>

        <div className="browser-search-row">
          <input
            ref={searchRef}
            type="text"
            className="browser-search"
            placeholder="Search by name or entity ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="browser-domains">
          <button
            className={`domain-chip ${selectedDomain === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedDomain('all')}
          >
            All <span className="domain-count">{Object.values(domains).reduce((a, b) => a + b, 0)}</span>
          </button>
          {Object.entries(domains)
            .sort(([a], [b]) => (DOMAIN_LABELS[a] || a).localeCompare(DOMAIN_LABELS[b] || b))
            .map(([domain, count]) => (
              <button
                key={domain}
                className={`domain-chip ${selectedDomain === domain ? 'active' : ''}`}
                onClick={() => setSelectedDomain(domain)}
              >
                {DOMAIN_ICON[domain] || '🔘'} {DOMAIN_LABELS[domain] || domain}{' '}
                <span className="domain-count">{count}</span>
              </button>
            ))}
        </div>

        <div className="browser-list">
          {filtered.length === 0 && (
            <div className="browser-empty">No entities match "{search}"</div>
          )}
          {filtered.map((entity) => {
            const domain = entity.entity_id.split('.')[0]
            const name = entity.attributes?.friendly_name || entity.entity_id
            const alreadyAdded = existingSet.has(entity.entity_id)
            const unit = entity.attributes?.unit_of_measurement
            const stateDisplay = unit ? `${entity.state} ${unit}` : entity.state

            return (
              <div
                key={entity.entity_id}
                className={`browser-row ${alreadyAdded ? 'already-added' : ''}`}
                onClick={() => !alreadyAdded && onAdd(entity)}
              >
                <span className="browser-row-icon">{DOMAIN_ICON[domain] || '🔘'}</span>
                <div className="browser-row-info">
                  <div className="browser-row-name">{name}</div>
                  <div className="browser-row-id">{entity.entity_id}</div>
                </div>
                <div className="browser-row-right">
                  <span className="browser-row-state">{stateDisplay}</span>
                  {alreadyAdded
                    ? <span className="browser-row-badge added">Added</span>
                    : <span className="browser-row-badge add">+ Add</span>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
