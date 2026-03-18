import { useState } from 'react'

export default function ShareCard({ profileId, name }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/profile/${profileId}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  function shareWhatsApp() {
    const text = `Check out ${name}'s trust profile on TrustCircle — Nigeria's verified referral network: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function shareTwitter() {
    const text = `I'm on TrustCircle — Nigeria's trust network for verified service providers. Check my profile:`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark)', marginBottom: '0.75rem' }}>
        Share your profile
      </p>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
        Share your TrustCircle profile so people can vouch for you and others can find you.
      </p>

      {/* URL box */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem' }}>
        <input
          readOnly value={url}
          style={{ flex: 1, fontSize: 12, color: 'var(--muted)', background: 'var(--cream)', cursor: 'text' }}
          onClick={e => e.target.select()}
        />
        <button
          onClick={copyLink}
          className={copied ? 'btn-primary' : 'btn-secondary'}
          style={{ flexShrink: 0, padding: '8px 16px', fontSize: 13 }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Social share */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={shareWhatsApp}
          style={{
            flex: 1, padding: '9px', fontSize: 13, borderRadius: 'var(--radius-sm)',
            background: '#25D366', color: 'white', border: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 500
          }}
        >
          Share on WhatsApp
        </button>
        <button
          onClick={shareTwitter}
          style={{
            flex: 1, padding: '9px', fontSize: 13, borderRadius: 'var(--radius-sm)',
            background: '#000', color: 'white', border: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 500
          }}
        >
          Share on X
        </button>
      </div>
    </div>
  )
}
