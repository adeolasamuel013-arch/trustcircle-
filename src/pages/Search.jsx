import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import TrustRing from '../components/TrustRing'
import Avatar from '../components/Avatar'

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
    let r = supabase.from('profiles').select('id,full_name,skill,trust_score,vouch_count,avatar_url,location').order('trust_score', { ascending: false }).limit(20)
    if (q?.trim()) r = r.ilike('full_name', `%${q}%`)
    if (s && s !== 'All') r = r.eq('skill', s)
    const { data } = await r
    setResults(data || []); setLoading(false)
  }

  async function loadProfile(id) {
    const [{ data: p }, { data: v }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('vouches').select('*, voucher:profiles!vouches_voucher_id_fkey(id,full_name,skill,trust_score,avatar_url)').eq('vouchee_id', id).order('created_at', { ascending: false }).limit(5)
    ])
    setSelected({ ...p, vouches: v || [] })
  }

  const trustLabel = (s) => s >= 70 ? 'Highly Trusted' : s >= 40 ? 'Growing' : s >= 20 ? 'Building' : 'New'
  const trustColor = (s) => s >= 70 ? 'var(--green-mid)' : s >= 40 ? '#9A6700' : 'var(--muted)'

  return (
    <div className="page">
      <style>{`
        .search-layout { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width:760px) { .search-layout { grid-template-columns: 1.2fr 1fr; } }
        .result-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 12px; cursor: pointer; transition: background 0.15s; border: 1.5px solid transparent; margin-bottom: 8px; background: var(--white); border-color: var(--border); }
        .result-item:hover { border-color: var(--green-light); background: var(--green-pale); }
        .result-item.active { border-color: var(--green); background: var(--green-pale); }
        .skill-pill { padding: 7px 14px; border-radius: 999px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1.5px solid var(--border); background: var(--white); color: var(--dark); font-family: DM Sans, sans-serif; transition: all 0.15s; white-space: nowrap; }
        .skill-pill:hover { border-color: var(--green-light); color: var(--green); }
        .skill-pill.active { background: var(--green); color: white; border-color: var(--green); }
      `}</style>

      <div className="page-header">
        <h1>Find trusted services</h1>
        <p>Search for people verified through real vouches from real people.</p>
      </div>

      {/* Search bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={e => { e.preventDefault(); doSearch(query, skill) }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              placeholder="Search by name..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, minWidth: 160 }}
            />
            <select value={skill} onChange={e => { setSkill(e.target.value); doSearch(query, e.target.value) }} style={{ width: 170 }}>
              {SKILLS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button type="submit" className="btn btn-green" disabled={loading} style={{ flexShrink: 0 }}>
              {loading ? <span className="spin" style={{ width: 16, height: 16 }} /> : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Browse by category */}
      {!searched && (
        <div>
          <p className="section-label">Browse by category</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SKILLS.slice(1).map(s => (
              <button key={s} className={`skill-pill ${skill === s ? 'active' : ''}`}
                onClick={() => { setSkill(s); doSearch('', s) }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="loader"><div className="spin" style={{ width: 28, height: 28 }} /></div>}

      {searched && !loading && (
        <div className="search-layout">
          {/* Results list */}
          <div>
            <p className="section-label">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            {results.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontWeight: 500, marginBottom: 4 }}>No results found</p>
                <p>Try a different name or category</p>
              </div>
            ) : results.map(r => (
              <div key={r.id} className={`result-item ${selected?.id === r.id ? 'active' : ''}`}
                onClick={() => loadProfile(r.id)}>
                <Avatar profile={r} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{r.full_name}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>{r.skill || 'No skill listed'}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, color: 'var(--green)', lineHeight: 1 }}>{r.trust_score || 0}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{r.vouch_count || 0} vouches</p>
                </div>
              </div>
            ))}
          </div>

          {/* Profile panel */}
          {selected ? (
            <div>
              <div className="card" style={{ position: 'sticky', top: 80 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: '1.25rem' }}>
                  <Avatar profile={selected} size={56} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: 18, color: 'var(--green)', marginBottom: 4 }}>{selected.full_name}</h2>
                    {selected.skill && <span className="badge badge-green">{selected.skill}</span>}
                    {selected.location && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>📍 {selected.location}</p>}
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
                </div>

                {/* Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--green-pale)', borderRadius: 12, marginBottom: '1.25rem' }}>
                  <TrustRing score={selected.trust_score || 0} size={72} />
                  <div>
                    <p style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{selected.trust_score || 0}</p>
                    <p style={{ fontSize: 13, color: 'var(--green-mid)', fontWeight: 500 }}>{trustLabel(selected.trust_score || 0)}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{selected.vouch_count || 0} people vouched</p>
                  </div>
                </div>

                {/* Bio */}
                {selected.bio && (
                  <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.25rem', padding: '0.875rem', background: 'var(--cream)', borderRadius: 10 }}>{selected.bio}</p>
                )}

                {/* Vouches */}
                {selected.vouches?.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p className="section-label">Recent vouches</p>
                    {selected.vouches.map(v => (
                      <div key={v.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                        <Avatar profile={v.voucher} size={32} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{v.voucher?.full_name}</p>
                          {v.message && <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.5 }}>"{v.message}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link to={`/vouch?to=${selected.id}`}>
                    <button className="btn btn-green btn-full">Vouch for {selected.full_name?.split(' ')[0]}</button>
                  </Link>
                  <Link to={`/profile/${selected.id}`}>
                    <button className="btn btn-ghost btn-full">View full profile</button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'none' }} />
          )}
        </div>
      )}
    </div>
  )
}
