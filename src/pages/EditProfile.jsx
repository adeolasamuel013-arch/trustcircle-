import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'

const SKILLS = ['Mechanic','Electrician','Plumber','Lawyer','Doctor','Accountant','Graphic Designer','Web Developer','Chef / Caterer','Tailor / Fashion','Hair Stylist','Photographer','Driver','Carpenter','Painter','Real Estate Agent','Teacher / Tutor','Other']

export default function EditProfile() {
  const { user, profile, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', skill: '', bio: '', phone: '', location: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || '', skill: profile.skill || '', bio: profile.bio || '', phone: profile.phone || '', location: profile.location || '' })
  }, [profile])

  async function save(e) {
    e.preventDefault()
    if (!form.full_name.trim()) { setMsg({ type: 'error', text: 'Full name is required.' }); return }
    setSaving(true); setMsg({ type: '', text: '' })
    const { error } = await supabase.from('profiles').update({ full_name: form.full_name.trim(), skill: form.skill, bio: form.bio.trim(), phone: form.phone.trim(), location: form.location.trim() }).eq('id', user.id)
    if (error) { setMsg({ type: 'error', text: 'Failed to save. Try again.' }) }
    else { await fetchProfile(user.id); setMsg({ type: 'success', text: 'Profile saved!' }); setTimeout(() => navigate('/dashboard'), 1000) }
    setSaving(false)
  }

  return (
    <div className="page-sm" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 8 }}>Edit profile</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem' }}>A complete profile builds more trust with people who find you.</p>

      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Full name *</label>
            <input placeholder="Your full name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Skill / service</label>
            <select value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))}>
              <option value="">Select your skill</option>
              {SKILLS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Bio <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea placeholder="Tell people what you do and why they should trust you..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Phone number <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input placeholder="+234 800 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Location <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input placeholder="Lagos, Abuja, Port Harcourt..." value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          {msg.text && <p className={msg.type === 'error' ? 'error' : 'success'}>{msg.text}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" className="btn btn-green" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')} style={{ padding: '13px 18px' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
