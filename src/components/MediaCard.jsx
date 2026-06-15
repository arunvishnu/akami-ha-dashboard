import { useHA } from '../hooks/useHA'
import { cn } from '../lib/utils'

export function MediaCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity   = states[entityId]
  const name     = label || entity?.attributes?.friendly_name || entityId
  const state    = entity?.state
  const title    = entity?.attributes?.media_title
  const artist   = entity?.attributes?.media_artist
  const albumArt = entity?.attributes?.entity_picture
  const volume   = entity?.attributes?.volume_level
  const isPlaying = state === 'playing'
  const isActive  = ['playing', 'paused', 'buffering'].includes(state)

  const cmd = (service, extra = {}) =>
    callService('media_player', service, { entity_id: entityId, ...extra })

  const artSrc = albumArt
    ? (albumArt.startsWith('http') ? albumArt : `${import.meta.env.VITE_HA_URL}${albumArt}`)
    : null

  return (
    <div className={cn(
      'rounded-xl bg-card border overflow-hidden',
      isActive ? 'border-on/25' : 'border-border'
    )}>
      <div className="flex items-center gap-3 p-3">
        {artSrc && (
          <img
            src={artSrc}
            alt="album art"
            className="h-12 w-12 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{name}</div>
          {title  && <div className="text-xs text-foreground font-medium truncate">{title}</div>}
          {artist && <div className="text-xs text-muted-foreground truncate">{artist}</div>}
          {!isActive && <div className="text-xs text-muted-foreground">{state}</div>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => cmd('media_previous_track')}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            ⏮
          </button>
          <button
            onClick={() => cmd(isPlaying ? 'media_pause' : 'media_play')}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/70 text-foreground transition-colors"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={() => cmd('media_next_track')}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            ⏭
          </button>
        </div>
      </div>

      {volume != null && (
        <div className="flex items-center gap-2 px-3 pb-3">
          <span className="text-xs">🔈</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => cmd('volume_set', { volume_level: Number(e.target.value) })}
          />
          <span className="text-xs">🔊</span>
        </div>
      )}
    </div>
  )
}
