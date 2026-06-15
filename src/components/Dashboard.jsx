import { useState } from 'react'
import { useHA } from '../hooks/useHA'
import { TabBar } from './TabBar'
import { HomeTab } from './tabs/HomeTab'
import { FloorTab } from './tabs/FloorTab'

const RAW_BUILD_TIME = import.meta.env.VITE_BUILD_TIME

function buildLabel() {
  if (!RAW_BUILD_TIME) return 'dev'
  const d = new Date(RAW_BUILD_TIME)
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export function Dashboard({ onReset }) {
  const { connectionStatus } = useHA()
  const [activeTab, setActiveTab] = useState('home')

  const statusDot = {
    authenticated: 'status-ok',
    connecting:    'status-connecting',
    error:         'status-error',
  }[connectionStatus]

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <span className={`status-dot ${statusDot}`} title={connectionStatus} />
          <h1 className="dashboard-title">Home</h1>
        </div>
        <div className="build-info" title="Click to reset credentials" onClick={onReset}>
          <span className="build-info-icon">ⓘ</span>
          <span className="build-info-text">Built {buildLabel()}</span>
        </div>
      </header>

      <TabBar active={activeTab} onChange={setActiveTab} />

      <main className="dashboard-main">
        {activeTab === 'home' && <HomeTab />}
        {activeTab !== 'home' && <FloorTab floorId={activeTab} />}
      </main>
    </div>
  )
}
