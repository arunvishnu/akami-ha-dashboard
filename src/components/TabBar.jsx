import { FLOORS } from '../layout'
import { cn } from '../lib/utils'

export function TabBar({ active, onChange }) {
  return (
    <nav className="flex border-b border-border bg-background px-1 shrink-0 overflow-x-auto">
      {FLOORS.map((floor) => (
        <button
          key={floor.id}
          onClick={() => onChange(floor.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap',
            'border-b-2 -mb-px transition-colors',
            active === floor.id
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <span>{floor.icon}</span>
          <span>{floor.label}</span>
        </button>
      ))}
    </nav>
  )
}
