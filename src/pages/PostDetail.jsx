import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)
  const [shareToast, setShareToast] = useState(false)
  const inputRef = useRef()

  useEffect(() => { loadPost() }, [id, user])

  async function loadPost() {
    setLoading(true)
    const { data: postData } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(id,full_name,skill,trust_score,avatar_url,bio)')
      .eq('id', id)
      .single()

    if (!postData) { setLoading(false); return }

    // Check if user liked this post
    let liked = false
    if (user) {
      const { data: likeData } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .single()
      liked = !!likeData
    }

    setPost({ ...postData, liked, likes: postData.likes || 0 })

    // Load comments
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey(id,full_name,avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    setComments(commentsData || [])
    setLoading(false)
  }

  async function toggleLike() {
    if (!user) { navigate('/login'); return }
    const newLiked = !post.liked
    const newCount = newLiked ? post.likes + 1 : post.likes - 1
    setPost(p => ({ ...p, liked: newLiked, likes: newCount }))
    if (newLiked) {
      await supabase.from('post_likes').insert({ post_id: id, user_id: user.id })
    } else {
      await supabase.from('post_likes').delete().eq('post_id', id).eq('user_id', user.id)
    }
    await supabase.from('posts').update({ likes: newCount }).eq('id', id)
  }

  async function submitComment(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert({ post_id: id, author_id: user.id, content: commentText.trim() })
      .select('*, author:profiles!comments_author_id_fkey(id,full_name,avatar_url)')
      .single()
    if (!error && newComment) {
      setComments(c => [...c, newComment])
      setCommentText('')
    }
    setSubmitting(false)
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: `${post.author?.full_name} on Pruv`, text: post.caption || 'Check out this work!', url })
    } else {
      navigator.clipboard.writeText(url)
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2500)
    }
  }

  function timeAgo(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    if (m < 1440) return `${Math.floor(m / 60)}h ago`
    if (m < 10080) return `${Math.floor(m / 1440)}d ago`
    return new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e4e6eb', borderTopColor: '#1a7a4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!post) return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 48 }}>😕</p>
      <p style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>Post not found</p>
      <Link to="/posts"><button style={{ background: '#1a7a4a', color: 'white', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Back to Showcase</button></Link>
    </div>
  )

  const images = post.images || []

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5' }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pd-container { max-width: 680px; margin: 0 auto; padding: 20px 16px 60px; }
        .back-btn { display: inline-flex; align-items: center; gap: 7px; color: #1a7a4a; font-weight: 600; font-size: 14px; background: white; border: none; border-radius: 10px; padding: 9px 16px; cursor: pointer; font-family: inherit; box-shadow: 0 1px 4px rgba(0,0,0,0.08); margin-bottom: 16px; text-decoration: none; transition: background 0.15s; }
        .back-btn:hover { background: #f0faf4; }
        .pd-card { background: white; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
        .pd-head { display: flex; align-items: center; gap: 11px; padding: 16px; }
        .pd-author-name { font-weight: 700; font-size: 15px; color: #1a1a1a; text-decoration: none; }
        .pd-author-name:hover { text-decoration: underline; }
        .skill-chip { background: #e8f5ee; color: #1a7a4a; font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 999px; }
        .pd-images { position: relative; background: #f0f2f5; }
        .pd-images img { width: 100%; max-height: 600px; object-fit: cover; display: block; }
        .img-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.45); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; backdrop-filter: blur(4px); transition: background 0.15s; }
        .img-nav:hover { background: rgba(0,0,0,0.65); }
        .img-count-badge { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.55); color: white; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; }
        .pd-caption { padding: 12px 16px 8px; font-size: 15px; color: #1a1a1a; line-height: 1.6; }
        .pd-caption b { font-weight: 700; margin-right: 6px; }
        .pd-stats { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; font-size: 13px; color: #65676B; border-top: 1px solid #e4e6eb; border-bottom: 1px solid #e4e6eb; }
        .pd-actions { display: flex; align-items: center; padding: 4px 8px; border-bottom: 1px solid #e4e6eb; }
        .action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 4px; border: none; background: none; border-radius: 8px; font-size: 14px; font-weight: 600; color: #65676B; font-family: inherit; cursor: pointer; transition: background 0.12s, color 0.12s; }
        .action-btn:hover { background: #f0f2f5; color: #1a1a1a; }
        .action-btn.liked { color: #E53E3E; }
        .comments-wrap { padding: 12px 16px 16px; }
        .comment-item { display: flex; gap: 9px; margin-bottom: 12px; }
        .comment-bubble { background: #f0f2f5; border-radius: 14px; padding: 9px 13px; flex: 1; }
        .comment-author { font-weight: 700; font-size: 13px; color: #1a1a1a; margin-bottom: 3px; }
        .comment-text { font-size: 14px; color: #1a1a1a; line-height: 1.5; }
        .comment-time { font-size: 11px; color: #65676B; margin-top: 5px; padding-left: 2px; }
        .comment-form { display: flex; align-items: center; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e4e6eb; }
        .comment-input { flex: 1; background: #f0f2f5; border: none; border-radius: 22px; padding: 10px 16px; font-size: 14px; font-family: inherit; outline: none; color: #1a1a1a; }
        .comment-input:focus { background: #e4e6eb; }
        .send-btn { background: #1a7a4a; color: white; border: none; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .send-btn:hover { background: #155f39; }
        .send-btn:disabled { background: #ccc; cursor: not-allowed; }
        .share-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: white; padding: 12px 22px; border-radius: 999px; font-size: 14px; font-weight: 500; z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,0.25); }
        .author-card { background: white; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); padding: 16px; margin-top: 16px; }
        @media(max-width:600px) { .pd-container { padding: 12px 8px 60px; } }
      `}</style>

      <div className="pd-container">
        {/* Back button */}
        <Link to="/posts" className="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Showcase
        </Link>

        <div className="pd-card">
          {/* Author header */}
          <div className="pd-head">
            <Link to={`/profile/${post.author?.id}`}><Avatar profile={post.author} size={46} /></Link>
            <div style={{ flex: 1 }}>
              <Link to={`/profile/${post.author?.id}`} className="pd-author-name">{post.author?.full_name}</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                <span className="skill-chip">{post.skill_tag}</span>
                {post.author?.trust_score > 0 && <span style={{ fontSize: 11, color: '#65676B' }}>⭐ {post.author.trust_score} trust score</span>}
                <span style={{ fontSize: 11, color: '#65676B' }}>· {timeAgo(post.created_at)}</span>
              </div>
            </div>
            <Link to={`/profile/${post.author?.id}`}>
              <button style={{ background: '#e8f5ee', color: '#1a7a4a', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>View Profile</button>
            </Link>
          </div>

          {/* Caption above if no image */}
          {post.caption && images.length === 0 && (
            <div style={{ padding: '4px 16px 16px', fontSize: 16, color: '#1a1a1a', lineHeight: 1.65 }}>{post.caption}</div>
          )}

          {/* Images with nav arrows */}
          {images.length > 0 && (
            <>
              <div className="pd-images">
                <img src={images[imgIndex]} alt={post.caption} />
                {images.length > 1 && <>
                  <button className="img-nav" style={{ left: 10 }} onClick={() => setImgIndex(i => Math.max(0, i - 1))} disabled={imgIndex === 0}>‹</button>
                  <button className="img-nav" style={{ right: 10 }} onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))} disabled={imgIndex === images.length - 1}>›</button>
                  <div className="img-count-badge">{imgIndex + 1} / {images.length}</div>
                </>}
              </div>
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 4, padding: '8px 12px', overflowX: 'auto' }}>
                  {images.map((img, i) => (
                    <img key={i} src={img} alt="" onClick={() => setImgIndex(i)}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0, cursor: 'pointer', border: i === imgIndex ? '2.5px solid #1a7a4a' : '2px solid #e4e6eb', opacity: i === imgIndex ? 1 : 0.65, transition: 'all 0.15s' }} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Caption below image */}
          {post.caption && images.length > 0 && (
            <div className="pd-caption"><b>{post.author?.full_name?.split(' ')[0]}</b>{post.caption}</div>
          )}

          {/* Stats */}
          <div className="pd-stats">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {post.likes > 0 && <span>❤️</span>}
              <span>{post.likes} {post.likes === 1 ? 'like' : 'likes'}</span>
            </div>
            <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
          </div>

          {/* Actions */}
          <div className="pd-actions">
            <button className={`action-btn ${post.liked ? 'liked' : ''}`} onClick={toggleLike}>
              {post.liked
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#E53E3E" stroke="#E53E3E" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              }
              Like
            </button>
            <button className="action-btn" onClick={() => inputRef.current?.focus()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Comment
            </button>
            <button className="action-btn" onClick={handleShare}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
          </div>

          {/* Comments */}
          <div className="comments-wrap">
            {comments.length === 0 && (
              <p style={{ fontSize: 13, color: '#65676B', textAlign: 'center', padding: '8px 0' }}>No comments yet. Be the first!</p>
            )}
            {comments.map(c => (
              <div key={c.id} className="comment-item">
                <Link to={`/profile/${c.author?.id}`}><Avatar profile={c.author} size={34} /></Link>
                <div style={{ flex: 1 }}>
                  <div className="comment-bubble">
                    <p className="comment-author">{c.author?.full_name}</p>
                    <p className="comment-text">{c.content}</p>
                  </div>
                  <p className="comment-time">{timeAgo(c.created_at)}</p>
                </div>
              </div>
            ))}

            <form className="comment-form" onSubmit={submitComment}>
              <Avatar profile={user ? { full_name: user.email } : null} size={36} />
              <input
                ref={inputRef}
                className="comment-input"
                placeholder={user ? 'Write a comment...' : 'Sign in to comment'}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                disabled={!user || submitting}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) submitComment(e) }}
              />
              <button type="submit" className="send-btn" disabled={!commentText.trim() || submitting || !user}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </form>
          </div>
        </div>

        {/* Author info card */}
        <div className="author-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: post.author?.bio ? 12 : 0 }}>
            <Link to={`/profile/${post.author?.id}`}><Avatar profile={post.author} size={52} /></Link>
            <div style={{ flex: 1 }}>
              <Link to={`/profile/${post.author?.id}`} style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', textDecoration: 'none' }}>{post.author?.full_name}</Link>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span className="skill-chip">{post.author?.skill}</span>
                {post.author?.trust_score > 0 && <span style={{ fontSize: 12, color: '#65676B' }}>⭐ {post.author.trust_score} trust score</span>}
              </div>
            </div>
          </div>
          {post.author?.bio && <p style={{ fontSize: 14, color: '#65676B', lineHeight: 1.6, marginBottom: 14 }}>{post.author.bio}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to={`/profile/${post.author?.id}`} style={{ flex: 1 }}>
              <button style={{ width: '100%', background: '#1a7a4a', color: 'white', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>View Full Profile</button>
            </Link>
            {user && user.id !== post.author?.id && (
              <Link to={`/vouch?to=${post.author?.id}`} style={{ flex: 1 }}>
                <button style={{ width: '100%', background: '#e8f5ee', color: '#1a7a4a', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Vouch for them</button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {shareToast && <div className="share-toast">✅ Link copied to clipboard!</div>}
    </div>
  )
}
