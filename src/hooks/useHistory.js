import { useState, useEffect } from 'react'
import { useHA } from './useHA'

/**
 * Fetches recorder history over the existing HA WebSocket (avoids CORS).
 * Returns { history, loading, error } where history is a dict:
 *   { [entity_id]: [{ s, a, lu }, ...] }
 * s = state string, a = attributes object, lu = last_updated (Unix seconds)
 */
export function useHistory(entityIds, hours = 24) {
  const { sendMessage, connectionStatus } = useHA()
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const key = entityIds.join(',')

  useEffect(() => {
    if (connectionStatus !== 'authenticated') return
    let cancelled = false
    setLoading(true)

    const start = new Date(Date.now() - hours * 3600_000)
    const end   = new Date()

    sendMessage({
      type:        'history/history_during_period',
      start_time:  start.toISOString(),
      end_time:    end.toISOString(),
      entity_ids:  entityIds,
      minimal_response: false,
      significant_changes_only: false,
    })
      .then(result => {
        if (!cancelled) { setHistory(result); setError(null) }
      })
      .catch(e => {
        if (!cancelled) setError(e)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hours, connectionStatus])

  return { history, loading, error }
}
