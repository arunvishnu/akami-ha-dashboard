import { useRef } from 'react'
import {
  Power, Menu, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Undo2, Home, FastForward, Rewind, Play, Pause, Keyboard,
  Volume2, VolumeX, X,
} from 'lucide-react'
import { useHA } from '../hooks/useHA'
import { cn } from '../lib/utils'

// ── Long-press hook (for FF / RW repeat) ──────────────────────────────

function useLongPress(onPress, interval = 250) {
  const timer = useRef(null)
  const stop = () => { clearInterval(timer.current); timer.current = null }
  return {
    onPointerDown: (e) => { e.preventDefault(); onPress(); timer.current = setInterval(onPress, interval) },
    onPointerUp:    stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  }
}

// ── D-pad ─────────────────────────────────────────────────────────────

function DPad({ send }) {
  const BTN = 'flex items-center justify-center text-white/60 hover:text-white active:text-white/40 transition-colors select-none'

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Ring background */}
      <div className="absolute inset-0 rounded-full bg-[#2c2c2e]" />

      {/* UP */}
      <button
        onClick={() => send('DPAD_UP')}
        className={cn(BTN, 'absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full hover:bg-white/10 active:bg-white/20')}
      >
        <ChevronUp size={22} />
      </button>

      {/* DOWN */}
      <button
        onClick={() => send('DPAD_DOWN')}
        className={cn(BTN, 'absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full hover:bg-white/10 active:bg-white/20')}
      >
        <ChevronDown size={22} />
      </button>

      {/* LEFT */}
      <button
        onClick={() => send('DPAD_LEFT')}
        className={cn(BTN, 'absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full hover:bg-white/10 active:bg-white/20')}
      >
        <ChevronLeft size={22} />
      </button>

      {/* RIGHT */}
      <button
        onClick={() => send('DPAD_RIGHT')}
        className={cn(BTN, 'absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full hover:bg-white/10 active:bg-white/20')}
      >
        <ChevronRight size={22} />
      </button>

      {/* CENTER / OK */}
      <button
        onClick={() => send('DPAD_CENTER')}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[4.5rem] h-[4.5rem] rounded-full bg-[#3a3a3c] hover:bg-[#4a4a4c] active:bg-[#222] transition-colors"
      />
    </div>
  )
}

// ── Single remote button ──────────────────────────────────────────────

function Btn({ onClick, icon, label, className, longPress, variant = 'default' }) {
  const lp = longPress ? useLongPress(onClick) : {}
  return (
    <button
      {...lp}
      onClick={longPress ? undefined : onClick}
      title={label}
      className={cn(
        'flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-full transition-colors select-none touch-none',
        variant === 'default'  && 'bg-[#2c2c2e] text-white/70 hover:text-white hover:bg-[#3a3a3c] active:bg-[#222]',
        variant === 'power'    && 'bg-[#2c2c2e] text-red-500 hover:bg-[#3a3a3c] active:bg-[#222]',
        variant === 'play'     && 'bg-[#3a3a3c] text-white hover:bg-[#4a4a4c] active:bg-[#222]',
        className,
      )}
    >
      {icon}
      {label && <span className="text-[9px] text-white/40 leading-none">{label}</span>}
    </button>
  )
}

// ── Netflix button ────────────────────────────────────────────────────

function NetflixBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-2xl bg-[#e50914] hover:bg-[#b20710] active:bg-[#8b0000] transition-colors font-bold tracking-widest text-white text-sm"
    >
      NETFLIX
    </button>
  )
}

// ── ShieldRemote ──────────────────────────────────────────────────────

export function ShieldRemote({ mediaEntityId, remoteEntityId, onClose }) {
  const { callService, states } = useHA()
  const mpState = states[mediaEntityId]?.state ?? 'off'
  const isPlaying = mpState === 'playing'

  const send = (command) =>
    callService('remote', 'send_command', { entity_id: remoteEntityId, command })

  const mp = (service, extra = {}) =>
    callService('media_player', service, { entity_id: mediaEntityId, ...extra })

  const openNetflix = () =>
    callService('remote', 'send_command', { entity_id: remoteEntityId, command: 'KEYCODE_NETFLIX' })

  const ffProps  = useLongPress(() => send('MEDIA_FAST_FORWARD'))
  const rwProps  = useLongPress(() => send('MEDIA_REWIND'))

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Remote panel */}
      <div
        className="relative w-72 mb-4 rounded-3xl bg-[#1c1c1e] px-6 pt-5 pb-6 flex flex-col gap-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        {/* Top row: Power + Menu */}
        <div className="flex justify-between items-center px-2">
          <Btn
            onClick={() => send('POWER')}
            icon={<Power size={18} />}
            label="Power"
            variant="power"
          />
          <Btn
            onClick={() => send('MENU')}
            icon={<Menu size={18} />}
            label="Menu"
          />
        </div>

        {/* D-pad */}
        <DPad send={send} />

        {/* Row: Back · Home · FF */}
        <div className="flex justify-between items-center px-2">
          <Btn onClick={() => send('BACK')}  icon={<Undo2 size={18} />}      label="Back" />
          <Btn onClick={() => send('HOME')}  icon={<Home size={18} />}       label="Home" />
          <Btn
            onClick={() => send('MEDIA_FAST_FORWARD')}
            icon={<FastForward size={18} />}
            label="FF"
            longPress
          />
        </div>

        {/* Row: Rewind · Play/Pause · Keyboard */}
        <div className="flex justify-between items-center px-2">
          <Btn
            onClick={() => send('MEDIA_REWIND')}
            icon={<Rewind size={18} />}
            label="RW"
            longPress
          />
          <Btn
            onClick={() => mp(isPlaying ? 'media_pause' : 'media_play')}
            icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
            label={isPlaying ? 'Pause' : 'Play'}
            variant="play"
          />
          <Btn onClick={() => send('KEYCODE_DEL')} icon={<Keyboard size={18} />} label="KB" />
        </div>

        {/* Row: Vol- · Mute · Vol+ */}
        <div className="flex justify-between items-center px-2">
          <Btn onClick={() => send('VOLUME_DOWN')} icon={<VolumeX size={18} />} label="Vol −" />
          <Btn onClick={() => send('VOLUME_MUTE')} icon={<VolumeX size={16} />} label="Mute" className="opacity-60" />
          <Btn onClick={() => send('VOLUME_UP')}   icon={<Volume2 size={18} />} label="Vol +" />
        </div>

        {/* Netflix */}
        <NetflixBtn onClick={openNetflix} />
      </div>
    </div>
  )
}
