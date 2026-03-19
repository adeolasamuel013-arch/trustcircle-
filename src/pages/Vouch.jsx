import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { useSearchParams } from 'react-router-dom'

export default function Vouch() {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const toId = searchParams.get('to')
    if (toId) supabase.from('profiles').select('id,full_name,email,skill,trust_score,vouch_count').eq('id', toId).single().then(({ data }) => { if (data) setSelected(data) })
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    if (!search.trim()) return
    setSearching(true); setResults([]); setSelected(null)
    const { data } = await supabase.from('profiles').select('id,full_name,email,skill,trust_score,vouch_count').neq('id', user.id).or(`full_name.ilike.%${search}%,email.ilike.%${search}%,skill.ilike.%${search}%`).limit(8)
    setResults(data || []); setSearching(false)
  }

  async function handleVouch() {
    if (!selected) return
    setError(''); setSubmitting(true)
    const { data: existing } = await supabase.from('vouches').select('id').eq('voucher_id', user.id).eq('vouchee_id', selected.id).single()
    if (existing) { setError('You have already vouched for this person.'); setSubmitting(false); return }
    const weight = Math.max(5, Math.min(20, Math.floor((profile?.trust_score || 0) / 5) + 5))
    await supabase.from('vouches').insert({ voucher_id: user.id, vouchee_id: selected.id, message: message.trim() || null, weight })
    await supabase.from('profiles').update({ trust_score: Math.min(100, (selected.trust_score || 0) + weight), vouch_count: (selected.vouch_count || 0) + 1 }).eq('id', selected.id)
    setSuccess(`You vouched for ${selected.full_name}! Their trust score went up by ${weight} points.`)
    setSelected(null); setSearch(''); setResults([]); setMessage('')
    setSubmitting(false)
  }

  return (
    <div className="page-sm" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 8 }}>Vouch for someone</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.65, marginBottom: '1.5rem' }}>Search for someone you trust personally. Your vouch increases their score — and reflects on your own reputation.</p>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
          <input placeholder="Search by name, email or skill..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-green" disabled={searching} style={{ flexShrink: 0, padding: '12px 18px' }}>{searching ? '...' : 'Search'}</button>
        </form>
      </div>

      {results.length > 0 && !selected && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          {results.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', marginBottom: '0.75rem', padding: '1rem' }} onClick={() => setSelected(r)}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{r.full_name?.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, fontSize: 15 }}>{r.full_name}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{r.skill} · Score: {r.trust_score || 0}</p>
              </div>
              <span style={{ fontSize: 13, color: 'var(--green-mid)', fontWeight: 500 }}>Select →</span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="card" style={{ borderTop: '3px solid var(--green-light)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{selected.full_name?.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 16 }}>{selected.full_name}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{selected.skill}</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', fontSize: 20, color: 'var(--muted)', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Add a message (optional)</label>
          <textarea placeholder="E.g. Chidi fixed my generator perfectly — very professional and honest." value={message} onChange={e => setMessage(e.target.value)} rows={3} style={{ marginBottom: 8, resize: 'vertical' }} />
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1rem' }}>Your vouch weight: <strong>+{Math.max(5, Math.min(20, Math.floor((profile?.trust_score || 0) / 5) + 5))} pts</strong></p>
          {error && <p className="error" style={{ marginBottom: 10 }}>{error}</p>}
          <button className="btn btn-green btn-full" onClick={handleVouch} disabled={submitting}>{submitting ? 'Submitting...' : `Vouch for ${selected.full_name}`}</button>
        </div>
      )}

      {success && (
        <div style={{ background: 'var(--green-pale)', border: '1px solid #B8E8D4', borderRadius: 12, padding: '1rem', marginTop: '1rem' }}>
          <p style={{ fontSize: 14, color: 'var(--green-mid)', fontWeight: 500 }}>{success}</p>
        </div>
      )}
    </div>
  )
}
