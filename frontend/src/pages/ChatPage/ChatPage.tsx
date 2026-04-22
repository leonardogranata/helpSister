import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  blockUser,
  buildWsUrl,
  deleteMessage,
  editMessage,
  getConversations,
  getMessages,
  reportUser,
  sendMessage,
  unblockUser,
} from '../../services/chatService'
import { getStoredUser } from '../../services/auth'
import Navbar from '../../components/layout/Navbar/Navbar'
import Footer from '../../components/layout/Footer/Footer'

interface SimpleUser {
  id: number
  email: string
  user_type?: 'contractor' | 'babysitter'
  first_name?: string
  last_name?: string
  profile_picture_url?: string
}

interface Message {
  id: number
  sender: SimpleUser
  content: string
  timestamp: string
  edited_at?: string | null
  deleted_at?: string | null
  is_deleted_for_all?: boolean
  is_edited?: boolean
  read_by_ids?: number[]
}

interface Conversation {
  id: number
  participants: SimpleUser[]
  last_message?: Message | null
  unread_count?: number
  is_blocked_by_me?: boolean
}

interface ReadReceiptPayload {
  message_ids: number[]
  reader_id: number
}

type ConfirmAction =
  | { type: 'delete_me'; message: Message }
  | { type: 'delete_all'; message: Message }
  | { type: 'toggle_block'; user: SimpleUser; currentlyBlocked: boolean }

interface ConfirmDialogState {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  action: ConfirmAction | null
}

interface InfoDialogState {
  open: boolean
  title: string
  description: string
}

interface EditDialogState {
  open: boolean
  messageId: number | null
  content: string
}

interface ReportDialogState {
  open: boolean
  reason: string
  details: string
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
  const selectedRef = useRef<number | null>(params.conversationId ? Number(params.conversationId) : null)
  const [activeMessageMenuId, setActiveMessageMenuId] = useState<number | null>(null)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirmar',
    action: null,
  })
  const [infoDialog, setInfoDialog] = useState<InfoDialogState>({
    open: false,
    title: '',
    description: '',
  })
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    messageId: null,
    content: '',
  })
  const [reportDialog, setReportDialog] = useState<ReportDialogState>({
    open: false,
    reason: '',
    details: '',
  })

  useEffect(() => {
    void loadConversations()

    const setupNotificationsSocket = () => {
      const token = localStorage.getItem('hs_token')
      if (!token) return
      const url = buildWsUrl(`/ws/notifications/?token=${token}`)
      const ws = new WebSocket(url)
      notificationsSocket.current = ws

      ws.onopen = () => {
        notificationsReconnectAttempts.current = 0
      }

      ws.onmessage = ev => {
        try {
          const data = JSON.parse(ev.data)
          if (data.type === 'notify') {
            void loadConversations()
            if (data.conversation_id && Number(data.conversation_id) === selectedRef.current) {
              if (data.event === 'message_created' && data.message) {
                addMessage(data.message as Message)
              } else if ((data.event === 'message_updated' || data.event === 'message_deleted') && data.message) {
                updateMessage(data.message as Message)
              }
            }
          }
        } catch {
          // ignore malformed socket payloads
        }
      }

      ws.onclose = () => {
        if (!isUnmountedRef.current) {
          const attempt = notificationsReconnectAttempts.current++
          const delay = Math.min(30000, 1000 * 2 ** attempt)
          setTimeout(() => setupNotificationsSocket(), delay)
        }
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
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-msg-menu]')) {
        setActiveMessageMenuId(null)
      }
      if (!target.closest('[data-header-menu]')) {
        setHeaderMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', closeMenus)
    return () => document.removeEventListener('mousedown', closeMenus)
  }, [])

  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  useEffect(() => {
    if (selected) {
      void openConversation(Number(selected))
      navigate(`/conversas/${selected}`, { replace: true })
      setHeaderMenuOpen(false)
      setActiveMessageMenuId(null)
    } else {
      setMessages([])
      chatSocket.current?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  useEffect(() => {
    const el = messagesContainerRef.current
    if (el) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight
      }, 0)
    }
  }, [messages])

  const selectedConversation = useMemo(
    () => (selected ? conversations.find(c => c.id === selected) || null : null),
    [conversations, selected],
  )
  const selectedOtherUser = useMemo(
    () => (selectedConversation ? otherParticipant(selectedConversation) : null),
    [selectedConversation],
  )

  async function loadConversations() {
    setLoadingConvos(true)
    try {
      const data = (await getConversations()) as Conversation[]
      const selectedNow = selectedRef.current
      setConversations(
        data.map(conv => (selectedNow && conv.id === selectedNow ? { ...conv, unread_count: 0 } : conv)),
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingConvos(false)
    }
  }

  async function openConversation(conversationId: number) {
    setLoadingMessages(true)
    try {
      const msgs = (await getMessages(conversationId)) as Message[]
      setMessages(msgs)
      setConversations(prev =>
        prev.map(conv => (conv.id === conversationId ? { ...conv, unread_count: 0 } : conv)),
      )

      const setupChatSocket = () => {
        chatSocket.current?.close()
        const token = localStorage.getItem('hs_token')
        if (!token) return
        const url = buildWsUrl(`/ws/chat/${conversationId}/?token=${token}`)
        const ws = new WebSocket(url)
        chatSocket.current = ws

        ws.onopen = () => {
          chatReconnectAttempts.current = 0
        }

        ws.onmessage = ev => {
          try {
            const data = JSON.parse(ev.data)
            if (data.type === 'message' && data.message) {
              addMessage(data.message as Message)
              void loadConversations()
            } else if (data.type === 'message_updated' && data.message) {
              updateMessage(data.message as Message)
              void loadConversations()
            } else if (data.type === 'message_deleted' && data.message) {
              updateMessage(data.message as Message)
              void loadConversations()
            } else if (data.type === 'read_receipt') {
              applyReadReceipt(data as ReadReceiptPayload)
            } else if (data.type === 'error' && data.detail) {
              openInfo('Erro no chat', String(data.detail))
            }
          } catch {
            // ignore malformed socket payloads
          }
        }

        ws.onclose = () => {
          if (!isUnmountedRef.current) {
            const attempt = chatReconnectAttempts.current++
            const delay = Math.min(30000, 1000 * 2 ** attempt)
            setTimeout(() => setupChatSocket(), delay)
          }
        }
      }

      setupChatSocket()
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMessages(false)
    }
  }

  function participantDisplayName(other: SimpleUser | null) {
    if (!other) return 'Contato'
    return `${other.first_name || ''} ${other.last_name || ''}`.trim() || other.email
  }

  function otherParticipant(conv: Conversation): SimpleUser | null {
    if (!storedUser) return conv.participants[0] || null
    return conv.participants.find(p => p.id !== storedUser.id) || conv.participants[0] || null
  }

  function otherParticipantName(conv: Conversation) {
    return participantDisplayName(otherParticipant(conv))
  }

  function sortMessages(list: Message[]) {
    return [...list].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  function addMessage(msg: Message) {
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev
      return sortMessages([...prev, msg])
    })
  }

  function updateMessage(msg: Message) {
    setMessages(prev => {
      const exists = prev.some(m => m.id === msg.id)
      if (!exists) return sortMessages([...prev, msg])
      return prev.map(m => (m.id === msg.id ? { ...m, ...msg } : m))
    })
  }

  function removeMessage(messageId: number) {
    setMessages(prev => prev.filter(m => m.id !== messageId))
  }

  function applyReadReceipt(payload: ReadReceiptPayload) {
    setMessages(prev =>
      prev.map(msg => {
        if (!payload.message_ids.includes(msg.id)) return msg
        const current = msg.read_by_ids || []
        if (current.includes(payload.reader_id)) return msg
        return { ...msg, read_by_ids: [...current, payload.reader_id] }
      }),
    )
  }

  function isSeenByOther(message: Message) {
    if (!storedUser || message.sender.id !== storedUser.id) return false
    const otherId = selectedOtherUser?.id
    if (!otherId) return false
    return (message.read_by_ids || []).includes(otherId)
  }

  function openInfo(title: string, description: string) {
    setInfoDialog({ open: true, title, description })
  }

  function openConfirm(
    title: string,
    description: string,
    confirmLabel: string,
    action: ConfirmAction,
  ) {
    setConfirmDialog({
      open: true,
      title,
      description,
      confirmLabel,
      action,
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

    try {
      const created = (await sendMessage(selected, trimmed)) as Message
      addMessage(created)
      void loadConversations()
    } catch (err) {
      openInfo('Erro ao enviar', (err as Error).message)
    }
  }

  async function submitEditMessage() {
    if (!editDialog.messageId) return
    const trimmed = editDialog.content.trim()
    if (!trimmed) {
      openInfo('Conteudo invalido', 'A mensagem editada nao pode ficar vazia.')
      return
    }
    try {
      const updated = (await editMessage(editDialog.messageId, trimmed)) as Message
      updateMessage(updated)
      void loadConversations()
      setEditDialog({ open: false, messageId: null, content: '' })
    } catch (err) {
      openInfo('Erro ao editar', (err as Error).message)
    }
  }

  function handleEditMessage(message: Message) {
    setEditDialog({
      open: true,
      messageId: message.id,
      content: message.content || '',
    })
    setActiveMessageMenuId(null)
  }

  function handleDeleteForMe(message: Message) {
    openConfirm(
      'Deletar para mim',
      'Essa mensagem sera removida somente para voce.',
      'Deletar',
      { type: 'delete_me', message },
    )
    setActiveMessageMenuId(null)
  }

  function handleDeleteForAll(message: Message) {
    openConfirm(
      'Deletar para todos',
      'Essa mensagem sera apagada para todos os participantes.',
      'Deletar para todos',
      { type: 'delete_all', message },
    )
    setActiveMessageMenuId(null)
  }

  async function runConfirmAction() {
    const action = confirmDialog.action
    if (!action) return

    try {
      if (action.type === 'delete_me') {
        await deleteMessage(action.message.id, 'me')
        removeMessage(action.message.id)
        void loadConversations()
      } else if (action.type === 'delete_all') {
        const deleted = (await deleteMessage(action.message.id, 'all')) as Message
        updateMessage(deleted)
        void loadConversations()
      } else if (action.type === 'toggle_block') {
        if (action.currentlyBlocked) {
          await unblockUser(action.user.id)
          openInfo('Usuario desbloqueado', `${participantDisplayName(action.user)} foi desbloqueado(a).`)
        } else {
          await blockUser(action.user.id)
          openInfo('Usuario bloqueado', `${participantDisplayName(action.user)} foi bloqueado(a).`)
        }
        void loadConversations()
      }
    } catch (err) {
      openInfo('Erro', (err as Error).message)
    } finally {
      setConfirmDialog({
        open: false,
        title: '',
        description: '',
        confirmLabel: 'Confirmar',
        action: null,
      })
    }
  }

  async function handleViewProfile() {
    if (!selectedOtherUser) return
    setHeaderMenuOpen(false)
    if (selectedOtherUser.user_type === 'babysitter') {
      navigate(`/baba/${selectedOtherUser.id}`)
      return
    }
    openInfo('Perfil indisponivel', 'Perfil publico indisponivel para este usuario.')
  }

  function handleReportUser() {
    if (!selectedOtherUser || !selected) return
    setReportDialog({ open: true, reason: '', details: '' })
    setHeaderMenuOpen(false)
  }

  async function submitReportUser() {
    if (!selectedOtherUser || !selected) return
    const reason = reportDialog.reason.trim()
    if (!reason) {
      openInfo('Motivo obrigatorio', 'Informe o motivo da denuncia.')
      return
    }
    try {
      await reportUser(selectedOtherUser.id, {
        reason,
        details: reportDialog.details.trim(),
        conversation_id: selected,
      })
      setReportDialog({ open: false, reason: '', details: '' })
      openInfo('Denuncia enviada', 'A denuncia foi enviada para analise do admin.')
    } catch (err) {
      openInfo('Erro ao denunciar', (err as Error).message)
    }
  }

  function handleBlockUser() {
    if (!selectedOtherUser) return
    const currentlyBlocked = !!selectedConversation?.is_blocked_by_me
    const verb = currentlyBlocked ? 'desbloquear' : 'bloquear'
    openConfirm(
      currentlyBlocked ? 'Desbloquear usuario' : 'Bloquear usuario',
      `Deseja ${verb} ${participantDisplayName(selectedOtherUser)}?`,
      currentlyBlocked ? 'Desbloquear' : 'Bloquear',
      { type: 'toggle_block', user: selectedOtherUser, currentlyBlocked },
    )
    setHeaderMenuOpen(false)
  }

  function renderMessageContent(message: Message) {
    if (message.is_deleted_for_all) {
      return <span className="italic opacity-80">Mensagem apagada</span>
    }
    return message.content
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
                {conversations.map(conv => {
                  const other = otherParticipant(conv)
                  const displayName = participantDisplayName(other)
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelected(conv.id)}
                      className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 flex items-center gap-3 ${selected === conv.id ? 'bg-gray-50' : ''}`}
                    >
                      {other?.profile_picture_url ? (
                        <img
                          src={other.profile_picture_url}
                          alt={displayName}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-sm truncate">{displayName}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {conv.last_message?.is_deleted_for_all ? 'Mensagem apagada' : conv.last_message?.content}
                        </div>
                      </div>
                      {conv.unread_count && selected !== conv.id ? (
                        <div className="text-xs bg-hs-purple text-white px-2 py-0.5 rounded-full">{conv.unread_count}</div>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="px-4 py-3 border-b font-semibold flex items-center justify-between">
                <span>
                  {selectedConversation ? otherParticipantName(selectedConversation) : 'Selecione uma conversa'}
                </span>

                {selectedConversation && selectedOtherUser && (
                  <div className="relative" data-header-menu>
                    <button
                      onClick={() => setHeaderMenuOpen(prev => !prev)}
                      className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600 flex items-center justify-center"
                      title="Opcoes da conversa"
                    >
                      <span className="text-lg leading-none">...</span>
                    </button>
                    {headerMenuOpen && (
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
                        <button
                          onClick={handleViewProfile}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          Ver perfil
                        </button>
                        <button
                          onClick={handleReportUser}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          Denunciar
                        </button>
                        <button
                          onClick={handleBlockUser}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          {selectedConversation?.is_blocked_by_me ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div ref={messagesContainerRef} className="flex-1 p-4 overflow-auto">
                {loadingMessages ? (
                  <div>Carregando mensagens...</div>
                ) : (
                  messages.map(message => {
                    const isMine = message.sender.id === storedUser?.id
                    return (
                      <div key={message.id} className={`mb-3 max-w-[70%] ${isMine ? 'ml-auto text-right' : ''}`}>
                        <div
                          className={`inline-block px-4 py-2 rounded-xl ${
                            isMine ? 'bg-hs-purple text-white' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {renderMessageContent(message)}
                        </div>
                        <div className={`mt-1 text-xs text-gray-400 flex items-center gap-2 ${isMine ? 'justify-end' : ''}`}>
                          <span>{new Date(message.timestamp).toLocaleString()}</span>
                          {isMine ? (
                            <span>{isSeenByOther(message) ? 'Visualizado' : 'Enviado'}</span>
                          ) : null}
                          {message.is_edited ? <span>(editada)</span> : null}

                          {isMine && !message.is_deleted_for_all ? (
                            <div className="relative inline-block" data-msg-menu>
                              <button
                                onClick={() => setActiveMessageMenuId(prev => (prev === message.id ? null : message.id))}
                                className="px-1 text-gray-500 hover:text-gray-700"
                                title="Opcoes da mensagem"
                              >
                                ...
                              </button>
                              {activeMessageMenuId === message.id && (
                                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-[120] text-left">
                                  <button
                                    onClick={() => handleEditMessage(message)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteForMe(message)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                  >
                                    Deletar para mim
                                  </button>
                                  <button
                                    onClick={() => handleDeleteForAll(message)}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    Deletar para todos
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    disabled={!selected}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void handleSend()
                      }
                    }}
                    placeholder={selected ? 'Escreva uma mensagem...' : 'Selecione uma conversa para comecar a conversar'}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none"
                  />
                  <button onClick={() => void handleSend()} className="bg-hs-purple text-white px-4 py-2 rounded-xl">
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {infoDialog.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35" onClick={() => setInfoDialog(prev => ({ ...prev, open: false }))} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-hs-purple-dark">{infoDialog.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{infoDialog.description}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setInfoDialog(prev => ({ ...prev, open: false }))}
                className="px-4 py-2 rounded-xl bg-hs-purple text-white text-sm"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/35"
            onClick={() =>
              setConfirmDialog({
                open: false,
                title: '',
                description: '',
                confirmLabel: 'Confirmar',
                action: null,
              })
            }
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-hs-purple-dark">{confirmDialog.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{confirmDialog.description}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() =>
                  setConfirmDialog({
                    open: false,
                    title: '',
                    description: '',
                    confirmLabel: 'Confirmar',
                    action: null,
                  })
                }
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => void runConfirmAction()}
                className="px-4 py-2 rounded-xl bg-hs-purple text-white text-sm"
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {editDialog.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35" onClick={() => setEditDialog({ open: false, messageId: null, content: '' })} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-hs-purple-dark">Editar mensagem</h3>
            <textarea
              value={editDialog.content}
              onChange={e => setEditDialog(prev => ({ ...prev, content: e.target.value }))}
              className="mt-3 w-full min-h-[110px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditDialog({ open: false, messageId: null, content: '' })}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => void submitEditMessage()}
                className="px-4 py-2 rounded-xl bg-hs-purple text-white text-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {reportDialog.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35" onClick={() => setReportDialog({ open: false, reason: '', details: '' })} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-hs-purple-dark">Denunciar usuario</h3>
            <label className="block mt-3 text-sm text-gray-700">
              Motivo
              <input
                value={reportDialog.reason}
                onChange={e => setReportDialog(prev => ({ ...prev, reason: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                placeholder="Ex: assedio, spam, linguagem ofensiva..."
              />
            </label>
            <label className="block mt-3 text-sm text-gray-700">
              Detalhes (opcional)
              <textarea
                value={reportDialog.details}
                onChange={e => setReportDialog(prev => ({ ...prev, details: e.target.value }))}
                className="mt-1 w-full h-[110px] min-h-[110px] max-h-[110px] resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setReportDialog({ open: false, reason: '', details: '' })}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => void submitReportUser()}
                className="px-4 py-2 rounded-xl bg-hs-purple text-white text-sm"
              >
                Enviar denuncia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
