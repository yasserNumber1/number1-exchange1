import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive, ArrowRight, Bot, CheckCircle2, ExternalLink, Loader2,
  MessageSquare, RefreshCw, RotateCcw, Search, Send, UserRound, Wifi,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminAPI } from '../../services/api'

const formatTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit' }).format(date)
}

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return formatTime(value)
  return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(date)
}

const safePageUrl = (value) => {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

function EmptyConversation() {
  return (
    <div className="asc-empty-chat">
      <div className="asc-empty-icon"><Bot size={34} /></div>
      <h2>صندوق محادثات N1-BOT</h2>
      <p>اختر محادثة من القائمة لقراءة رسائل العميل والرد عليه مباشرة داخل صندوق المحادثة في الموقع.</p>
    </div>
  )
}

function ConversationList({ chats, selectedSession, onSelect, loading }) {
  if (loading && chats.length === 0) {
    return <div className="asc-list-state"><Loader2 className="asc-spin" size={24} /> جاري تحميل المحادثات...</div>
  }
  if (chats.length === 0) {
    return <div className="asc-list-state"><MessageSquare size={28} /> لا توجد محادثات في هذا القسم.</div>
  }

  return chats.map((chat) => {
    const isActive = selectedSession === chat.sessionId
    const preview = chat.lastMessage?.text || 'محادثة جديدة'
    return (
      <button
        type="button"
        key={chat.sessionId}
        className={`asc-chat-row${isActive ? ' active' : ''}${chat.unreadCount ? ' unread' : ''}`}
        onClick={() => onSelect(chat.sessionId)}
      >
        <div className="asc-row-avatar"><UserRound size={17} /></div>
        <div className="asc-row-body">
          <div className="asc-row-top">
            <strong>عميل #{chat.sessionId.slice(0, 8)}</strong>
            <time>{formatDate(chat.lastMessage?.createdAt || chat.updatedAt)}</time>
          </div>
          <div className="asc-row-preview" dir="auto">
            {chat.lastMessage?.sender === 'admin' && <CheckCircle2 size={12} />}
            <span>{preview}</span>
          </div>
          <div className="asc-row-meta">
            <span className={`asc-status ${chat.status}`}>{chat.status === 'open' ? 'مفتوحة' : 'مغلقة'}</span>
            <span>{chat.lang === 'ar' ? 'العربية' : 'English'}</span>
          </div>
        </div>
        {chat.unreadCount > 0 && <span className="asc-unread">{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</span>}
      </button>
    )
  })
}

function MessageBubble({ message }) {
  const isAdmin = message.sender === 'admin'
  return (
    <div className={`asc-message-row ${isAdmin ? 'admin' : 'customer'}`}>
      <div className="asc-message-avatar">{isAdmin ? <Bot size={16} /> : <UserRound size={16} />}</div>
      <div className="asc-message-wrap">
        <div className="asc-message-name">{isAdmin ? 'N1 Support' : 'العميل'}</div>
        <div className="asc-message-bubble" dir="auto">{message.text}</div>
        <time>{formatTime(message.createdAt)}</time>
      </div>
    </div>
  )
}

export default function AdminSupportChats() {
  const [chats, setChats] = useState([])
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)
  const [statusFilter, setStatusFilter] = useState('open')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [threadLoading, setThreadLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const selectedSessionRef = useRef('')

  useEffect(() => {
    selectedSessionRef.current = selectedSession
  }, [selectedSession])

  const query = useMemo(() => ({
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(search.trim() && { search: search.trim() }),
    limit: 100,
  }), [search, statusFilter])

  const loadChats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await adminAPI.getSupportChats(query)
      const nextChats = data.chats || []
      setChats(nextChats)
      setError('')
      setSelectedSession((current) => {
        if (current || !nextChats[0] || window.innerWidth <= 850) return current
        return nextChats[0].sessionId
      })
    } catch (err) {
      if (!silent) setError(err.message || 'تعذر تحميل المحادثات.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [query])

  const loadConversation = useCallback(async (sessionId, silent = false) => {
    if (!sessionId) return
    if (!silent) setThreadLoading(true)
    try {
      const { data } = await adminAPI.getSupportChat(sessionId)
      if (data.chat.sessionId !== sessionId || selectedSessionRef.current !== sessionId) return
      setSelectedChat(data.chat)
      setError('')

      if (data.chat.unreadCount > 0) {
        await adminAPI.markSupportChatRead(sessionId)
        setChats((current) => current.map((chat) => (
          chat.sessionId === sessionId ? { ...chat, unreadCount: 0 } : chat
        )))
      }
    } catch (err) {
      if (!silent) setError(err.message || 'تعذر تحميل المحادثة.')
    } finally {
      if (!silent) setThreadLoading(false)
    }
  }, [])

  useEffect(() => {
    loadChats()
    const timer = setInterval(() => loadChats(true), 5000)
    return () => clearInterval(timer)
  }, [loadChats])

  useEffect(() => {
    if (!selectedSession) {
      setSelectedChat(null)
      return undefined
    }
    loadConversation(selectedSession)
    const timer = setInterval(() => loadConversation(selectedSession, true), 3000)
    return () => clearInterval(timer)
  }, [loadConversation, selectedSession])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedChat?.messages?.length, selectedSession])

  const selectConversation = (sessionId) => {
    setSelectedSession(sessionId)
    setReply('')
  }

  const sendReply = async () => {
    const message = reply.trim()
    if (!selectedSession || !message || sending || selectedChat?.status === 'closed') return
    setSending(true)
    setError('')
    try {
      const { data } = await adminAPI.sendSupportReply(selectedSession, message)
      setReply('')
      setSelectedChat((current) => current ? {
        ...current,
        status: 'open',
        messages: [...(current.messages || []), data.message],
      } : current)
      await loadChats(true)
    } catch (err) {
      setError(err.message || 'تعذر إرسال الرد.')
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async () => {
    if (!selectedChat || updatingStatus) return
    const nextStatus = selectedChat.status === 'open' ? 'closed' : 'open'
    setUpdatingStatus(true)
    setError('')
    try {
      await adminAPI.updateSupportChatStatus(selectedSession, nextStatus)
      setSelectedChat((current) => current ? { ...current, status: nextStatus } : current)
      await loadChats(true)
    } catch (err) {
      setError(err.message || 'تعذر تحديث حالة المحادثة.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const refreshAll = async () => {
    await Promise.all([
      loadChats(),
      selectedSession ? loadConversation(selectedSession) : Promise.resolve(),
    ])
  }

  const pageUrl = safePageUrl(selectedChat?.page)

  return (
    <AdminLayout title="محادثات العملاء">
      <style>{`
        .asc-shell {
          height: calc(100vh - 120px); min-height: 560px; display: grid;
          grid-template-columns: 330px minmax(0,1fr); overflow: hidden;
          background: var(--al-sidebar-bg); border: 1px solid var(--al-border-md);
          border-radius: 16px; box-shadow: 0 18px 50px rgba(0,0,0,.2);
        }
        .asc-list-panel { display:flex; flex-direction:column; min-width:0; border-left:1px solid var(--al-border-md); }
        .asc-list-head { padding:16px; border-bottom:1px solid var(--al-border); background:var(--al-row-bg); }
        .asc-title-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .asc-title-row strong { color:var(--al-text-primary); font-size:14px; }
        .asc-live { display:flex; align-items:center; gap:6px; color:#22c55e; font:600 10px 'JetBrains Mono',monospace; }
        .asc-live span { width:6px; height:6px; border-radius:50%; background:#22c55e; box-shadow:0 0 7px #22c55e; }
        .asc-search { height:38px; display:flex; align-items:center; gap:8px; padding:0 11px; border:1px solid var(--al-border-md); border-radius:10px; background:var(--al-content-bg); color:var(--al-text-muted); }
        .asc-search input { width:100%; border:0; outline:0; background:transparent; color:var(--al-text-primary); font-family:'Cairo',sans-serif; font-size:12px; }
        .asc-filters { display:flex; gap:5px; margin-top:9px; }
        .asc-filter { flex:1; padding:6px 4px; border:1px solid var(--al-border); border-radius:8px; background:transparent; color:var(--al-text-muted); font:600 11px 'Cairo',sans-serif; cursor:pointer; }
        .asc-filter.active { color:#60a5fa; background:rgba(59,130,246,.1); border-color:rgba(59,130,246,.25); }
        .asc-list { flex:1; overflow-y:auto; padding:7px; }
        .asc-list::-webkit-scrollbar,.asc-messages::-webkit-scrollbar { width:4px; }
        .asc-list::-webkit-scrollbar-thumb,.asc-messages::-webkit-scrollbar-thumb { background:var(--al-scrollbar); border-radius:4px; }
        .asc-chat-row { width:100%; display:flex; align-items:flex-start; gap:10px; position:relative; padding:12px 10px; margin-bottom:3px; border:1px solid transparent; border-radius:11px; background:transparent; color:inherit; text-align:right; cursor:pointer; font-family:'Cairo',sans-serif; transition:.16s ease; }
        .asc-chat-row:hover { background:var(--al-row-bg-hover); }
        .asc-chat-row.active { background:var(--al-nav-active); border-color:var(--al-nav-active-border); }
        .asc-chat-row.unread strong { color:#fff; }
        html.light .asc-chat-row.unread strong { color:#0f172a; }
        .asc-row-avatar { width:36px; height:36px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border-radius:11px; color:#60a5fa; background:rgba(59,130,246,.1); border:1px solid rgba(59,130,246,.16); }
        .asc-row-body { flex:1; min-width:0; }
        .asc-row-top { display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .asc-row-top strong { color:var(--al-text-primary); font-size:11.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .asc-row-top time { color:var(--al-text-faint); font:500 9px 'JetBrains Mono',monospace; flex-shrink:0; }
        .asc-row-preview { display:flex; align-items:center; gap:4px; margin-top:4px; color:var(--al-text-muted); font-size:11px; }
        .asc-row-preview span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .asc-row-meta { display:flex; align-items:center; gap:7px; margin-top:7px; color:var(--al-text-faint); font-size:9px; }
        .asc-status { padding:2px 6px; border-radius:5px; }
        .asc-status.open { color:#22c55e; background:rgba(34,197,94,.08); }
        .asc-status.closed { color:#94a3b8; background:rgba(148,163,184,.08); }
        .asc-unread { position:absolute; left:9px; bottom:11px; min-width:19px; height:19px; padding:0 5px; display:flex; align-items:center; justify-content:center; border-radius:10px; background:#2563eb; color:#fff; font:700 9px 'JetBrains Mono',monospace; }
        .asc-list-state { min-height:180px; padding:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; text-align:center; color:var(--al-text-muted); font-size:12px; }
        .asc-chat-panel { min-width:0; display:flex; flex-direction:column; background:var(--al-content-bg); }
        .asc-chat-head { min-height:72px; padding:11px 18px; display:flex; align-items:center; gap:12px; background:linear-gradient(135deg,#071c34,#0b2c4c); border-bottom:1px solid rgba(96,165,250,.14); color:#fff; }
        .asc-bot-mark { width:43px; height:43px; display:flex; align-items:center; justify-content:center; border-radius:13px; color:#67e8f9; background:rgba(6,182,212,.12); border:1px solid rgba(103,232,249,.24); box-shadow:0 0 20px rgba(6,182,212,.12); flex-shrink:0; }
        .asc-head-info { flex:1; min-width:0; }
        .asc-head-info strong { display:block; font-size:13px; letter-spacing:.2px; }
        .asc-head-meta { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:4px; color:#93a4b8; font-size:10px; }
        .asc-head-meta a { display:inline-flex; align-items:center; gap:3px; max-width:260px; color:#60a5fa; text-decoration:none; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .asc-head-actions { display:flex; align-items:center; gap:7px; }
        .asc-icon-btn,.asc-status-btn,.asc-back { display:flex; align-items:center; justify-content:center; gap:6px; height:34px; padding:0 10px; border:1px solid rgba(255,255,255,.12); border-radius:9px; background:rgba(255,255,255,.06); color:#b7c4d4; cursor:pointer; font:600 10.5px 'Cairo',sans-serif; }
        .asc-status-btn:hover { color:#fff; border-color:rgba(255,255,255,.22); }
        .asc-back { display:none; width:34px; padding:0; }
        .asc-messages { flex:1; min-height:0; overflow-y:auto; padding:22px; background-image:radial-gradient(rgba(59,130,246,.07) 1px,transparent 1px); background-size:22px 22px; }
        .asc-message-row { direction:rtl; display:flex; align-items:flex-end; gap:8px; margin-bottom:16px; }
        .asc-message-row.admin { justify-content:flex-start; }
        .asc-message-row.customer { justify-content:flex-end; }
        .asc-message-avatar { width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:9px; color:#60a5fa; background:var(--al-sidebar-bg); border:1px solid var(--al-border-md); flex-shrink:0; }
        .asc-message-row.customer .asc-message-avatar { color:#34d399; }
        .asc-message-wrap { max-width:min(72%,620px); }
        .asc-message-name { margin:0 6px 4px; color:var(--al-text-muted); font-size:9.5px; }
        .asc-message-bubble { padding:10px 13px; border-radius:14px 4px 14px 14px; background:linear-gradient(135deg,#1d4ed8,#2563eb); color:#fff; white-space:pre-wrap; overflow-wrap:anywhere; font-size:12.5px; line-height:1.75; }
        .asc-message-row.customer .asc-message-bubble { border-radius:4px 14px 14px 14px; background:var(--al-sidebar-bg); color:var(--al-text-primary); border:1px solid var(--al-border-md); }
        .asc-message-wrap time { display:block; margin:4px 7px 0; color:var(--al-text-faint); font:500 8.5px 'JetBrains Mono',monospace; }
        .asc-composer { padding:13px 16px; border-top:1px solid var(--al-border-md); background:var(--al-sidebar-bg); }
        .asc-closed-note { margin-bottom:9px; padding:8px 11px; border-radius:8px; color:#fbbf24; background:rgba(245,158,11,.07); border:1px solid rgba(245,158,11,.15); text-align:center; font-size:11px; }
        .asc-compose-row { display:flex; align-items:flex-end; gap:9px; }
        .asc-compose-row textarea { flex:1; min-height:42px; max-height:110px; resize:none; padding:10px 12px; border:1px solid var(--al-border-md); border-radius:11px; outline:0; background:var(--al-content-bg); color:var(--al-text-primary); font:12.5px/1.6 'Cairo',sans-serif; }
        .asc-compose-row textarea:focus { border-color:rgba(59,130,246,.5); box-shadow:0 0 0 3px rgba(59,130,246,.08); }
        .asc-send { width:43px; height:43px; display:flex; align-items:center; justify-content:center; border:0; border-radius:12px; color:#fff; background:linear-gradient(135deg,#2563eb,#0ea5e9); cursor:pointer; box-shadow:0 7px 18px rgba(37,99,235,.25); }
        .asc-send:disabled,.asc-compose-row textarea:disabled { opacity:.45; cursor:not-allowed; }
        .asc-error { margin-bottom:10px; padding:9px 12px; border-radius:9px; color:#fca5a5; background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.18); font-size:11px; }
        .asc-empty-chat { height:100%; padding:35px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:var(--al-text-muted); }
        .asc-empty-icon { width:76px; height:76px; display:flex; align-items:center; justify-content:center; margin-bottom:15px; border-radius:25px; color:#67e8f9; background:rgba(6,182,212,.08); border:1px solid rgba(6,182,212,.18); }
        .asc-empty-chat h2 { margin:0 0 8px; color:var(--al-text-primary); font-size:17px; }
        .asc-empty-chat p { max-width:440px; margin:0; line-height:1.9; font-size:12px; }
        .asc-spin { animation:ascSpin .8s linear infinite; }
        @keyframes ascSpin { to { transform:rotate(360deg); } }
        @media (max-width:850px) {
          .asc-shell { height:calc(100vh - 96px); min-height:520px; grid-template-columns:1fr; }
          .asc-shell.has-thread .asc-list-panel { display:none; }
          .asc-shell:not(.has-thread) .asc-chat-panel { display:none; }
          .asc-list-panel { border-left:0; }
          .asc-back { display:flex; }
          .asc-status-btn span { display:none; }
          .asc-head-meta a { max-width:150px; }
          .asc-messages { padding:16px 12px; }
          .asc-message-wrap { max-width:82%; }
        }
      `}</style>

      {error && <div className="asc-error">{error}</div>}

      <section className={`asc-shell${selectedSession ? ' has-thread' : ''}`}>
        <aside className="asc-list-panel">
          <div className="asc-list-head">
            <div className="asc-title-row">
              <strong>صندوق الوارد</strong>
              <div className="asc-live"><span /> LIVE</div>
            </div>
            <label className="asc-search">
              <Search size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="البحث برقم الجلسة..." />
            </label>
            <div className="asc-filters">
              {[['open', 'المفتوحة'], ['closed', 'المغلقة'], ['all', 'الكل']].map(([value, label]) => (
                <button type="button" key={value} className={`asc-filter${statusFilter === value ? ' active' : ''}`} onClick={() => setStatusFilter(value)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="asc-list">
            <ConversationList chats={chats} selectedSession={selectedSession} onSelect={selectConversation} loading={loading} />
          </div>
        </aside>

        <div className="asc-chat-panel">
          {!selectedChat ? (
            threadLoading ? <div className="asc-list-state"><Loader2 className="asc-spin" size={26} /> جاري فتح المحادثة...</div> : <EmptyConversation />
          ) : (
            <>
              <header className="asc-chat-head">
                <button type="button" className="asc-back" onClick={() => setSelectedSession('')} aria-label="العودة للمحادثات"><ArrowRight size={16} /></button>
                <div className="asc-bot-mark"><Bot size={23} /></div>
                <div className="asc-head-info">
                  <strong>N1-BOT · عميل #{selectedChat.sessionId.slice(0, 8)}</strong>
                  <div className="asc-head-meta">
                    <span><Wifi size={9} /> {selectedChat.status === 'open' ? 'محادثة نشطة' : 'محادثة مغلقة'}</span>
                    <span>{selectedChat.lang === 'ar' ? 'العربية' : 'English'}</span>
                    {pageUrl && <a href={pageUrl} target="_blank" rel="noreferrer"><ExternalLink size={10} /> صفحة العميل</a>}
                  </div>
                </div>
                <div className="asc-head-actions">
                  <button type="button" className="asc-icon-btn" onClick={refreshAll} title="تحديث"><RefreshCw size={14} /></button>
                  <button type="button" className="asc-status-btn" onClick={updateStatus} disabled={updatingStatus}>
                    {updatingStatus ? <Loader2 className="asc-spin" size={14} /> : selectedChat.status === 'open' ? <Archive size={14} /> : <RotateCcw size={14} />}
                    <span>{selectedChat.status === 'open' ? 'إغلاق' : 'إعادة فتح'}</span>
                  </button>
                </div>
              </header>

              <div className="asc-messages">
                {(selectedChat.messages || []).map((message) => <MessageBubble key={message.id} message={message} />)}
                <div ref={bottomRef} />
              </div>

              <footer className="asc-composer">
                {selectedChat.status === 'closed' && <div className="asc-closed-note">المحادثة مغلقة. أعد فتحها لإرسال رسالة جديدة.</div>}
                <div className="asc-compose-row">
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault()
                        sendReply()
                      }
                    }}
                    placeholder="اكتب ردك للعميل..."
                    maxLength={1500}
                    disabled={selectedChat.status === 'closed' || sending}
                    rows={1}
                  />
                  <button type="button" className="asc-send" onClick={sendReply} disabled={!reply.trim() || sending || selectedChat.status === 'closed'} aria-label="إرسال الرد">
                    {sending ? <Loader2 className="asc-spin" size={18} /> : <Send size={18} />}
                  </button>
                </div>
              </footer>
            </>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}
