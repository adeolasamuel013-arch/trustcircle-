import { useState } from 'react'
export default function ShareCard({ profileId, name }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/profile/${profileId}`
  async function copy() {
    try { await navigator.clipboard.writeText(url) } catch { }
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <p style={{ fontWeight: 500, marginBottom: 6, fontSize: 15 }}>Share your profile</p>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1rem' }}>Share your link so people can vouch for you</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input readOnly value={url} style={{ flex: 1, fontSize: 12, color: 'var(--muted)' }} onClick={e => e.target.select()} />
        <button className="btn btn-outline" onClick={copy} style={{ flexShrink: 0, padding: '8px 14px', fontSize: 13 }}>{copied ? 'Copied!' : 'Copy'}</button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my TrustCircle profile: ${url}`)}`, '_blank')}
          style={{ flex: 1, padding: '10px', fontSize: 13, borderRadius: 10, background: '#25D366', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
          WhatsApp
        </button>
        <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My TrustCircle profile: ${url}`)}`, '_blank')}
          style={{ flex: 1, padding: '10px', fontSize: 13, borderRadius: 10, background: '#000', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
          Share on X
        </button>
      </div>
    </div>
  )
}
