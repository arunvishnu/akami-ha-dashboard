import { useState } from 'react'
import { useHA } from '../hooks/useHA'
import { TabBar } from './TabBar'
import { HomeTab } from './tabs/HomeTab'
import { FloorTab } from './tabs/FloorTab'

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
        <button className="header-btn subtle" onClick={onReset}>⚙️</button>
      </header>

      <TabBar active={activeTab} onChange={setActiveTab} />

      <main className="dashboard-main">
        {activeTab === 'home' && <HomeTab />}
        {activeTab !== 'home' && <FloorTab floorId={activeTab} />}
      </main>
    </div>
  )
}
