import { useState } from 'react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useHA } from '../hooks/useHA'
import { EntityCard } from './EntityCard'
import { LightCard } from './LightCard'
import { ClimateCard } from './ClimateCard'
import { MediaCard } from './MediaCard'
import { EntityBrowser } from './EntityBrowser'

const CARD_COMPONENTS = {
  light: LightCard,
  climate: ClimateCard,
  media_player: MediaCard,
}

function inferCardType(entityId) {
  return entityId?.split('.')[0] || 'default'
}

function CardWrapper({ card }) {
  const domain = inferCardType(card.entityId)
  const Component = CARD_COMPONENTS[domain] || EntityCard
  return <Component entityId={card.entityId} label={card.label} />
}

// Default layout — user can drag/resize; layout is saved to localStorage
const DEFAULT_CARDS = [
  { i: 'card-1', entityId: 'sun.sun', label: 'Sun', x: 0, y: 0, w: 2, h: 2 },
  { i: 'card-2', entityId: 'sensor.date', label: 'Date', x: 2, y: 0, w: 2, h: 2 },
]

function loadLayout() {
  try {
    const saved = localStorage.getItem('ha_dashboard_layout')
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

function saveLayout(cards, layout) {
  const merged = cards.map((card) => {
    const pos = layout.find((l) => l.i === card.i)
    return pos ? { ...card, x: pos.x, y: pos.y, w: pos.w, h: pos.h } : card
  })
  localStorage.setItem('ha_dashboard_layout', JSON.stringify(merged))
  return merged
}

export function Dashboard({ onReset }) {
  const { states, connectionStatus } = useHA()
  const [cards, setCards] = useState(() => loadLayout() || DEFAULT_CARDS)
  const [editMode, setEditMode] = useState(false)
  const [browserOpen, setBrowserOpen] = useState(false)

  const layout = cards.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))

  const onLayoutChange = (newLayout) => {
    if (!editMode) return
    const merged = saveLayout(cards, newLayout)
    setCards(merged)
  }

  const addCard = (entity) => {
    const newCard = {
      i: `card-${Date.now()}`,
      entityId: entity.entity_id,
      label: entity.attributes?.friendly_name || entity.entity_id,
      x: 0, y: Infinity, w: 2, h: 2,
    }
    const updated = [...cards, newCard]
    setCards(updated)
    localStorage.setItem('ha_dashboard_layout', JSON.stringify(updated))
  }

  const removeCard = (cardId) => {
    const updated = cards.filter((c) => c.i !== cardId)
    setCards(updated)
    localStorage.setItem('ha_dashboard_layout', JSON.stringify(updated))
  }

  const statusDot = {
    authenticated: 'status-ok',
    connecting: 'status-connecting',
    error: 'status-error',
  }[connectionStatus]

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <span className={`status-dot ${statusDot}`} title={connectionStatus} />
          <h1 className="dashboard-title">Home</h1>
        </div>
        <div className="header-actions">
          {editMode && (
            <button className="header-btn" onClick={() => setBrowserOpen(true)}>
              + Add Card
            </button>
          )}
          <button
            className={`header-btn ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
          <button className="header-btn subtle" onClick={onReset}>⚙️</button>
        </div>
      </header>

      {browserOpen && (
        <EntityBrowser
          onAdd={addCard}
          onClose={() => setBrowserOpen(false)}
          existingEntityIds={cards.map((c) => c.entityId)}
        />
      )}

      <main className="dashboard-main">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={80}
          width={window.innerWidth - 48}
          onLayoutChange={onLayoutChange}
          isDraggable={editMode}
          isResizable={editMode}
          margin={[12, 12]}
          containerPadding={[0, 0]}
        >
          {cards.map((card) => (
            <div key={card.i} className="grid-item">
              {editMode && (
                <button
                  className="remove-btn"
                  onClick={() => removeCard(card.i)}
                  title="Remove"
                >
                  ✕
                </button>
              )}
              <CardWrapper card={card} />
            </div>
          ))}
        </GridLayout>
      </main>
    </div>
  )
}
