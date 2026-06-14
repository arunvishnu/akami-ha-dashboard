import { useState } from 'react'

export function SetupScreen({ onSave }) {
  const [url, setUrl] = useState('http://homeassistant.local:8123')
  const [token, setToken] = useState('')

  const save = () => {
    if (!url || !token) return
    localStorage.setItem('ha_url', url.replace(/\/$/, ''))
    localStorage.setItem('ha_token', token.trim())
    onSave()
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <h1>Home Dashboard</h1>
        <p className="setup-subtitle">Connect to your Home Assistant instance</p>

        <div className="setup-field">
          <label>Home Assistant URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://homeassistant.local:8123"
          />
        </div>

        <div className="setup-field">
          <label>Long-Lived Access Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your token here"
          />
          <div className="setup-hint">
            Generate at: HA → Profile → Security → Long-Lived Access Tokens
          </div>
        </div>

        <button className="setup-btn" onClick={save} disabled={!url || !token}>
          Connect
        </button>
      </div>
    </div>
  )
}
