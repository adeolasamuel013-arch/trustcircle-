import { useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function AvatarUpload({ size = 80, onUpload }) {
  const { user, profile, fetchProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { setError('Image must be under 3MB'); return }
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { setError('Only JPG, PNG or WebP allowed'); return }
    setError(''); setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${publicUrl}?t=${Date.now()}`
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      await fetchProfile(user.id)
      if (onUpload) onUpload(url)
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally { setUploading(false) }
  }

  const avatarUrl = profile?.avatar_url
  const initials = profile?.full_name?.charAt(0).toUpperCase() || 'U'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        style={{
          width: size, height: size, borderRadius: '50%', cursor: uploading ? 'wait' : 'pointer',
          position: 'relative', overflow: 'hidden', flexShrink: 0,
          background: avatarUrl ? 'transparent' : 'var(--green)',
          border: '3px solid var(--green-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.2s'
        }}
        title="Click to change photo"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: size * 0.35, fontWeight: 700, color: 'white' }}>{initials}</span>
        )}
        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: uploading ? 1 : 0, transition: 'opacity 0.2s',
          borderRadius: '50%'
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => { if (!uploading) e.currentTarget.style.opacity = 0 }}
        >
          {uploading ? (
            <div className="spin" style={{ width: 22, height: 22, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{ fontSize: 10, color: 'white', marginTop: 4, fontWeight: 500 }}>Change</span>
            </>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} style={{ display: 'none' }} />
      {error && <p style={{ fontSize: 12, color: 'var(--danger)', textAlign: 'center', maxWidth: size + 40 }}>{error}</p>}
      {!uploading && <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>Click photo to change</p>}
    </div>
  )
}
