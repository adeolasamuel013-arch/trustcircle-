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
        .feed-wrap {
          max-width: 600px;
          margin: 0 auto;
        }
        .feed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.75rem;
        }
        .post-card {
          background: white;
          border-radius: 18px;
          border: 1px solid var(--border);
          margin-bottom: 1.25rem;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .post-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .post-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
        }
        .post-author-info { flex: 1; min-width: 0; }
        .post-author-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--dark);
          margin-bottom: 2px;
        }
        .post-meta {
          font-size: 12px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .post-image-wrap {
          width: 100%;
          background: var(--cream);
          position: relative;
          cursor: pointer;
        }
        .post-image-wrap img {
          width: 100%;
          max-height: 500px;
          object-fit: cover;
          display: block;
        }
        .post-placeholder {
          width: 100%;
          min-height: 200px;
          background: var(--green-pale);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          cursor: pointer;
        }
        .multi-img-dots {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
        }
        .img-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
        }
        .img-dot.active { background: white; }
        .post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 10px 14px 4px;
        }
        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 10px;
          font-size: 13px;
          font-family: DM Sans, sans-serif;
          font-weight: 500;
          color: var(--muted);
          transition: background 0.15s, color 0.15s;
        }
        .action-btn:hover { background: var(--cream); }
        .action-btn.liked { color: #E53E3E; }
        .post-caption {
          padding: 4px 16px 14px;
          font-size: 14px;
          color: var(--dark);
          line-height: 1.6;
        }
        .post-caption strong {
          color: var(--green-mid);
          margin-right: 6px;
          font-weight: 600;
        }
        .img-strip {
          display: flex;
          gap: 3px;
          overflow-x: auto;
          padding: 0 16px 12px;
          scrollbar-width: none;
        }
        .img-strip::-webkit-scrollbar { display: none; }
        .img-strip img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 10px;
          flex-shrink: 0;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.15s;
        }
        .img-strip img:hover { border-color: var(--green); }
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.8);
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          backdrop-filter: blur(4px);
        }
        .modal-box {
          background: white;
          border-radius: 20px;
          max-width: 680px;
          width: 100%;
          max-height: 92vh;
          overflow-y: auto;
        }
        .modal-img { width: 100%; max-height: 420px; object-fit: cover; border-radius: 20px 20px 0 0; display: block; }
        .modal-body { padding: 1.25rem; }
        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--green-pale);
          color: var(--green-mid);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 999px;
        }
        .share-btn {
          background: var(--green);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 11px 22px;
          font-size: 14px;
          font-weight: 600;
          font-family: DM Sans, sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.15s;
        }
        .share-btn:hover { opacity: 0.88; }
        .empty-feed {
          text-align: center;
          padding: 5rem 2rem;
          background: white;
          border-radius: 20px;
          border: 1px solid var(--border);
        }
        @media(max-width: 600px) {
          .feed-wrap { max-width: 100%; }
        }
      `}</style>

      <div className="feed-wrap">
        {/* Header */}
        <div className="feed-header">
          <div>
            <h1 style={{ fontSize: 24, color: 'var(--green)', marginBottom: 4, fontFamily: 'Fraunces, serif' }}>Work Showcase</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Real work from trusted service providers</p>
          </div>
          {user && profile?.skill ? (
            <button onClick={() => setShowCreate(true)} className="share-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Post
            </button>
          ) : user && !profile?.skill ? (
            <Link to="/edit-profile">
              <button className="btn btn-outline" style={{ fontSize: 13 }}>Add skill to post</button>
            </Link>
          ) : null}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="loader"><div className="spin" style={{ width: 28, height: 28 }} /></div>
        ) : posts.length === 0 ? (
          <div className="empty-feed">
            <p style={{ fontSize: 48, marginBottom: '1rem' }}>📸</p>
            <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--dark)', marginBottom: 8 }}>No posts yet</p>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: '1.5rem' }}>
              {user && profile?.skill ? 'Be the first to share your work!' : 'Service providers will post their work here soon.'}
            </p>
            {user && profile?.skill && (
              <button onClick={() => setShowCreate(true)} className="share-btn" style={{ margin: '0 auto' }}>Share your work</button>
            )}
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} onLike={toggleLike} onOpen={setSelectedPost} timeAgo={timeAgo} user={user} />
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {selectedPost.images?.length > 0 && (
              <>
                <img className="modal-img" src={selectedPost.images[0]} alt="" />
                {selectedPost.images.length > 1 && (
                  <div style={{ display: 'flex', gap: 6, padding: '10px 16px', background: 'var(--cream)', overflowX: 'auto' }}>
                    {selectedPost.images.map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0, cursor: 'pointer', border: i === 0 ? '2px solid var(--green)' : '2px solid transparent' }} />
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                <Link to={`/profile/${selectedPost.author?.id}`} onClick={() => setSelectedPost(null)}>
                  <Avatar profile={selectedPost.author} size={46} />
                </Link>
                <div style={{ flex: 1 }}>
                  <Link to={`/profile/${selectedPost.author?.id}`} onClick={() => setSelectedPost(null)} style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark)' }}>
                    {selectedPost.author?.full_name}
                  </Link>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    <span className="trust-badge">🏷️ {selectedPost.skill_tag}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>⭐ {selectedPost.author?.trust_score} trust score</span>
                  </div>
                </div>
                <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 22, padding: 4 }}>✕</button>
              </div>

              {selectedPost.caption && (
                <p style={{ fontSize: 15, color: 'var(--dark)', lineHeight: 1.7, marginBottom: '1rem', padding: '0.875rem', background: 'var(--cream)', borderRadius: 12 }}>
                  {selectedPost.caption}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                <button
                  onClick={() => toggleLike(selectedPost.id, selectedPost.liked, selectedPost.likes || 0)}
                  className={`action-btn ${selectedPost.liked ? 'liked' : ''}`}
                  style={{ fontSize: 15 }}
                >
                  <span style={{ fontSize: 22 }}>{selectedPost.liked ? '❤️' : '🤍'}</span>
                  {selectedPost.likes || 0} likes
                </button>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{timeAgo(selectedPost.created_at)}</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Link to={`/profile/${selectedPost.author?.id}`} onClick={() => setSelectedPost(null)} style={{ flex: 1 }}>
                  <button className="btn btn-green btn-full" style={{ padding: '12px' }}>View Profile</button>
                </Link>
                {user && user.id !== selectedPost.author?.id && (
                  <button
                    onClick={() => { setSelectedPost(null); navigate(`/messages/${selectedPost.author?.id}`) }}
                    className="btn btn-outline"
                    style={{ padding: '12px 18px' }}
                  >
                    Message
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreate && (
        <CreatePost
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadPosts() }}
          profile={profile}
        />
      )}
    </div>
  )
}

function PostCard({ post, onLike, onOpen, timeAgo, user }) {
  const [imgIndex, setImgIndex] = useState(0)
  const images = post.images || []

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <Avatar profile={post.author} size={40} />
        <div className="post-author-info">
          <p className="post-author-name">{post.author?.full_name}</p>
          <div className="post-meta">
            <span style={{ background: 'var(--green-pale)', color: 'var(--green-mid)', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
              {post.skill_tag}
            </span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>
        </div>
        <Link to={`/profile/${post.author?.id}`}>
          <button style={{ background: 'var(--green-pale)', color: 'var(--green-mid)', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            View
          </button>
        </Link>
      </div>

      {/* Image */}
      <div className="post-image-wrap" onClick={() => onOpen(post)}>
        {images.length > 0 ? (
          <>
            <img src={images[imgIndex]} alt={post.caption} loading="lazy" />
            {images.length > 1 && (
              <div className="multi-img-dots">
                {images.map((_, i) => (
                  <div key={i} className={`img-dot ${i === imgIndex ? 'active' : ''}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="post-placeholder">📋</div>
        )}
      </div>

      {/* Thumbnail strip for multiple images */}
      {images.length > 1 && (
        <div className="img-strip">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              onClick={() => setImgIndex(i)}
              style={{ border: i === imgIndex ? '2px solid var(--green)' : '2px solid transparent' }}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`action-btn ${post.liked ? 'liked' : ''}`}
          onClick={e => { e.stopPropagation(); onLike(post.id, post.liked, post.likes || 0) }}
        >
          <span style={{ fontSize: 20 }}>{post.liked ? '❤️' : '🤍'}</span>
          <span>{post.likes || 0}</span>
        </button>
        <button className="action-btn" onClick={() => onOpen(post)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>View</span>
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="post-caption">
          <strong>{post.author?.full_name?.split(' ')[0]}</strong>
          {post.caption}
        </div>
      )}
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: 22, width: '100%', maxWidth: 520, padding: '1.75rem', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 20, color: 'var(--green)', fontFamily: 'Fraunces, serif' }}>Share your work</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: '2px dashed var(--border)', borderRadius: 16, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--cream)', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {previews.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {previews.map((p, i) => (
                  <img key={i} src={p} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12 }} />
                ))}
                <div style={{ width: 90, height: 90, borderRadius: 12, border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--muted)' }}>+</div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 36, marginBottom: 8 }}>📸</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)', marginBottom: 4 }}>Upload photos of your work</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>Up to 5 photos · JPG, PNG or WebP · Max 5MB each</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--dark)' }}>Caption</label>
            <textarea
              placeholder="Describe your work — what did you do? Where? Any details that show your quality..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', width: '100%', borderRadius: 12, border: '1.5px solid var(--border)', padding: '10px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}
            />
          </div>

          <div style={{ background: 'var(--green-pale)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🏷️</span>
            <p style={{ fontSize: 13, color: 'var(--green-mid)' }}>Tagged as <strong>{profile?.skill || 'Other'}</strong></p>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-green" style={{ flex: 1, padding: '13px', fontSize: 15 }} disabled={uploading}>
              {uploading ? 'Posting...' : '📤 Share post'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ padding: '13px 18px' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
