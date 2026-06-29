export function CardDeviceIcon({ icon: Icon, isOn, color = '#fbbf24', spin = false, spinDuration = '1s', style = {} }) {
  return (
    <div className="flex justify-center">
      <div
        className="h-16 w-16 rounded-full border-2 flex items-center justify-center transition-all duration-300"
        style={{
          borderColor: isOn ? color : 'rgba(255,255,255,0.12)',
          boxShadow:   isOn ? `0 0 20px ${color}55` : 'none',
        }}
      >
        <Icon
          className="h-7 w-7 transition-all duration-300"
          style={{
            color: isOn ? color : 'rgba(255,255,255,0.25)',
            ...(spin && isOn ? { animation: `spin ${spinDuration} linear infinite` } : {}),
            ...style,
          }}
        />
      </div>
    </div>
  )
}
