import { useState } from 'react'
import { useHA } from '../hooks/useHA'
import { TabBar } from './TabBar'
import { HomeTab } from './tabs/HomeTab'
import { FloorTab } from './tabs/FloorTab'
import { cn } from '../lib/utils'

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

  const statusDotClass = {
    authenticated: 'bg-emerald-500',
    connecting:    'bg-amber-500 animate-pulse',
    error:         'bg-red-500',
  }[connectionStatus] || 'bg-zinc-500'

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <span className={cn('h-2 w-2 rounded-full shrink-0', statusDotClass)} title={connectionStatus} />
          <h1 className="text-base font-semibold tracking-tight">Home</h1>
        </div>
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={onReset}
          title="Click to reset credentials"
        >
          Built {buildLabel()}
        </button>
      </header>

      <TabBar active={activeTab} onChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'home' ? <HomeTab /> : <FloorTab floorId={activeTab} />}
      </main>
    </div>
  )
}
