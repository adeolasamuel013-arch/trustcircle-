import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import Icon from '../components/Icon'
import TrustRing from '../components/TrustRing'

const SKILLS = ['All','Mechanic','Electrician','Plumber','Lawyer','Doctor','Accountant','Graphic Designer','Web Developer','Chef / Caterer','Tailor / Fashion','Hair Stylist','Photographer','Driver','Carpenter','Painter','Real Estate Agent','Teacher / Tutor','Other']

export default function Search() {
  const [query, setQuery] = useState('')
  const [skill, setSkill] = useState('All')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  async function doSearch(q, s) {
    setLoading(true); setSearched(true); setSelected(null)
    let r = supabase.from('profiles').select('id,full_name,skill,trust_score,vouch_count,avatar_url').order('trust_score', { ascending: false }).limit(20)
    if (q?.trim()) r = r.ilike('full_name', `%${q}%`)
    if (s && s !== 'All') r = r.eq('skill', s)
    const { data } = await r
    setResults(data || []); setLoading(false)
  }

  async function loadProfile(id) {
    const [{ data: p }, { data: v }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('vouches').select('*, voucher:profiles!vouches_voucher_id_fkey(id,full_name,skill,trust_score)').eq('vouchee_id', id).order('created_at', { ascending: false }).limit(5)
    ])
    setSelected({ ...p, vouches: v || [] })
  }

  return (
    <div className="page">
      <style>{`
        .results-layout { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width: 700px) { .results-layout { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 8 }}>Find trusted services</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem' }}>Search for people verified by Nigeria's trust network.</p>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={e => { e.preventDefault(); doSearch(query, skill) }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder="Search by name..." value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
          <select value={skill} onChange={e => { setSkill(e.target.value); doSearch(query, e.target.value) }} style={{ width: 160 }}>
            {SKILLS.map(s => <option key={s}>{s}</option>)}
          </select>
          <button type="submit" className="btn btn-green" disabled={loading} style={{ flexShrink: 0 }}>{loading ? '...' : 'Search'}</button>
        </form>
      </div>

      {!searched && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: '1rem' }}>Browse by category:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SKILLS.slice(1).map(s => (
              <button key={s} onClick={() => { setSkill(s); doSearch('', s) }} style={{ padding: '8px 14px', fontSize: 13, borderRadius: 999, background: 'white', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--dark)', fontFamily: 'DM Sans, sans-serif' }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="loader"><div className="spin" style={{ width: 28, height: 28 }} /></div>}

      {searched && !loading && (
        <div className="results-layout">
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '0.75rem' }}>{results.length} result{results.length !== 1 ? 's' : ''}</p>
            {results.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}><p>No results found. Try a different search.</p></div>
            ) : results.map(r => (
              <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', marginBottom: '0.75rem', padding: '1rem', borderLeft: selected?.id === r.id ? '3px solid var(--green-light)' : '1px solid var(--border)' }} onClick={() => loadProfile(r.id)}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                  {r.avatar_url ? <img src={r.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.full_name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: 15 }}>{r.full_name}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>{r.skill}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 20, color: 'var(--green)' }}>{r.trust_score || 0}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>{r.vouch_count || 0} vouches</p>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div>
              <div className="card" style={{ borderTop: '3px solid var(--green-light)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white' }}>
                    {selected.avatar_url ? <img src={selected.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selected.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 18, color: 'var(--green)' }}>{selected.full_name}</h2>
                    <span className="badge badge-green" style={{ marginTop: 4 }}>{selected.skill}</span>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', fontSize: 20, color: 'var(--muted)', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <TrustRing score={selected.trust_score || 0} size={100} />
                </div>
                {selected.bio && <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem', padding: '0.75rem', background: 'var(--cream)', borderRadius: 8 }}>{selected.bio}</p>}
                {selected.location && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1rem' }}>📍 {selected.location}</p>}
                {selected.vouches?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Recent vouches</p>
                    {selected.vouches.map(v => (
                      <div key={v.id} style={{ borderLeft: '2px solid var(--green-light)', paddingLeft: 10, marginBottom: 10 }}>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{v.voucher?.full_name}</p>
                        {v.message && <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--dark)', marginTop: 3 }}>"{v.message}"</p>}
                      </div>
                    ))}
                  </div>
                )}
                <Link to={`/vouch?to=${selected.id}`} style={{ display: 'block', marginTop: '1rem' }}>
                  <button className="btn btn-green btn-full">Vouch for {selected.full_name?.split(' ')[0]}</button>
                </Link>
                <Link to={`/profile/${selected.id}`} style={{ display: 'block', marginTop: 8 }}>
                  <button className="btn btn-outline btn-full">View full profile</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
