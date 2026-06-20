import { FLOORS } from '../layout'
import { cn } from '../lib/utils'

export function TabBar({ active, onChange }) {
  return (
    <nav className="flex items-center gap-1 bg-muted/40 border-b border-border px-2 py-1.5 shrink-0 overflow-x-auto">
      {FLOORS.map((floor) => (
        <button
          key={floor.id}
          onClick={() => onChange(floor.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap rounded-md transition-all duration-150 outline-none',
            active === floor.id
              ? 'bg-background text-foreground font-semibold shadow-sm border border-on/40'
              : 'font-medium text-muted-foreground hover:text-foreground hover:bg-background/60'
          )}
        >
          <span className="text-base leading-none">{floor.icon}</span>
          <span>{floor.label}</span>
        </button>
      ))}
    </nav>
  )
}
