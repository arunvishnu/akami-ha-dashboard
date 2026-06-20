import { cn } from '../../lib/utils'

export function Switch({ checked, onCheckedChange, className }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onCheckedChange?.(!checked) }}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked ? 'bg-on' : 'bg-secondary',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0',
          'transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}
