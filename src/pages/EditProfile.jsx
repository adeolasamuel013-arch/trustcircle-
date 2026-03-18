import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'

const SKILLS = [
  'Mechanic', 'Electrician', 'Plumber', 'Lawyer', 'Doctor', 'Accountant',
  'Graphic Designer', 'Web Developer', 'Chef / Caterer', 'Tailor / Fashion',
  'Hair Stylist', 'Photographer', 'Driver', 'Carpenter', 'Painter',
  'Real Estate Agent', 'Teacher / Tutor', 'Other'
]

export default function EditProfile() {
  const { user, profile, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', skill: '', bio: '', phone: '', location: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        skill: profile.skill || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || ''
      })
    }
  }, [profile])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('Full name is required.'); return }
    setSaving(true)
    setError('')
    setSuccess('')
    const { error: err } = await supabase.from('profiles').update({
      full_name: form.full_name.trim(),
      skill: form.skill,
      bio: form.bio.trim(),
      phone: form.phone.trim(),
      location: form.location.trim()
    }).eq('id', user.id)

    if (err) {
      setError('Failed to save changes.')
    } else {
      await fetchProfile(user.id)
      setSuccess('Profile updated successfully!')
      setTimeout(() => navigate('/dashboard'), 1200)
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '2.5rem 5%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 6 }}>Edit profile</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Keep your profile complete — it builds more trust.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Full name *</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Your full name" />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Your service / skill *</label>
            <select name="skill" value={form.skill} onChange={handleChange}>
              <option value="">Select your skill</option>
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Bio <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              name="bio" value={form.bio} onChange={handleChange} rows={3}
              placeholder="Tell people what you do and why they should trust you..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Phone number <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+234 800 000 0000" />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Location <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Lagos, Abuja, Port Harcourt..." />
          </div>

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ padding: '12px 20px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
