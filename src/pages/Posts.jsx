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

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(id,full_name,skill,trust_score,avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50)
    setPosts(data || [])
    setLoading(false)
  }

  async function toggleLike(postId, liked, likeCount) {
    if (!user) { navigate('/login'); return }
    const newLiked = !liked
    const newCount = newLiked ? likeCount + 1 : likeCount - 1
    setPosts(p => p.map(x => x.id === postId ? { ...x, liked: newLiked, likes: newCount } : x))
    if (newLiked) {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    } else {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
    }
    await supabase.from('posts').update({ likes: newCount }).eq('id', postId)
  }

  function timeAgo(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    if (m < 1440) return `${Math.floor(m / 60)}h ago`
    if (m < 10080) return `${Math.floor(m / 1440)}d ago`
    return new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5' }}>
      <style>{`
        * { box-sizing: border-box; }
        .feed-container { max-width: 680px; margin: 0 auto; padding: 20px 16px 60px; }
        .feed-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; background: white; border-radius: 16px; padding: 14px 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .feed-topbar h1 { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0; }
        .feed-topbar p { font-size: 12px; color: #65676B; margin: 2px 0 0; }
        .post-btn { background: #1a7a4a; color: white; border: none; border-radius: 10px; padding: 10px 18px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: background 0.15s; white-space: nowrap; }
        .post-btn:hover { background: #155f39; }
        .post-card { background: white; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); margin-bottom: 16px; overflow: hidden; }
        .post-head { display: flex; align-items: center; gap: 11px; padding: 14px 16px 10px; }
        .post-head-info { flex: 1; min-width: 0; }
        .post-head-name { font-weight: 700; font-size: 14.5px; color: #1a1a1a; text-decoration: none; }
        .post-head-name:hover { text-decoration: underline; }
        .post-head-meta { display: flex; align-items: center; gap: 6px; margin-top: 2px; flex-wrap: wrap; }
        .skill-chip { background: #e8f5ee; color: #1a7a4a; font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 999px; }
        .post-time { font-size: 11px; color: #65676B; }
        .post-images { position: relative; background: #f0f2f5; cursor: pointer; }
        .post-images img { width: 100%; max-height: 520px; object-fit: cover; display: block; }
        .img-count-badge { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.55); color: white; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; backdrop-filter: blur(4px); }
        .post-caption-wrap { padding: 10px 16px 4px; font-size: 14.5px; color: #1a1a1a; line-height: 1.55; }
        .post-caption-wrap b { font-weight: 700; margin-right: 5px; }
        .post-stats { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; font-size: 13px; color: #65676B; border-bottom: 1px solid #e4e6eb; }
        .post-actions { display: flex; align-items: center; padding: 4px 8px; border-bottom: 1px solid #e4e6eb; }
        .post-action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 4px; border: none; background: none; border-radius: 8px; font-size: 14px; font-weight: 600; color: #65676B; font-family: inherit; cursor: pointer; transition: background 0.12s, color 0.12s; }
        .post-action-btn:hover { background: #f0f2f5; color: #1a1a1a; }
        .post-action-btn.liked { color: #E53E3E; }
        .post-action-btn.liked:hover { background: #fff0f0; }
        .comments-section { padding: 10px 16px 14px; }
        .comment-item { display: flex; gap: 9px; margin-bottom: 10px; align-items: flex-start; }
        .comment-bubble { background: #f0f2f5; border-radius: 14px; padding: 8px 12px; flex: 1; }
        .comment-author { font-weight: 700; font-size: 13px; color: #1a1a1a; margin-bottom: 2px; }
        .comment-text { font-size: 13.5px; color: #1a1a1a; line-height: 1.45; }
        .comment-time { font-size: 11px; color: #65676B; margin-top: 4px; padding-left: 2px; }
        .comment-input-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
        .comment-input { flex: 1; background: #f0f2f5; border: none; border-radius: 22px; padding: 9px 16px; font-size: 14px; font-family: inherit; outline: none; color: #1a1a1a; transition: background 0.15s; }
        .comment-input:focus { background: #e4e6eb; }
        .comment-send-btn { background: #1a7a4a; color: white; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
        .comment-send-btn:hover { background: #155f39; }
        .comment-send-btn:disabled { background: #ccc; cursor: not-allowed; }
        .share-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: white; padding: 12px 22px; border-radius: 999px; font-size: 14px; font-weight: 500; z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,0.25); animation: fadeInUp 0.2s ease; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(6px); }
        .modal-img-box { max-width: 900px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; align-items: center; position: relative; }
        .modal-img-box img { max-width: 100%; max-height: 85vh; object-fit: contain; border-radius: 12px; }
        .modal-close { position: absolute; top: -14px; right: -14px; background: white; border: none; border-radius: 50%; width: 36px; height: 36px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
        .modal-thumbs { display: flex; gap: 8px; margin-top: 10px; overflow-x: auto; padding: 4px; }
        .modal-thumbs img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid transparent; opacity: 0.7; transition: all 0.15s; }
        .modal-thumbs img.active { border-color: white; opacity: 1; }
        .create-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
        .create-modal { background: white; border-radius: 20px; width: 100%; max-width: 540px; max-height: 92vh; overflow-y: auto; }
        .create-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 14px; border-bottom: 1px solid #e4e6eb; position: sticky; top: 0; background: white; z-index: 1; border-radius: 20px 20px 0 0; }
        .create-modal-head h2 { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
        .upload-zone { border: 2px dashed #d0d5dd; border-radius: 14px; padding: 2rem; text-align: center; cursor: pointer; background: #fafafa; transition: border-color 0.2s, background 0.2s; }
        .upload-zone:hover { border-color: #1a7a4a; background: #f0faf4; }
        .preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .preview-grid img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 10px; }
        .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        @media(max-width: 600px) { .feed-container { padding: 12px 8px 60px; } .post-action-btn { font-size: 13px; gap: 5px; } }
      `}</style>

      <div className="feed-container">
        <div className="feed-topbar">
          <div>
            <h1>Work Showcase</h1>
            <p>Discover trusted service providers across Nigeria</p>
          </div>
          {user && profile?.skill ? (
            <button className="post-btn" onClick={() => setShowCreate(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Post
            </button>
          ) : user && !profile?.skill ? (
            <Link to="/edit-profile"><button className="post-btn" style={{ background: '#555' }}>Add skill to post</button></Link>
          ) : (
            <Link to="/login"><button className="post-btn">Sign in to post</button></Link>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: 32, height: 32, margin: '0 auto', border: '3px solid #e4e6eb', borderTopColor: '#1a7a4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: 52, marginBottom: 12 }}>📸</p>
            <p style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a', marginBottom: 8 }}>No posts yet</p>
            <p style={{ fontSize: 14, color: '#65676B', marginBottom: 20 }}>
              {user && profile?.skill ? 'Be the first to share your work!' : 'Service providers will post their work here soon.'}
            </p>
            {user && profile?.skill && <button className="post-btn" onClick={() => setShowCreate(true)} style={{ margin: '0 auto' }}>Share your work</button>}
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} user={user} onLike={toggleLike} timeAgo={timeAgo} navigate={navigate} />
          ))
        )}
      </div>

      {showCreate && <CreatePost profile={profile} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadPosts() }} />}
    </div>
  )
}

function PostCard({ post, user, onLike, timeAgo, navigate }) {
  const [imgIndex, setImgIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [comments, setComments] = useState([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [shareToast, setShareToast] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count || 0)
  const images = post.images || []
  const inputRef = useRef()

  async function loadComments() {
    if (commentsLoaded) return
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey(id,full_name,avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
      .limit(30)
    setComments(data || [])
    setCommentsLoaded(true)
  }

  async function toggleComments() {
    if (!showComments) await loadComments()
    setShowComments(v => !v)
    if (!showComments) setTimeout(() => inputRef.current?.focus(), 100)
  }

  async function submitComment(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!commentText.trim()) return
    setSubmitting(true)
    const { data: newComment } = await supabase
      .from('comments')
      .insert({ post_id: post.id, author_id: user.id, content: commentText.trim() })
      .select('*, author:profiles!comments_author_id_fkey(id,full_name,avatar_url)')
      .single()
    if (newComment) { setComments(c => [...c, newComment]); setCommentCount(n => n + 1) }
    setCommentText('')
    setSubmitting(false)
  }

  function handleShare() {
    const url = `${window.location.origin}/posts`
    if (navigator.share) {
      navigator.share({ title: `${post.author?.full_name} on Pruv`, text: post.caption || 'Check out this work!', url })
    } else {
      navigator.clipboard.writeText(url)
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2500)
    }
  }

  function tAgo(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m`
    if (m < 1440) return `${Math.floor(m / 60)}h`
    return `${Math.floor(m / 1440)}d`
  }

  return (
    <div className="post-card">
      <div className="post-head">
        <Link to={`/profile/${post.author?.id}`}><Avatar profile={post.author} size={42} /></Link>
        <div className="post-head-info">
          <Link to={`/profile/${post.author?.id}`} className="post-head-name">{post.author?.full_name}</Link>
          <div className="post-head-meta">
            <span className="skill-chip">{post.skill_tag}</span>
            <span className="post-time">· {timeAgo(post.created_at)}</span>
            {post.author?.trust_score > 0 && <span className="post-time">· ⭐ {post.author.trust_score} trust</span>}
          </div>
        </div>
        <Link to={`/profile/${post.author?.id}`}>
          <button style={{ background: '#e8f5ee', color: '#1a7a4a', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Profile</button>
        </Link>
      </div>

      {post.caption && images.length === 0 && (
        <div style={{ padding: '4px 16px 14px', fontSize: 16, color: '#1a1a1a', lineHeight: 1.6 }}>{post.caption}</div>
      )}

      {images.length > 0 && (
        <div className="post-images" onClick={() => setLightbox(true)}>
          <img src={images[imgIndex]} alt={post.caption} loading="lazy" />
          {images.length > 1 && <div className="img-count-badge">📷 {imgIndex + 1}/{images.length}</div>}
        </div>
      )}

      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 4, padding: '8px 12px 4px', overflowX: 'auto' }}>
          {images.map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => setImgIndex(i)}
              style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0, cursor: 'pointer', border: i === imgIndex ? '2.5px solid #1a7a4a' : '2px solid #e4e6eb', opacity: i === imgIndex ? 1 : 0.7, transition: 'all 0.15s' }} />
          ))}
        </div>
      )}

      {post.caption && images.length > 0 && (
        <div className="post-caption-wrap"><b>{post.author?.full_name?.split(' ')[0]}</b>{post.caption}</div>
      )}

      <div className="post-stats">
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {(post.likes || 0) > 0 && <span>❤️</span>}
          <span>{post.likes || 0} {post.likes === 1 ? 'like' : 'likes'}</span>
        </div>
        <button onClick={toggleComments} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#65676B', fontSize: 13, fontFamily: 'inherit' }}>
          {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      <div className="post-actions">
        <button className={`post-action-btn ${post.liked ? 'liked' : ''}`} onClick={() => onLike(post.id, post.liked, post.likes || 0)}>
          {post.liked
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#E53E3E" stroke="#E53E3E" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          }
          Like
        </button>
        <button className="post-action-btn" onClick={toggleComments}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Comment
        </button>
        <button className="post-action-btn" onClick={handleShare}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {comments.length === 0 && commentsLoaded && (
            <p style={{ fontSize: 13, color: '#65676B', textAlign: 'center', padding: '8px 0 4px' }}>No comments yet. Be the first!</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <Link to={`/profile/${c.author?.id}`}><Avatar profile={c.author} size={32} /></Link>
              <div style={{ flex: 1 }}>
                <div className="comment-bubble">
                  <p className="comment-author">{c.author?.full_name}</p>
                  <p className="comment-text">{c.content}</p>
                </div>
                <p className="comment-time">{tAgo(c.created_at)}</p>
              </div>
            </div>
          ))}
          <form className="comment-input-row" onSubmit={submitComment}>
            <Avatar profile={user ? { full_name: user.email } : null} size={34} />
            <input
              ref={inputRef}
              className="comment-input"
              placeholder={user ? 'Write a comment...' : 'Sign in to comment'}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              disabled={!user || submitting}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment(e)}
            />
            <button type="submit" className="comment-send-btn" disabled={!commentText.trim() || submitting || !user}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      )}

      {lightbox && images.length > 0 && (
        <div className="modal-bg" onClick={() => setLightbox(false)}>
          <div className="modal-img-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setLightbox(false)}>✕</button>
            <img src={images[imgIndex]} alt="" />
            {images.length > 1 && (
              <div className="modal-thumbs">
                {images.map((img, i) => <img key={i} src={img} alt="" className={i === imgIndex ? 'active' : ''} onClick={() => setImgIndex(i)} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {shareToast && <div className="share-toast">✅ Link copied to clipboard!</div>}
    </div>
  )
}

function CreatePost({ profile, onClose, onCreated }) {
  const { user } = useAuth()
  const [caption, setCaption] = useState('')
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  function handleFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, 5)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!caption.trim() && images.length === 0) { setError('Add a caption or at least one photo.'); return }
    setUploading(true)
    try {
      const urls = []
      for (const file of images) {
        if (file.size > 5 * 1024 * 1024) { setError('Each image must be under 5MB'); setUploading(false); return }
        const ext = file.name.split('.').pop()
        const path = `${user.id}/posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type })
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        urls.push(publicUrl)
      }
      await supabase.from('posts').insert({ author_id: user.id, caption: caption.trim() || null, images: urls, skill_tag: profile?.skill || 'Other', likes: 0 })
      onCreated()
    } catch { setError('Failed to post. Please try again.') }
    finally { setUploading(false) }
  }

  return (
    <div className="create-modal-bg" onClick={onClose}>
      <div className="create-modal" onClick={e => e.stopPropagation()}>
        <div className="create-modal-head">
          <h2>Create Post</h2>
          <button onClick={onClose} style={{ background: '#f0f2f5', border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Avatar profile={profile} size={42} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{profile?.full_name}</p>
              <span style={{ background: '#e8f5ee', color: '#1a7a4a', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 999 }}>🏷️ {profile?.skill || 'Other'}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <textarea
              placeholder={`What work did you do, ${profile?.full_name?.split(' ')[0] || 'there'}? Describe it...`}
              value={caption} onChange={e => setCaption(e.target.value)} rows={4}
              style={{ width: '100%', border: 'none', resize: 'none', outline: 'none', fontSize: 16, fontFamily: 'inherit', color: '#1a1a1a', lineHeight: 1.6, background: 'transparent' }}
            />
            {previews.length > 0 && (
              <div className="preview-grid">{previews.map((p, i) => <img key={i} src={p} alt="" />)}</div>
            )}
            <div className="upload-zone" onClick={() => fileRef.current?.click()}>
              {previews.length === 0 ? (
                <>
                  <p style={{ fontSize: 28, marginBottom: 6 }}>📸</p>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a', marginBottom: 4 }}>Add photos of your work</p>
                  <p style={{ fontSize: 12, color: '#65676B' }}>Up to 5 photos · JPG, PNG · Max 5MB each</p>
                </>
              ) : (
                <p style={{ fontSize: 14, color: '#1a7a4a', fontWeight: 600 }}>+ Add more photos</p>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
            {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #e4e6eb', paddingTop: 14 }}>
              <button type="submit" disabled={uploading}
                style={{ flex: 1, background: '#1a7a4a', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'Posting...' : 'Post'}
              </button>
              <button type="button" onClick={onClose}
                style={{ padding: '13px 20px', background: '#f0f2f5', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', color: '#1a1a1a' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
