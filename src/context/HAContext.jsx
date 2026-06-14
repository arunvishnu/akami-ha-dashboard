import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const HAContext = createContext(null)

function getCredentials() {
  return {
    url: import.meta.env.VITE_HA_URL || localStorage.getItem('ha_url') || 'http://homeassistant.local:8123',
    token: import.meta.env.VITE_HA_TOKEN || localStorage.getItem('ha_token') || '',
  }
}

export function HAProvider({ children }) {
  const [states, setStates] = useState({})
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const wsRef = useRef(null)
  const msgIdRef = useRef(1)
  const pendingRef = useRef({})

  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
      return true
    }
    return false
  }, [])

  const callService = useCallback((domain, service, serviceData = {}) => {
    const id = msgIdRef.current++
    return new Promise((resolve, reject) => {
      pendingRef.current[id] = { resolve, reject }
      const sent = send({ id, type: 'call_service', domain, service, service_data: serviceData })
      if (!sent) {
        delete pendingRef.current[id]
        reject(new Error('WebSocket not connected'))
      }
    })
  }, [send])

  useEffect(() => {
    const { url, token } = getCredentials()
    if (!token) { setConnectionStatus('error'); return }

    const wsUrl = url.replace(/^http/, 'ws') + '/api/websocket'
    let cancelled = false
    let retryTimer = null

    function connect() {
      if (cancelled) return
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data)

        if (msg.type === 'auth_required') {
          ws.send(JSON.stringify({ type: 'auth', access_token: token }))
          return
        }

        if (msg.type === 'auth_ok') {
          setConnectionStatus('authenticated')

          const id = msgIdRef.current++
          pendingRef.current[id] = {
            resolve: (result) => {
              const map = {}
              result.forEach((s) => { map[s.entity_id] = s })
              setStates(map)
            },
            reject: () => {},
          }
          ws.send(JSON.stringify({ id, type: 'get_states' }))

          const subId = msgIdRef.current++
          ws.send(JSON.stringify({ id: subId, type: 'subscribe_events', event_type: 'state_changed' }))
          return
        }

        if (msg.type === 'auth_invalid') {
          setConnectionStatus('error')
          ws.close()
          return
        }

        if (msg.type === 'result') {
          const pending = pendingRef.current[msg.id]
          if (pending) {
            msg.success ? pending.resolve(msg.result) : pending.reject(msg.error)
            delete pendingRef.current[msg.id]
          }
          return
        }

        if (msg.type === 'event' && msg.event?.event_type === 'state_changed') {
          const { entity_id, new_state } = msg.event.data
          setStates((prev) => ({ ...prev, [entity_id]: new_state }))
        }
      }

      ws.onerror = () => {}
      ws.onclose = () => {
        if (cancelled) return
        setConnectionStatus('connecting')
        retryTimer = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      cancelled = true
      clearTimeout(retryTimer)
      wsRef.current?.close()
    }
  }, [])

  return (
    <HAContext.Provider value={{ states, connectionStatus, callService }}>
      {children}
    </HAContext.Provider>
  )
}

export function useHA() {
  const ctx = useContext(HAContext)
  if (!ctx) throw new Error('useHA must be used within HAProvider')
  return ctx
}
