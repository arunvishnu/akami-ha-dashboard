import { useState } from 'react'
import { HAProvider } from './context/HAContext'
import { SetupScreen } from './components/SetupScreen'
import { Dashboard } from './components/Dashboard'

function hasCredentials() {
  return !!(
    (import.meta.env.VITE_HA_URL && import.meta.env.VITE_HA_TOKEN) ||
    (localStorage.getItem('ha_url') && localStorage.getItem('ha_token'))
  )
}

export default function App() {
  const [ready, setReady] = useState(hasCredentials)

  const handleReset = () => {
    localStorage.removeItem('ha_url')
    localStorage.removeItem('ha_token')
    setReady(false)
  }

  if (!ready) {
    return <SetupScreen onSave={() => setReady(true)} />
  }

  return (
    <HAProvider>
      <Dashboard onReset={handleReset} />
    </HAProvider>
  )
}
