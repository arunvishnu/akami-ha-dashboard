import { useState } from 'react'
import { SkipBack, SkipForward, Play, Pause, Volume1, Volume2, Music, Tv, Power } from 'lucide-react'
import { useHA } from '../../hooks/useHA'
import { MEDIA_PLAYERS } from '../../layout'
import { Card } from '../ui/card'
import { cn } from '../../lib/utils'

const HA_URL = import.meta.env.VITE_HA_URL

function artUrl(path) {
  if (!path) return null
  return path.startsWith('http') ? path : `${HA_URL}${path}`
}

function Statebadge({ state }) {
  const isPlaying = state === 'playing'
  const isPaused  = state === 'paused'
  return (
    <span className={cn(
      'text-xs font-medium px-2 py-0.5 rounded-full shrink-0',
      isPlaying ? 'bg-on/15 text-on' : 'bg-secondary text-muted-foreground'
    )}>
      {isPlaying ? '● Playing' : isPaused ? '⏸ Paused' : state}
    </span>
  )
}

function CollapsedPlayer({ player, entity, onExpand }) {
  const { callService } = useHA()
  const state     = entity?.state ?? 'unavailable'
  const title     = entity?.attributes?.media_title
  const isPlaying = state === 'playing'

  const cmd = (svc) => callService('media_player', svc, { entity_id: player.id })

  return (
    <Card
      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/40 transition-colors"
      onClick={onExpand}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-base">
        {player.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{player.label}</div>
        {title && <div className="text-xs text-muted-foreground truncate">{title}</div>}
      </div>
      <Statebadge state={state} />
      {['playing','paused'].includes(state) && (
        <button
          onClick={(e) => { e.stopPropagation(); cmd(isPlaying ? 'media_pause' : 'media_play') }}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/70 transition-colors shrink-0"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
      )}
      {player.remote && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            const isOff = ['off', 'standby', 'unavailable'].includes(state)
            callService('remote', isOff ? 'turn_on' : 'turn_off', { entity_id: player.remote })
          }}
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-lg transition-colors shrink-0',
            ['off', 'standby', 'unavailable'].includes(state)
              ? 'bg-secondary text-muted-foreground hover:text-foreground'
              : 'bg-on/15 text-on hover:bg-on/25'
          )}
          title="Power"
        >
          <Power size={14} />
        </button>
      )}
    </Card>
  )
}

function ExpandedPlayer({ player, entity, onCollapse }) {
  const { callService } = useHA()
  const state     = entity?.state ?? 'unavailable'
  const title     = entity?.attributes?.media_title
  const artist    = entity?.attributes?.media_artist
  const album     = entity?.attributes?.media_album_name
  const art       = artUrl(entity?.attributes?.entity_picture)
  const volume    = entity?.attributes?.volume_level
  const isPlaying = state === 'playing'
  const isTv      = player.id.includes('tv') || player.id.includes('bedroom_tv')

  const cmd = (svc, extra = {}) =>
    callService('media_player', svc, { entity_id: player.id, ...extra })

  return (
    <Card className={cn('overflow-hidden border-on/30', isPlaying && 'bg-on/[0.03]')}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={onCollapse} className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-base">
            {isTv ? <Tv size={16} className="text-muted-foreground" /> : player.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{player.label}</div>
          </div>
          <Statebadge state={state} />
        </button>
        {player.remote && (
          <button
            onClick={() => {
              const isOff = ['off', 'standby', 'unavailable'].includes(state)
              callService('remote', isOff ? 'turn_on' : 'turn_off', { entity_id: player.remote })
            }}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-lg transition-colors shrink-0',
              ['off', 'standby', 'unavailable'].includes(state)
                ? 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                : 'bg-on/15 text-on hover:bg-on/25'
            )}
            title="Power"
          >
            <Power size={14} />
          </button>
        )}
      </div>

      {/* Album art + track info */}
      <div className="flex gap-4 px-4 pb-4">
        <div className={cn(
          'h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-secondary flex items-center justify-center',
        )}>
          {art
            ? <img src={art} alt="art" className="h-full w-full object-cover" />
            : <Music size={24} className="text-muted-foreground" />
          }
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="min-w-0">
            {title  && <div className="text-sm font-semibold truncate">{title}</div>}
            {artist && <div className="text-xs text-muted-foreground truncate">{artist}</div>}
            {album  && <div className="text-xs text-muted-foreground truncate">{album}</div>}
            {!title && <div className="text-xs text-muted-foreground italic">Nothing playing</div>}
          </div>

          {/* Transport controls */}
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => cmd('media_previous_track')}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <SkipBack size={15} />
            </button>
            <button
              onClick={() => cmd(isPlaying ? 'media_pause' : 'media_play')}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-on text-background hover:bg-on/80 transition-colors"
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
              onClick={() => cmd('media_next_track')}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <SkipForward size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Volume */}
      {volume != null && (
        <div className="flex items-center gap-2 px-4 pb-4">
          <Volume1 size={14} className="text-muted-foreground shrink-0" />
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={volume}
            onChange={(e) => cmd('volume_set', { volume_level: Number(e.target.value) })}
            className="flex-1"
          />
          <Volume2 size={14} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </Card>
  )
}

export function MediaTab() {
  const { states } = useHA()
  // tracks player IDs that have been manually toggled from their default state
  const [manualExpanded, setManualExpanded] = useState(new Set())

  const toggle = (id) =>
    setManualExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="p-4 flex flex-col gap-3">
      {MEDIA_PLAYERS.map((player) => {
        const entity   = states[player.id]
        const state    = entity?.state ?? 'unavailable'
        const isActive = ['playing', 'paused', 'buffering'].includes(state)
        // active → expanded by default; inactive → collapsed by default
        // manual toggle flips either direction
        const expanded = manualExpanded.has(player.id) ? !isActive : isActive

        if (expanded) {
          return (
            <ExpandedPlayer
              key={player.id}
              player={player}
              entity={entity}
              onCollapse={() => toggle(player.id)}
            />
          )
        }

        return (
          <CollapsedPlayer
            key={player.id}
            player={player}
            entity={entity}
            onExpand={() => toggle(player.id)}
          />
        )
      })}
    </div>
  )
}
