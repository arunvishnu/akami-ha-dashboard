import { useHA } from '../hooks/useHA'

export function MediaCard({ entityId, label }) {
  const { states, callService } = useHA()
  const entity = states[entityId]
  const name = label || entity?.attributes?.friendly_name || entityId
  const state = entity?.state
  const title = entity?.attributes?.media_title
  const artist = entity?.attributes?.media_artist
  const albumArt = entity?.attributes?.entity_picture
  const volume = entity?.attributes?.volume_level
  const isPlaying = state === 'playing'
  const isActive = ['playing', 'paused', 'buffering'].includes(state)

  const cmd = (service, extra = {}) =>
    callService('media_player', service, { entity_id: entityId, ...extra })

  return (
    <div className={`media-card ${isActive ? 'active' : ''}`}>
      {albumArt && (
        <img
          src={albumArt.startsWith('http') ? albumArt : `${import.meta.env.VITE_HA_URL}${albumArt}`}
          alt="album art"
          className="album-art"
        />
      )}
      <div className="media-info">
        <div className="entity-name">{name}</div>
        {title && <div className="media-title">{title}</div>}
        {artist && <div className="media-artist">{artist}</div>}
        {!isActive && <div className="entity-state">{state}</div>}
      </div>
      <div className="media-controls">
        <button className="media-btn" onClick={() => cmd('media_previous_track')}>⏮</button>
        <button className="media-btn primary" onClick={() => cmd(isPlaying ? 'media_pause' : 'media_play')}>
          {isPlaying ? '⏸' : '▶️'}
        </button>
        <button className="media-btn" onClick={() => cmd('media_next_track')}>⏭</button>
      </div>
      {volume != null && (
        <div className="volume-row">
          <span>🔈</span>
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={(e) => cmd('volume_set', { volume_level: Number(e.target.value) })}
            className="brightness-slider"
          />
          <span>🔊</span>
        </div>
      )}
    </div>
  )
}
