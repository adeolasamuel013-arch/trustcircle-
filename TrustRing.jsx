export default function TrustRing({ score = 0, size = 80 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const fill = Math.min(score, 100) / 100
  const dashOffset = circumference * (1 - fill)

  const color = score >= 70 ? '#2ECC8A' : score >= 40 ? '#F5A623' : '#E53E3E'
  const label = score >= 70 ? 'High Trust' : score >= 40 ? 'Growing' : 'New'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border)" strokeWidth="6"/>
          <circle
            cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: size * 0.22, color: 'var(--dark)', lineHeight: 1 }}>
            {score}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color, letterSpacing: '0.04em' }}>{label}</span>
    </div>
  )
}
