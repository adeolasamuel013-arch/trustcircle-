import { useState } from 'react'
import { supabase } from '../supabase'
import TrustRing from '../components/TrustRing'

const SKILLS = [
  'All', 'Mechanic', 'Electrician', 'Plumber', 'Lawyer', 'Doctor', 'Accountant',
  'Graphic Designer', 'Web Developer', 'Chef / Caterer', 'Tailor / Fashion',
  'Hair Stylist', 'Photographer', 'Driver', 'Carpenter', 'Painter',
  'Real Estate Agent', 'Teacher / Tutor', 'Other'
]

export default function Search() {
  const [query, setQuery] = useState('')
  const [skill, setSkill] = useState('All')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    setSelected(null)

    let q = supabase
      .from('profiles')
      .select('id, full_name, skill, trust_score, vouch_count')
      .order('trust_score', { ascending: false })
      .limit(20)

    if (query.trim()) q = q.ilike('full_name', `%${query}%`)
    if (skill !== 'All') q = q.eq('skill', skill)

    const { data } = await q
    setResults(data || [])
    setLoading(false)
  }

  async function loadProfile(id) {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', id).single()
    const { data: vouchData } = await supabase
      .from('vouches')
      .select('*, voucher:profiles!vouches_voucher_id_fkey(full_name, skill, trust_score)')
      .eq('vouchee_id', id)
      .order('created_at', { ascending: false })
      .limit(5)
    setSelected({ ...prof, vouches: vouchData || [] })
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 5%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 8 }}>Find trusted services</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Search for people verified by Nigeria's trust network.</p>
      </div>

      {/* Search bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            placeholder="Search by name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <select value={skill} onChange={e => setSkill(e.target.value)} style={{ width: 180 }}>
            {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="btn-primary" disabled={loading} style={{ flexShrink: 0 }}>
            {loading ? '...' : 'Search'}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Results list */}
        <div>
          {loading && <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 28, height: 28 }}></div></div>}

          {!loading && searched && results.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted)' }}>
              <p style={{ fontSize: 14 }}>No results found. Try a different skill or name.</p>
            </div>
          )}

          {!loading && !searched && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {SKILLS.slice(1).map(s => (
                <button key={s} onClick={() => { setSkill(s); setSearched(true); setLoading(true); supabase.from('profiles').select('id, full_name, skill, trust_score, vouch_count').eq('skill', s).order('trust_score', { ascending: false }).limit(20).then(({ data }) => { setResults(data || []); setLoading(false) }) }}
                  style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: 13, color: 'var(--dark)', textAlign: 'left' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{results.length} result{results.length !== 1 ? 's' : ''}</p>
              {results.map(r => (
                <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'border-color 0.2s', borderLeft: selected?.id === r.id ? '3px solid var(--green-light)' : '1px solid var(--border)' }}
                  onClick={() => loadProfile(r.id)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green-light)'}
                  onMouseLeave={e => { if (selected?.id !== r.id) e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                    {r.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: 15 }}>{r.full_name}</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)' }}>{r.skill}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>{r.trust_score || 0}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>{r.vouch_count || 0} vouches</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile detail */}
        {selected && (
          <div>
            <div className="card" style={{ borderTop: '3px solid var(--green-light)', position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white' }}>
                  {selected.full_name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 18, color: 'var(--green)' }}>{selected.full_name}</h2>
                  <span className="badge badge-green" style={{ marginTop: 4 }}>{selected.skill}</span>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', fontSize: 18, color: 'var(--muted)' }}>✕</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <TrustRing score={selected.trust_score || 0} size={100} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ background: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--green-mid)', marginBottom: 2 }}>Trust score</p>
                  <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, color: 'var(--green)' }}>{selected.trust_score || 0}</p>
                </div>
                <div style={{ background: 'var(--amber-light)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#9A6700', marginBottom: 2 }}>Vouches</p>
                  <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, color: '#9A6700' }}>{selected.vouch_count || 0}</p>
                </div>
              </div>

              {selected.vouches?.length > 0 && (
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 10 }}>Recent vouches</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selected.vouches.map(v => (
                      <div key={v.id} style={{ borderLeft: '2px solid var(--green-light)', paddingLeft: 10 }}>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{v.voucher?.full_name}</p>
                        <p style={{ fontSize: 12, color: 'var(--muted)' }}>{v.voucher?.skill} · Score: {v.voucher?.trust_score}</p>
                        {v.message && <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--dark)', marginTop: 3 }}>"{v.message}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
