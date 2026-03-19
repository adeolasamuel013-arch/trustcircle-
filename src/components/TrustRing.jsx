export default function TrustRing({ score = 0, size = 80 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - Math.min(score, 100) / 100)
  const color = score >= 70 ? '#2ECC8A' : score >= 40 ? '#F5A623' : '#9CA3AF'
  const label = score >= 70 ? 'High Trust' : score >= 40 ? 'Growing' : 'New'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#E5E0D8" strokeWidth="6"/>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: size * 0.22, color: '#0D0D0D' }}>{score}</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color }}>{label}</span>
    </div>
  )
}
