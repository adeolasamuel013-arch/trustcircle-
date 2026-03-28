import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'

export default function Posts() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    let q = supabase.from('posts')
      .select('*, author:profiles!posts_author_id_fkey(id,full_name,skill,trust_score,avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50)
    const { data } = await q
    setPosts(data || [])
    setLoading(false)
  }

  async function toggleLike(postId, liked, likeCount) {
    if (!user) { navigate('/login'); return }
    const newLiked = !liked
    const newCount = newLiked ? likeCount + 1 : likeCount - 1
    setPosts(p => p.map(x => x.id === postId ? { ...x, liked: newLiked, likes: newCount } : x))
    if (selectedPost?.id === postId) setSelectedPost(s => ({ ...s, liked: newLiked, likes: newCount }))
    if (newLiked) {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
      await supabase.from('posts').update({ likes: newCount }).eq('id', postId)
    } else {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      await supabase.from('posts').update({ likes: newCount }).eq('id', postId)
    }
  }

  function timeAgo(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    if (m < 1440) return `${Math.floor(m / 60)}h ago`
    return `${Math.floor(m / 1440)}d ago`
  }

  return (
    <div className="page">
      <style>{`
        .posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .post-card { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
        .post-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .post-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; background: var(--cream); display: block; }
        .post-img-placeholder { width: 100%; aspect-ratio: 4/3; background: var(--green-pale); display: flex; align-items: center; justify-content: center; font-size: 40px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal-box { background: white; border-radius: 20px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; }
        @media(max-width:600px) { .posts-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 6 }}>Work Showcase</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>See real work from trusted service providers across Nigeria</p>
        </div>
        {user && profile?.skill && (
          <button onClick={() => setShowCreate(true)} className="btn btn-green" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Share your work
          </button>
        )}
        {user && !profile?.skill && (
          <Link to="/edit-profile">
            <button className="btn btn-outline" style={{ fontSize: 13 }}>Add your skill to post</button>
          </Link>
        )}
      </div>



      {/* Posts grid */}
      {loading ? (
        <div className="loader"><div className="spin" style={{ width: 28, height: 28 }} /></div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: 40, marginBottom: '1rem' }}>📸</p>
          <p style={{ fontWeight: 500, fontSize: 16, color: 'var(--dark)', marginBottom: 8 }}>No posts yet</p>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: '1.5rem' }}>
            {user && profile?.skill ? 'Be the first to share your work!' : 'Service providers will post their work here soon.'}
          </p>
          {user && profile?.skill && <button onClick={() => setShowCreate(true)} className="btn btn-green">Share your work</button>}
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
              {post.images?.[0]
                ? <img className="post-img" src={post.images[0]} alt={post.caption} loading="lazy" />
                : <div className="post-img-placeholder">📋</div>
              }
              <div style={{ padding: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Avatar profile={post.author} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{post.author?.full_name}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>{post.skill_tag}</p>
                  </div>
                  {post.images?.length > 1 && (
                    <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--cream)', padding: '2px 8px', borderRadius: 999 }}>+{post.images.length - 1}</span>
                  )}
                </div>
                {post.caption && <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.caption}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <button onClick={e => { e.stopPropagation(); toggleLike(post.id, post.liked, post.likes || 0) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: post.liked ? '#E53E3E' : 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }}>
                    <span style={{ fontSize: 16 }}>{post.liked ? '❤️' : '🤍'}</span>
                    {post.likes || 0}
                  </button>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(post.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post detail modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {selectedPost.images?.length > 0 && (
              <div style={{ position: 'relative' }}>
                <img src={selectedPost.images[0]} alt="" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: '20px 20px 0 0' }} />
                {selectedPost.images.length > 1 && (
                  <div style={{ display: 'flex', gap: 6, padding: '8px 16px', background: 'var(--cream)', overflowX: 'auto' }}>
                    {selectedPost.images.map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0, cursor: 'pointer', border: i === 0 ? '2px solid var(--green)' : '2px solid transparent' }} />
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                <Link to={`/profile/${selectedPost.author?.id}`} onClick={() => setSelectedPost(null)}>
                  <Avatar profile={selectedPost.author} size={46} />
                </Link>
                <div style={{ flex: 1 }}>
                  <Link to={`/profile/${selectedPost.author?.id}`} onClick={() => setSelectedPost(null)} style={{ fontWeight: 600, fontSize: 15, color: 'var(--dark)' }}>{selectedPost.author?.full_name}</Link>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                    <span className="badge badge-green" style={{ fontSize: 11 }}>{selectedPost.skill_tag}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Score: {selectedPost.author?.trust_score}</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{timeAgo(selectedPost.created_at)}</span>
              </div>
              {selectedPost.caption && <p style={{ fontSize: 15, color: 'var(--dark)', lineHeight: 1.7, marginBottom: '1rem' }}>{selectedPost.caption}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button onClick={() => toggleLike(selectedPost.id, selectedPost.liked, selectedPost.likes || 0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: selectedPost.liked ? '#E53E3E' : 'var(--muted)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                  <span style={{ fontSize: 22 }}>{selectedPost.liked ? '❤️' : '🤍'}</span>
                  {selectedPost.likes || 0} likes
                </button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link to={`/profile/${selectedPost.author?.id}`} onClick={() => setSelectedPost(null)}>
                    <button className="btn btn-green" style={{ padding: '9px 18px', fontSize: 13 }}>View profile</button>
                  </Link>
                  {user && user.id !== selectedPost.author?.id && (
                    <button onClick={() => { setSelectedPost(null); navigate(`/messages/${selectedPost.author?.id}`) }} className="btn btn-outline" style={{ padding: '9px 18px', fontSize: 13 }}>Message</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create post modal */}
      {showCreate && <CreatePost onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadPosts() }} profile={profile} />}
    </div>
  )
}

function CreatePost({ onClose, onCreated, profile }) {
  const { user } = useAuth()
  const [caption, setCaption] = useState('')
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  function handleFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, 5)
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setImages(files)
    setPreviews(newPreviews)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!caption.trim() && images.length === 0) { setError('Please add a caption or at least one image.'); return }
    setUploading(true)
    try {
      const uploadedUrls = []
      for (const file of images) {
        if (file.size > 5 * 1024 * 1024) { setError('Each image must be under 5MB'); setUploading(false); return }
        const ext = file.name.split('.').pop()
        const path = `${user.id}/posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type })
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        uploadedUrls.push(publicUrl)
      }
      await supabase.from('posts').insert({
        author_id: user.id,
        caption: caption.trim() || null,
        images: uploadedUrls,
        skill_tag: profile?.skill || 'Other',
        likes: 0
      })
      onCreated()
    } catch (err) {
      setError('Failed to post. Please try again.')
    } finally { setUploading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', z: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 200 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 20, color: 'var(--green)' }}>Share your work</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Image upload area */}
          <div onClick={() => fileRef.current?.click()}
            style={{ border: '2px dashed var(--border)', borderRadius: 14, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--cream)', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green-light)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {previews.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {previews.map((p, i) => (
                  <img key={i} src={p} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10 }} />
                ))}
              </div>
            ) : (
              <>
                <p style={{ fontSize: 32, marginBottom: 8 }}>📸</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark)', marginBottom: 4 }}>Upload photos of your work</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>Up to 5 photos · JPG, PNG or WebP · Max 5MB each</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Caption</label>
            <textarea placeholder="Describe your work — what did you do? Where? Any details that show your quality..." value={caption} onChange={e => setCaption(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ background: 'var(--green-pale)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🏷️</span>
            <p style={{ fontSize: 13, color: 'var(--green-mid)' }}>This post will be tagged as <strong>{profile?.skill || 'Other'}</strong></p>
          </div>

          {error && <p className="error">{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-green" style={{ flex: 1, padding: '13px' }} disabled={uploading}>
              {uploading ? 'Posting...' : 'Share post'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ padding: '13px 18px' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
