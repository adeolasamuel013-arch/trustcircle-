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
  const [loading, setLoading] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { loadConversations() }, [user])

  useEffect(() => {
    if (chatWith) openChat(chatWith)
  }, [chatWith, conversations])

  useEffect(() => {
    if (!activeChat) return
    const channel = supabase.channel(`chat-${activeChat}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, payload => {
        if (payload.new.sender_id === activeChat) {
          setMessages(m => [...m, payload.new])
          markRead(activeChat)
        }
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [activeChat])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations() {
    if (!user) return
    setLoading(true)
    const { data: sent } = await supabase.from('messages')
      .select('receiver_id').eq('sender_id', user.id)
    const { data: received } = await supabase.from('messages')
      .select('sender_id').eq('receiver_id', user.id)

    const ids = new Set([
      ...(sent || []).map(m => m.receiver_id),
      ...(received || []).map(m => m.sender_id)
    ])

    if (ids.size === 0) { setLoading(false); return }

    const { data: people } = await supabase.from('profiles')
      .select('id, full_name, skill, trust_score')
      .in('id', [...ids])

    const convos = await Promise.all((people || []).map(async p => {
      const { data: last } = await supabase.from('messages')
        .select('content, created_at, sender_id, read')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${p.id}),and(sender_id.eq.${p.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(1)
      const { count: unread } = await supabase.from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', p.id).eq('receiver_id', user.id).eq('read', false)
      return { person: p, lastMessage: last?.[0] || null, unread: unread || 0 }
    }))

    convos.sort((a, b) => new Date(b.lastMessage?.created_at || 0) - new Date(a.lastMessage?.created_at || 0))
    setConversations(convos)
    setLoading(false)
  }

  async function openChat(personId) {
    setLoadingChat(true)
    setActiveChat(personId)

    const { data: person } = await supabase.from('profiles')
      .select('id, full_name, skill, trust_score, location').eq('id', personId).single()
    setActivePerson(person)

    const { data: msgs } = await supabase.from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${personId}),and(sender_id.eq.${personId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    setMessages(msgs || [])

    await markRead(personId)
    setConversations(c => c.map(x => x.person.id === personId ? { ...x, unread: 0 } : x))
    setLoadingChat(false)
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }, 100)
  }

  async function markRead(senderId) {
    await supabase.from('messages').update({ read: true })
      .eq('sender_id', senderId).eq('receiver_id', user.id).eq('read', false)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMsg.trim() || !activeChat || sending) return
    setSending(true)
    const content = newMsg.trim()
    setNewMsg('')

    const { data: msg } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeChat,
      content,
      read: false
    }).select().single()

    if (msg) {
      setMessages(m => [...m, msg])
      setConversations(c => {
        const exists = c.find(x => x.person.id === activeChat)
        if (exists) {
          return c.map(x => x.person.id === activeChat ? { ...x, lastMessage: msg } : x)
        }
        return c
      })
    }
    setSending(false)
  }

  function timeAgo(d) {
    const diff = Date.now() - new Date(d)
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'now'
    if (m < 60) return `${m}m`
    if (m < 1440) return `${Math.floor(m/60)}h`
    return `${Math.floor(m/1440)}d`
  }

  function formatTime(d) {
    return new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', overflow: 'hidden' }}>
      <style>{`
        .msg-sidebar { width: 100%; max-width: 360px; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: white; flex-shrink: 0; }
        .msg-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .convo-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.15s; }
        .convo-item:hover { background: var(--cream); }
        .convo-item.active { background: var(--green-pale); }
        .bubble { max-width: 75%; padding: 10px 14px; border-radius: 18px; font-size: 14px; line-height: 1.5; word-break: break-word; }
        .bubble-sent { background: var(--green); color: white; border-bottom-right-radius: 4px; margin-left: auto; }
        .bubble-received { background: #F3F4F6; color: var(--dark); border-bottom-left-radius: 4px; }
        @media (max-width: 640px) {
          .msg-sidebar { max-width: 100%; display: ${activeChat ? 'none' : 'flex'}; }
          .msg-main { display: ${activeChat ? 'flex' : 'none'}; }
        }
      `}</style>

      {/* Sidebar — conversations list */}
      <div className="msg-sidebar">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--cream)' }}>
          <h2 style={{ fontSize: 18, color: 'var(--green)', marginBottom: 0 }}>
            Messages {totalUnread > 0 && <span style={{ background: 'var(--amber)', color: 'white', borderRadius: 999, fontSize: 12, padding: '2px 8px', marginLeft: 6 }}>{totalUnread}</span>}
          </h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
              <div className="spin" style={{ width: 28, height: 28 }} />
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--muted)' }}>
              <p style={{ fontSize: 32, marginBottom: '1rem' }}>💬</p>
              <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 6 }}>No messages yet</p>
              <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Find a service provider and start a conversation
              </p>
              <Link to="/search">
                <button className="btn btn-green" style={{ fontSize: 13, padding: '10px 18px' }}>
                  Search services
                </button>
              </Link>
            </div>
          ) : conversations.map(({ person, lastMessage, unread }) => (
            <div
              key={person.id}
              className={`convo-item ${activeChat === person.id ? 'active' : ''}`}
              onClick={() => { setActiveChat(person.id); openChat(person.id) }}
            >
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: activeChat === person.id ? 'var(--green)' : 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: activeChat === person.id ? 'white' : 'var(--green)', flexShrink: 0 }}>
                {person.full_name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <p style={{ fontWeight: unread > 0 ? 600 : 500, fontSize: 14, color: 'var(--dark)' }}>{person.full_name}</p>
                  {lastMessage && <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{timeAgo(lastMessage.created_at)}</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 13, color: unread > 0 ? 'var(--dark)' : 'var(--muted)', fontWeight: unread > 0 ? 500 : 400, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                    {lastMessage ? (lastMessage.sender_id === user.id ? `You: ${lastMessage.content}` : lastMessage.content) : <em>{person.skill}</em>}
                  </p>
                  {unread > 0 && (
                    <span style={{ background: 'var(--green)', color: 'white', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '2px 7px', flexShrink: 0 }}>{unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat window */}
      <div className="msg-main">
        {!activeChat ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', padding: '2rem' }}>
            <p style={{ fontSize: 48, marginBottom: '1rem' }}>💬</p>
            <h3 style={{ fontSize: 18, color: 'var(--green)', marginBottom: 8 }}>Your messages</h3>
            <p style={{ fontSize: 14, textAlign: 'center', lineHeight: 1.7, maxWidth: 300 }}>
              Select a conversation on the left or find a service provider and start chatting
            </p>
            <Link to="/search" style={{ marginTop: '1.25rem' }}>
              <button className="btn btn-green">Find someone to message</button>
            </Link>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => { setActiveChat(null); setActivePerson(null); setMessages([]) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20, padding: '4px 8px', display: 'flex', alignItems: 'center' }}
              >
                ←
              </button>
              {activePerson && (
                <>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {activePerson.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--dark)' }}>{activePerson.full_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>{activePerson.skill} {activePerson.location ? `· ${activePerson.location}` : ''} · Score: {activePerson.trust_score || 0}</p>
                  </div>
                  <Link to={`/profile/${activePerson.id}`}>
                    <button className="btn btn-outline" style={{ padding: '7px 14px', fontSize: 12 }}>View profile</button>
                  </Link>
                </>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--cream)' }}>
              {loadingChat ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <div className="spin" style={{ width: 28, height: 28 }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--muted)' }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>👋</p>
                  <p style={{ fontSize: 14 }}>Start the conversation!</p>
                  <p style={{ fontSize: 13, marginTop: 6 }}>Say hello or ask about their services.</p>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => {
                    const isSent = m.sender_id === user.id
                    const showTime = i === 0 || new Date(m.created_at) - new Date(messages[i-1].created_at) > 300000
                    return (
                      <div key={m.id}>
                        {showTime && (
                          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', margin: '8px 0' }}>
                            {new Date(m.created_at).toLocaleDateString('en-NG', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start' }}>
                          <div>
                            <div className={`bubble ${isSent ? 'bubble-sent' : 'bubble-received'}`}>
                              {m.content}
                            </div>
                            <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, textAlign: isSent ? 'right' : 'left', paddingLeft: isSent ? 0 : 4, paddingRight: isSent ? 4 : 0 }}>
                              {formatTime(m.created_at)} {isSent && (m.read ? '✓✓' : '✓')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Message input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'white' }}>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
                  rows={1}
                  style={{ flex: 1, resize: 'none', borderRadius: 24, padding: '10px 16px', fontSize: 14, minHeight: 44, maxHeight: 120, overflowY: 'auto', lineHeight: 1.5 }}
                />
                <button
                  type="submit"
                  disabled={!newMsg.trim() || sending}
                  style={{ width: 44, height: 44, borderRadius: '50%', background: newMsg.trim() ? 'var(--green)' : 'var(--border)', color: 'white', border: 'none', cursor: newMsg.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
