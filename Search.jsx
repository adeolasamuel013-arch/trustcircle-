export default function Avatar({ profile, size = 44, style = {} }) {
  const initials = profile?.full_name?.charAt(0).toUpperCase() || 'U'
  const fontSize = size * 0.35

  if (profile?.avatar_url) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        overflow: 'hidden', border: '2px solid var(--green-light)', ...style
      }}>
        <img
          src={profile.avatar_url}
          alt={profile.full_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            e.target.style.display = 'none'
            e.target.parentElement.style.background = 'var(--green)'
            e.target.parentElement.innerHTML = `<span style="font-family:Fraunces,serif;font-size:${fontSize}px;font-weight:700;color:white;display:flex;align-items:center;justify-content:center;width:100%;height:100%">${initials}</span>`
          }}
        />
      </div>
    )
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--green)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize, fontFamily: 'Fraunces, serif',
      fontWeight: 700, color: 'white', ...style
    }}>
      {initials}
    </div>
  )
}
