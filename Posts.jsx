import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import TrustRing from '../components/TrustRing'
import Avatar from '../components/Avatar'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  async function doSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setSearched(true); setSelected(null)
    const { data } = await supabase
      .from('profiles')
      .select('id,full_name,skill,trust_score,vouch_count,avatar_url,location')
      .or(`full_name.ilike.%${query}%,skill.ilike.%${query}%`)
      .order('trust_score', { ascending: false })
      .limit(20)
    setResults(data || [])
    setLoading(false)
  }

  async function loadProfile(id) {
    const [{ data: p }, { data: v }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('vouches')
        .select('*, voucher:profiles!vouches_voucher_id_fkey(id,full_name,skill,trust_score,avatar_url)')
        .eq('vouchee_id', id).order('created_at', { ascending: false }).limit(5)
    ])
    setSelected({ ...p, vouches: v || [] })
  }

  const trustLabel = s => s >= 70 ? 'Highly Trusted' : s >= 40 ? 'Growing' : s >= 20 ? 'Building' : 'New'
  const trustColor = s => s >= 70 ? 'var(--green-mid)' : s >= 40 ? '#9A6700' : 'var(--muted)'

  return (
    <div className="page">
      <style>{`
        .search-layout { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width: 760px) { .search-layout { grid-template-columns: 1.2fr 1fr; } }
        .result-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 12px; cursor: pointer; transition: all 0.15s; border: 1.5px solid var(--border); margin-bottom: 8px; background: var(--white); }
        .result-item:hover { border-color: var(--green-light); background: var(--green-pale); }
        .result-item.active { border-color: var(--green); background: var(--green-pale); }
      `}</style>

      <div className="page-header">
        <h1>Find trusted services</h1>
        <p>Search by name or skill — e.g. "mechanic", "Chidi", "lawyer"</p>
      </div>

      {/* Search bar */}
      <form onSubmit={doSearch} style={{ display: 'flex', gap: 10, marginBottom: '2rem' }}>
        <input
          placeholder='Try "mechanic Lagos" or "Funke"...'
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1 }}
          autoFocus
        />
        <button type="submit" className="btn btn-green" disabled={loading} style={{ flexShrink: 0 }}>
          {loading
            ? <span className="spin" style={{ width: 16, height: 16 }} />
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          }
        </button>
      </form>

      {/* Empty start state */}
      {!searched && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--dark)', marginBottom: 6 }}>Search for anyone</p>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 340, margin: '0 auto' }}>
            Type a name, skill or trade above. We'll show you the most trusted people ranked by real vouches.
          </p>
        </div>
      )}

      {loading && <div className="loader"><div className="spin" style={{ width: 28, height: 28 }} /></div>}

      {searched && !loading && (
        <div className="search-layout">
          {/* Results */}
          <div>
            {results.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--dark)' }}>No results for "{query}"</p>
                <p>Try a different name or skill</p>
              </div>
            ) : (
              <>
                <p className="section-label">{results.length} result{results.length !== 1 ? 's' : ''}</p>
                {results.map(r => (
                  <div key={r.id} className={`result-item ${selected?.id === r.id ? 'active' : ''}`}
                    onClick={() => loadProfile(r.id)}>
                    <Avatar profile={r} size={46} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{r.full_name}</p>
                      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                        {r.skill || 'No skill listed'}{r.location ? ` · ${r.location}` : ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, color: 'var(--green)', lineHeight: 1 }}>{r.trust_score || 0}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{r.vouch_count || 0} vouches</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Profile panel */}
          {selected && (
            <div>
              <div className="card" style={{ position: 'sticky', top: 80 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: '1.25rem' }}>
                  <Avatar profile={selected} size={56} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: 18, color: 'var(--green)', marginBottom: 4 }}>{selected.full_name}</h2>
                    {selected.skill && <span className="badge badge-green">{selected.skill}</span>}
                    {selected.location && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>📍 {selected.location}</p>}
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20, lineHeight: 1, padding: 4, flexShrink: 0 }}>✕</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--green-pale)', borderRadius: 12, marginBottom: '1.25rem' }}>
                  <TrustRing score={selected.trust_score || 0} size={68} />
                  <div>
                    <p style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{selected.trust_score || 0}</p>
                    <p style={{ fontSize: 13, color: trustColor(selected.trust_score || 0), fontWeight: 600, marginTop: 2 }}>{trustLabel(selected.trust_score || 0)}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{selected.vouch_count || 0} people vouched</p>
                  </div>
                </div>

                {selected.bio && (
                  <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.25rem', padding: '0.875rem', background: 'var(--cream)', borderRadius: 10 }}>{selected.bio}</p>
                )}

                {selected.vouches?.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p className="section-label">Recent vouches</p>
                    {selected.vouches.map(v => (
                      <div key={v.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                        <Avatar profile={v.voucher} size={30} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600 }}>{v.voucher?.full_name}</p>
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
          )}
        </div>
      )}
    </div>
  )
}
