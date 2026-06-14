import { FLOORS } from '../layout'

export function TabBar({ active, onChange }) {
  return (
    <nav className="tab-bar">
      {FLOORS.map((floor) => (
        <button
          key={floor.id}
          className={`tab-btn ${active === floor.id ? 'active' : ''}`}
          onClick={() => onChange(floor.id)}
        >
          <span className="tab-icon">{floor.icon}</span>
          <span className="tab-label">{floor.label}</span>
        </button>
      ))}
    </nav>
  )
}
