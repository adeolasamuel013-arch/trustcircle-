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
    if (toId) {
      supabase.from('profiles').select('id,full_name,email,skill,trust_score,vouch_count')
        .eq('id', toId).single()
        .then(({ data }) => { if (data) setSelected(data) })
    }
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    if (!search.trim()) return
    setSearching(true); setResults([]); setSelected(null)
    const { data } = await supabase.from('profiles')
      .select('id,full_name,email,skill,trust_score,vouch_count')
      .neq('id', user.id)
      .or(`full_name.ilike.%${search}%,email.ilike.%${search}%,skill.ilike.%${search}%`)
      .limit(8)
    setResults(data || []); setSearching(false)
  }

  async function handleVouch() {
    if (!selected) return
    setError(''); setSubmitting(true)
    const { data: existing } = await supabase.from('vouches').select('id')
      .eq('voucher_id', user.id).eq('vouchee_id', selected.id).single()
    if (existing) { setError('You have already vouched for this person.'); setSubmitting(false); return }
    const { data: freshVouchee } = await supabase.from('profiles')
      .select('trust_score, vouch_count').eq('id', selected.id).single()
    const { data: freshVoucher } = await supabase.from('profiles')
      .select('trust_score').eq('id', user.id).single()
    const voucher_score = freshVoucher?.trust_score || 0
    const weight = Math.max(5, Math.min(20, Math.floor(voucher_score / 5) + 5))
    const newScore = Math.min(100, (freshVouchee?.trust_score || 0) + weight)
    const newCount = (freshVouchee?.vouch_count || 0) + 1
    const { error: vouchError } = await supabase.from('vouches').insert({
      voucher_id: user.id, vouchee_id: selected.id,
      message: message.trim() || null, weight
    })
    if (vouchError) { setError('Something went wrong. Please try again.'); setSubmitting(false); return }
    await supabase.from('profiles').update({ trust_score: newScore, vouch_count: newCount }).eq('id', selected.id)

    // Send email notification (fire and forget — don't block UI)
    if (selected.email) {
      supabase.functions.invoke('notify-vouch', {
        body: {
          voucheeName: selected.full_name,
          voucheeEmail: selected.email,
          voucherName: profile?.full_name || 'Someone',
          message: message.trim() || null,
          newScore,
          weight,
        },
      }).catch(() => {}) // silently ignore email errors
    }

    setSuccess(`You vouched for ${selected.full_name}! Their trust score increased by ${weight} points to ${newScore}.`)
    setSelected(null); setSearch(''); setResults([]); setMessage('')
    setSubmitting(false)
  }

  const weight = Math.max(5, Math.min(20, Math.floor((profile?.trust_score || 0) / 5) + 5))

  return (
    <div className="page-sm" style={{ padding: '2rem 1rem' }}>
      <div className="page-header">
        <h1>Vouch for someone</h1>
        <p>Search for someone you trust personally. Your vouch increases their trust score and reflects on your own reputation.</p>
      </div>

      <div style={{ background: 'var(--green-pale)', border: '1px solid #B8E8D4', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: 13, color: 'var(--green-mid)', lineHeight: 1.6 }}>
          <strong>Your vouch weight: +{weight} pts</strong> — This grows as your own trust score increases. You can only vouch for each person once.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
          <input placeholder="Search by name, email or skill..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-green" disabled={searching} style={{ flexShrink: 0, padding: '12px 18px' }}>
            {searching ? '...' : 'Search'}
          </button>
        </form>
      </div>

      {results.length > 0 && !selected && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{results.length} result{results.length !== 1 ? 's' : ''} found — click to select</p>
          {results.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', marginBottom: '0.75rem', padding: '1rem' }}
              onClick={() => setSelected(r)}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                {r.full_name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, fontSize: 15 }}>{r.full_name}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{r.skill} · Current score: {r.trust_score || 0}</p>
              </div>
              <span style={{ fontSize: 13, color: 'var(--green-mid)', fontWeight: 500 }}>Select</span>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && search && !searching && (
        <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '1rem 0' }}>No users found for "{search}"</p>
      )}

      {selected && (
        <div className="card" style={{ borderTop: '3px solid var(--green-light)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
              {selected.full_name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 16 }}>{selected.full_name}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{selected.skill} · Score: {selected.trust_score || 0}</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', fontSize: 22, color: 'var(--muted)', border: 'none', cursor: 'pointer' }}>x</button>
          </div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
            Why do you trust this person? (optional but recommended)
          </label>
          <textarea
            placeholder="E.g. Chidi fixed my generator perfectly — very professional, honest pricing, came on time."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            style={{ marginBottom: 12, resize: 'vertical' }}
          />
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1rem' }}>
            Your vouch will add <strong>+{weight} points</strong> to their trust score.
          </p>
          {error && <p className="error" style={{ marginBottom: 10 }}>{error}</p>}
          <button className="btn btn-green btn-full" onClick={handleVouch} disabled={submitting}>
            {submitting ? 'Submitting vouch...' : `Vouch for ${selected.full_name}`}
          </button>
        </div>
      )}

      {success && (
        <div style={{ background: 'var(--green-pale)', border: '1px solid #B8E8D4', borderRadius: 12, padding: '1rem 1.25rem', marginTop: '1rem' }}>
          <p style={{ fontSize: 14, color: 'var(--green-mid)', fontWeight: 500, lineHeight: 1.6 }}>Success! {success}</p>
        </div>
      )}
    </div>
  )
}
