import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const { user, profile } = useAuth()
  const { chatWith } = useParams()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [activePerson, setActivePerson] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvos, setLoadingConvos] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const activeChatRef = useRef(null)

  useEffect(() => {
    if (!user) return
    loadConversations()
    const channel = supabase.channel(`inbox-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, async (payload) => {
        if (payload.new.sender_id === activeChatRef.current) {
          setMessages(m => [...m, payload.new])
          await supabase.from('messages').update({ read: true }).eq('id', payload.new.id)
        }
        loadConversations()
      })
      .subscribe()
    const poll = setInterval(() => {
      if (activeChatRef.current) refreshMessages(activeChatRef.current)
      loadConversations()
    }, 5000)
    return () => { supabase.removeChannel(channel); clearInterval(poll) }
  }, [user])

  useEffect(() => { activeChatRef.current = activeChat }, [activeChat])

  useEffect(() => {
    if (chatWith && user) openChat(chatWith)
  }, [chatWith, user])

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
  }, [messages])

  async function loadConversations() {
    if (!user) return
    const { data: sent } = await supabase.from('messages').select('receiver_id').eq('sender_id', user.id)
    const { data: received } = await supabase.from('messages').select('sender_id').eq('receiver_id', user.id)
    const ids = [...new Set([...(sent || []).map(m => m.receiver_id), ...(received || []).map(m => m.sender_id)])]
    if (ids.length === 0) { setLoadingConvos(false); setConversations([]); return }
    const { data: people } = await supabase.from('profiles').select('id,full_name,skill,trust_score').in('id', ids)
    const convos = await Promise.all((people || []).map(async p => {
      const { data: last } = await supabase.from('messages')
        .select('content,created_at,sender_id,read')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${p.id}),and(sender_id.eq.${p.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: false }).limit(1)
      const { count: unread } = await supabase.from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', p.id).eq('receiver_id', user.id).eq('read', false)
      return { person: p, lastMessage: last?.[0] || null, unread: unread || 0 }
    }))
    convos.sort((a, b) => new Date(b.lastMessage?.created_at || 0) - new Date(a.lastMessage?.created_at || 0))
    setConversations(convos)
    setLoadingConvos(false)
  }

  async function refreshMessages(personId) {
    const { data: msgs } = await supabase.from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${personId}),and(sender_id.eq.${personId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    if (msgs) setMessages(msgs)
    await supabase.from('messages').update({ read: true })
      .eq('sender_id', personId).eq('receiver_id', user.id).eq('read', false)
  }

  async function openChat(personId) {
    setLoadingChat(true)
    setActiveChat(personId)
    activeChatRef.current = personId
    const { data: person } = await supabase.from('profiles')
      .select('id,full_name,skill,trust_score,location').eq('id', personId).single()
    setActivePerson(person)
    await refreshMessages(personId)
    setConversations(c => c.map(x => x.person.id === personId ? { ...x, unread: 0 } : x))
    setLoadingChat(false)
    setTimeout(() => { inputRef.current?.focus() }, 150)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMsg.trim() || !activeChat || sending) return
    setSending(true)
    const content = newMsg.trim()
    setNewMsg('')
    const temp = { id: `tmp-${Date.now()}`, sender_id: user.id, receiver_id: activeChat, content, read: false, created_at: new Date().toISOString() }
    setMessages(m => [...m, temp])
    const { data: saved } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: activeChat, content, read: false }).select().single()
    if (saved) {
      setMessages(m => m.map(x => x.id === temp.id ? saved : x))
      setConversations(c => c.map(x => x.person.id === activeChat ? { ...x, lastMessage: saved } : x))

      // Send email notification (fire and forget)
      if (activePerson?.email) {
        supabase.functions.invoke('notify-message', {
          body: {
            receiverName: activePerson.full_name,
            receiverEmail: activePerson.email,
            senderName: profile?.full_name || 'Someone',
            messagePreview: content,
            senderId: user.id,
          },
        }).catch(() => {})
      }
    }
    setSending(false)
  }

  function goBack() {
    setActiveChat(null); setActivePerson(null); setMessages([])
    navigate('/messages')
  }

  function formatTime(d) {
    const date = new Date(d)
    const isToday = date.toDateString() === new Date().toDateString()
    return isToday
      ? date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function timeAgo(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'now'; if (m < 60) return `${m}m`
    if (m < 1440) return `${Math.floor(m / 60)}h`; return `${Math.floor(m / 1440)}d`
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        .msg-sidebar {
          width: 300px; min-width: 260px; border-right: 1px solid var(--border);
          display: flex; flex-direction: column; background: white; flex-shrink: 0;
        }
        .msg-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .convo-row {
          display: flex; align-items: center; gap: 12px; padding: 13px 14px;
          cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.1s;
        }
        .convo-row:hover { background: var(--cream); }
        .convo-row.active { background: var(--green-pale); border-left: 3px solid var(--green); }
        .msg-bubble {
          display: inline-block;
          padding: 9px 14px;
          border-radius: 18px;
          font-size: 15px;
          line-height: 1.5;
          word-break: break-word;
          white-space: pre-wrap;
          max-width: 100%;
        }
        .msg-sent { background: var(--green); color: white; border-bottom-right-radius: 4px; }
        .msg-received { background: #F0F0F0; color: var(--dark); border-bottom-left-radius: 4px; }
        .msg-input-box {
          flex: 1; resize: none; border-radius: 22px; padding: 11px 16px;
          font-size: 15px; min-height: 46px; max-height: 120px;
          line-height: 1.5; border: 1.5px solid var(--border); outline: none;
          font-family: DM Sans, sans-serif; transition: border-color 0.2s; overflow-y: auto;
        }
        .msg-input-box:focus { border-color: var(--green-mid); }
        .send-btn {
          width: 46px; height: 46px; border-radius: 50%; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.2s;
        }
        @media (max-width: 680px) {
          .msg-sidebar { width: 100% !important; min-width: unset !important; border-right: none; }
          .msg-sidebar { display: ${activeChat ? 'none' : 'flex'} !important; }
          .msg-main { display: ${activeChat ? 'flex' : 'none'} !important; }
        }
      `}</style>

      {/* SIDEBAR */}
      <div className="msg-sidebar">
        <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white' }}>
          <div>
            <h2 style={{ fontSize: 17, color: 'var(--green)', fontFamily: 'Fraunces, serif', display: 'flex', alignItems: 'center', gap: 8 }}>
              Messages
              {totalUnread > 0 && <span style={{ background: 'var(--amber)', color: 'white', borderRadius: 999, fontSize: 11, padding: '2px 8px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>{totalUnread}</span>}
            </h2>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Live updates</p>
          </div>
          <Link to="/search">
            <button className="btn btn-green" style={{ padding: '7px 14px', fontSize: 13 }}>+ New chat</button>
          </Link>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingConvos ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
              <div className="spin" style={{ width: 26, height: 26 }} />
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.25rem', color: 'var(--muted)' }}>
              <p style={{ fontSize: 38, marginBottom: '0.875rem' }}>💬</p>
              <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 6, color: 'var(--dark)' }}>No conversations yet</p>
              <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: '1rem' }}>Find a service and start chatting</p>
              <Link to="/search"><button className="btn btn-green" style={{ fontSize: 13, padding: '9px 16px' }}>Search services</button></Link>
            </div>
          ) : conversations.map(({ person, lastMessage, unread }) => (
            <div key={person.id} className={`convo-row ${activeChat === person.id ? 'active' : ''}`} onClick={() => openChat(person.id)}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: activeChat === person.id ? 'var(--green)' : 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: activeChat === person.id ? 'white' : 'var(--green)', flexShrink: 0 }}>
                {person.full_name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <p style={{ fontWeight: unread > 0 ? 600 : 500, fontSize: 14, color: 'var(--dark)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '75%' }}>{person.full_name}</p>
                  {lastMessage && <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{timeAgo(lastMessage.created_at)}</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 13, color: unread > 0 ? 'var(--dark)' : 'var(--muted)', fontWeight: unread > 0 ? 500 : 400, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '82%' }}>
                    {lastMessage ? (lastMessage.sender_id === user.id ? `You: ${lastMessage.content}` : lastMessage.content) : person.skill}
                  </p>
                  {unread > 0 && <span style={{ background: 'var(--green)', color: 'white', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '2px 7px', flexShrink: 0 }}>{unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="msg-main" style={{ display: 'flex', flexDirection: 'column', background: '#F7F7F7' }}>
        {!activeChat ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', padding: '2rem', background: 'white' }}>
            <p style={{ fontSize: 52, marginBottom: '1rem' }}>💬</p>
            <h3 style={{ fontSize: 20, color: 'var(--green)', marginBottom: 8, fontFamily: 'Fraunces, serif' }}>Your messages</h3>
            <p style={{ fontSize: 14, textAlign: 'center', lineHeight: 1.7, maxWidth: 280, marginBottom: '1.5rem' }}>Select a conversation or find someone to message</p>
            <Link to="/search"><button className="btn btn-green">Find someone</button></Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dark)', fontSize: 22, padding: '2px 4px', lineHeight: 1, display: 'flex', alignItems: 'center' }}>←</button>
              {activePerson && (
                <>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {activePerson.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--dark)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{activePerson.full_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>{activePerson.skill}{activePerson.location ? ` · ${activePerson.location}` : ''} · Score {activePerson.trust_score || 0}</p>
                  </div>
                  <Link to={`/profile/${activePerson.id}`} style={{ flexShrink: 0 }}>
                    <button className="btn btn-outline" style={{ padding: '7px 14px', fontSize: 12 }}>Profile</button>
                  </Link>
                </>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {loadingChat ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <div className="spin" style={{ width: 28, height: 28 }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--muted)', padding: '2rem' }}>
                  <p style={{ fontSize: 36, marginBottom: 10 }}>👋</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark)', marginBottom: 6 }}>Start the conversation</p>
                  <p style={{ fontSize: 13 }}>Say hello or ask about their services.</p>
                </div>
              ) : messages.map((m, i) => {
                const isSent = m.sender_id === user.id
                const prev = messages[i - 1]
                const showTime = !prev || new Date(m.created_at) - new Date(prev.created_at) > 300000
                const sameSender = prev && prev.sender_id === m.sender_id
                return (
                  <div key={m.id}>
                    {showTime && (
                      <div style={{ textAlign: 'center', margin: '10px 0 6px' }}>
                        <span style={{ fontSize: 11, color: 'var(--muted)', background: 'rgba(255,255,255,0.9)', padding: '3px 12px', borderRadius: 999, border: '1px solid var(--border)' }}>
                          {formatTime(m.created_at)}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8, marginTop: sameSender && !showTime ? 2 : 8 }}>
                      {!isSent && (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: !sameSender ? 'var(--green-pale)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                          {!sameSender ? activePerson?.full_name?.charAt(0).toUpperCase() : ''}
                        </div>
                      )}
                      <div style={{ maxWidth: '65%', minWidth: 0 }}>
                        <div className={`msg-bubble ${isSent ? 'msg-sent' : 'msg-received'}`} style={{ opacity: m.id?.toString().startsWith('tmp-') ? 0.65 : 1 }}>
                          {m.content}
                        </div>
                        {isSent && (
                          <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', marginTop: 3, paddingRight: 2 }}>
                            {m.id?.toString().startsWith('tmp-') ? 'Sending...' : m.read ? '✓✓ Read' : '✓ Sent'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} style={{ height: 2 }} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 14px 12px', borderTop: '1px solid var(--border)', background: 'white', flexShrink: 0 }}>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  className="msg-input-box"
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={e => {
                    setNewMsg(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
                  rows={1}
                />
                <button type="submit" className="send-btn" disabled={!newMsg.trim() || sending}
                  style={{ background: newMsg.trim() && !sending ? 'var(--green)' : '#D1D5DB' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
