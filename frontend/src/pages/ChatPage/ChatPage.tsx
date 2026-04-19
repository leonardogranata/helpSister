import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getConversations, getMessages, buildWsUrl } from '../../services/chatService'
import { getStoredUser } from '../../services/auth'
import Navbar from '../../components/layout/Navbar/Navbar'
import Footer from '../../components/layout/Footer/Footer'

interface SimpleUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  profile_picture_url?: string
}

interface Message {
  id: number
  sender: SimpleUser
  content: string
  timestamp: string
}

interface Conversation {
  id: number
  participants: SimpleUser[]
  last_message?: Message | null
  unread_count?: number
}

export default function ChatPage() {
  const params = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const storedUser = getStoredUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<number | null>(params.conversationId ? Number(params.conversationId) : null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConvos, setLoadingConvos] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const notificationsSocket = useRef<WebSocket | null>(null)
  const chatSocket = useRef<WebSocket | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const [text, setText] = useState('')
  const isUnmountedRef = useRef(false)
  const chatReconnectAttempts = useRef(0)
  const notificationsReconnectAttempts = useRef(0)

  useEffect(() => {
    void loadConversations()

    // open notifications socket with reconnection
    const setupNotificationsSocket = () => {
      const token = localStorage.getItem('hs_token')
      if (!token) return
      const url = buildWsUrl(`/ws/notifications/?token=${token}`)
      console.debug('Connecting notifications WS', url)
      const ws = new WebSocket(url)
      notificationsSocket.current = ws

      ws.onopen = () => {
        console.debug('Notifications WS open')
        notificationsReconnectAttempts.current = 0
      }

      ws.onmessage = ev => {
        try {
          const data = JSON.parse(ev.data)
          if (data.type === 'notify') {
            void loadConversations()
            if (data.conversation_id && Number(data.conversation_id) === selected) {
              addMessage(data.message)
            }
          }
        } catch (e) {
          // ignore
        }
      }

      ws.onclose = ev => {
        console.debug('Notifications WS closed', ev.code, ev.reason)
        if (!isUnmountedRef.current) {
          const attempt = notificationsReconnectAttempts.current++
          const delay = Math.min(30000, 1000 * 2 ** attempt)
          setTimeout(() => setupNotificationsSocket(), delay)
        }
      }

      ws.onerror = err => {
        console.warn('Notifications WS error', err)
      }
    }

    setupNotificationsSocket()

    return () => {
      isUnmountedRef.current = true
      try { notificationsSocket.current?.close() } catch {}
      try { chatSocket.current?.close() } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selected) {
      void openConversation(Number(selected))
      navigate(`/conversas/${selected}`, { replace: true })
    } else {
      setMessages([])
      chatSocket.current?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  useEffect(() => {
    // scroll to bottom when messages change
    const el = messagesContainerRef.current
    if (el) {
      // allow DOM update
      setTimeout(() => {
        el.scrollTop = el.scrollHeight
      }, 0)
    }
  }, [messages])

  async function loadConversations() {
    setLoadingConvos(true)
    try {
      const data = await getConversations()
      setConversations(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingConvos(false)
    }
  }

  async function openConversation(conversationId: number) {
    setLoadingMessages(true)
    try {
      const msgs = await getMessages(conversationId)
      setMessages(msgs)

      // open websocket for this conversation with reconnection
      const setupChatSocket = () => {
        chatSocket.current?.close()
        const token = localStorage.getItem('hs_token')
        if (!token) return
        const url = buildWsUrl(`/ws/chat/${conversationId}/?token=${token}`)
        console.debug('Connecting chat WS', url)
        const ws = new WebSocket(url)
        chatSocket.current = ws

        ws.onopen = () => {
          console.debug('Chat WS open', conversationId)
          chatReconnectAttempts.current = 0
        }

        ws.onmessage = ev => {
          try {
            const data = JSON.parse(ev.data)
            if (data.type === 'message') {
              addMessage(data.message)
              void loadConversations()
            }
          } catch (e) {
            // ignore
          }
        }

        ws.onclose = ev => {
          console.debug('Chat WS closed', ev.code, ev.reason)
          if (!isUnmountedRef.current) {
            const attempt = chatReconnectAttempts.current++
            const delay = Math.min(30000, 1000 * 2 ** attempt)
            setTimeout(() => setupChatSocket(), delay)
          }
        }

        ws.onerror = err => {
          console.warn('Chat WS error', err)
        }
      }

      setupChatSocket()
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMessages(false)
    }
  }

  function otherParticipantName(conv: Conversation) {
    if (!storedUser) return 'Contato'
    const other = conv.participants.find(p => p.id !== storedUser.id)
    if (!other) return conv.participants[0]?.email || 'Contato'
    return `${other.first_name || ''} ${other.last_name || ''}`.trim() || other.email
  }

  function addMessage(msg: Message) {
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev
      const next = [...prev, msg]
      next.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      return next
    })
  }

  async function handleSend() {
    if (!text.trim() || !selected) return
    const trimmed = text.trim()
    const payload = JSON.stringify({ message: trimmed })
    setText('')

    if (chatSocket.current && chatSocket.current.readyState === WebSocket.OPEN) {
      chatSocket.current.send(payload)
      return
    }

    // fallback to HTTP POST when WS is not ready
    try {
      const token = localStorage.getItem('hs_token')
      const res = await fetch(`/api/chat/conversations/${selected}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({ content: trimmed }),
      })
      if (!res.ok) throw new Error('Falha ao enviar mensagem')
      const data = (await res.json()) as Message
      addMessage(data)
      void loadConversations()
    } catch (err) {
      alert('Erro ao enviar mensagem: ' + (err as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-hs-bg">
      <Navbar />
      <div className="pt-[68px]">
        <div className="mx-auto max-w-6xl px-4 py-8" style={{ height: 'calc(100vh - 68px)' }}>
          <div className="flex gap-6 h-full">
            <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="px-4 py-3 border-b">{loadingConvos ? 'Carregando...' : 'Conversas'}</div>
              <div className="flex-1 overflow-auto">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelected(conv.id)}
                    className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 flex items-center gap-3 ${selected === conv.id ? 'bg-gray-50' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm truncate">{otherParticipantName(conv)}</div>
                      <div className="text-xs text-gray-500 truncate">{conv.last_message?.content}</div>
                    </div>
                    {conv.unread_count ? (
                      <div className="text-xs bg-hs-purple text-white px-2 py-0.5 rounded-full">{conv.unread_count}</div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="px-4 py-3 border-b font-semibold">
                {selected ? (conversations.find(c => c.id === selected) ? otherParticipantName(conversations.find(c => c.id === selected) as Conversation) : 'Conversa') : 'Selecione uma conversa'}
              </div>
              <div ref={messagesContainerRef} className="flex-1 p-4 overflow-auto">
                {loadingMessages ? (
                  <div>Carregando mensagens...</div>
                ) : (
                  messages.map(m => (
                    <div key={m.id} className={`mb-3 max-w-[70%] ${m.sender.id === storedUser?.id ? 'ml-auto text-right' : ''}`}>
                      <div className={`inline-block px-4 py-2 rounded-xl ${m.sender.id === storedUser?.id ? 'bg-hs-purple text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {m.content}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(m.timestamp).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    disabled={!selected}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
                    placeholder={selected ? 'Escreva uma mensagem...' : 'Selecione uma conversa para começar a conversar'}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none"
                  />
                  <button onClick={handleSend} className="bg-hs-purple text-white px-4 py-2 rounded-xl">Enviar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
