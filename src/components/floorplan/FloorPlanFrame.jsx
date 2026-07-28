import { cn } from '../../lib/utils'

export function FloorPlanFrame({ viewBox, tilted, onToggle, maxHeight = '68vh', children }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-xs font-medium">
          <button
            onClick={() => onToggle(true)}
            className={cn('px-3 py-1 rounded-md transition-colors', tilted ? 'bg-secondary text-foreground' : 'text-muted-foreground')}
          >
            3D
          </button>
          <button
            onClick={() => onToggle(false)}
            className={cn('px-3 py-1 rounded-md transition-colors', !tilted ? 'bg-secondary text-foreground' : 'text-muted-foreground')}
          >
            Flat
          </button>
        </div>
      </div>

      <div className={cn('rounded-xl overflow-visible', tilted ? 'floorplan-tilt-stage' : 'border border-border bg-card overflow-hidden')}>
        <svg
          viewBox={viewBox}
          className={cn('w-full select-none floorplan-tilt-svg', !tilted && 'floorplan-tilt-svg--flat', tilted ? 'rounded-xl bg-card' : '')}
          style={{ maxHeight }}
        >
          {children}
        </svg>
      </div>
    </div>
  )
}
