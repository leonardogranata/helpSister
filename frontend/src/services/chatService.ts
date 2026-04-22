const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const CHAT_PORT = (import.meta.env.VITE_API_PORT ?? '8001') as string

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('hs_token')
  return token ? { Authorization: `Token ${token}` } : {}
}

function resolveChatHttpBase() {
  if (API_BASE) {
    try {
      const apiUrl = new URL(API_BASE)
      return `${apiUrl.protocol}//${apiUrl.hostname}:${CHAT_PORT}`
    } catch {
      // fallback to window host below
    }
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:${CHAT_PORT}`
  }

  return API_BASE
}

function apiPath(path: string) {
  const base = resolveChatHttpBase().replace(/\/$/, '')
  return `${base}${path}`
}

async function handleJsonResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: fallbackError }))
    throw new Error(err.detail || fallbackError)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function getConversations() {
  const res = await fetch(apiPath('/api/chat/conversations/'), { headers: { ...authHeaders() } })
  return handleJsonResponse(res, 'Erro ao obter conversas')
}

export async function getMessages(conversationId: number) {
  const res = await fetch(apiPath(`/api/chat/conversations/${conversationId}/messages/`), { headers: { ...authHeaders() } })
  return handleJsonResponse(res, 'Erro ao obter mensagens')
}

export async function sendMessage(conversationId: number, content: string) {
  const res = await fetch(apiPath(`/api/chat/conversations/${conversationId}/messages/`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ content }),
  })
  return handleJsonResponse(res, 'Erro ao enviar mensagem')
}

export async function editMessage(messageId: number, content: string) {
  const res = await fetch(apiPath(`/api/chat/messages/${messageId}/`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ content }),
  })
  return handleJsonResponse(res, 'Erro ao editar mensagem')
}

export async function deleteMessage(messageId: number, scope: 'me' | 'all') {
  const res = await fetch(apiPath(`/api/chat/messages/${messageId}/?scope=${scope}`), {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  return handleJsonResponse(res, 'Erro ao deletar mensagem')
}

export async function reportUser(userId: number, payload: { reason: string; details?: string; conversation_id?: number }) {
  const res = await fetch(apiPath(`/api/chat/users/${userId}/report/`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  })
  return handleJsonResponse(res, 'Erro ao denunciar usuario')
}

export async function blockUser(userId: number) {
  const res = await fetch(apiPath(`/api/chat/users/${userId}/block/`), {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  return handleJsonResponse(res, 'Erro ao bloquear usuario')
}

export async function unblockUser(userId: number) {
  const res = await fetch(apiPath(`/api/chat/users/${userId}/block/`), {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  return handleJsonResponse(res, 'Erro ao desbloquear usuario')
}

export function buildWsUrl(path: string) {
  if (API_BASE) {
    try {
      const u = new URL(API_BASE)
      const scheme = u.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${scheme}//${u.hostname}:${CHAT_PORT}${path}`
    } catch {
      // fallback to default host/port below
    }
  }

  const hostname = window.location.hostname
  const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${scheme}//${hostname}:${CHAT_PORT}${path}`
}
