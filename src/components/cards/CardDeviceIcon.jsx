export function CardDeviceIcon({ icon: Icon, isOn, color = '#fbbf24', spin = false, spinDuration = '1s', onClick }) {
  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        className="h-32 w-32 rounded-full border-2 flex items-center justify-center transition-all duration-300"
        style={{
          borderColor: isOn ? color : 'rgba(255,255,255,0.12)',
          boxShadow:   isOn ? `0 0 28px ${color}55` : 'none',
        }}
      >
        <Icon
          className="h-12 w-12 transition-all duration-300"
          style={{
            color: isOn ? color : 'rgba(255,255,255,0.25)',
            ...(spin && isOn ? { animation: `spin ${spinDuration} linear infinite` } : {}),
          }}
        />
      </button>
    </div>
  )
}
