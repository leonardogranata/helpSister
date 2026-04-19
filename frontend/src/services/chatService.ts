const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('hs_token')
  return token ? { Authorization: `Token ${token}` } : {}
}

function apiPath(path: string) {
  return `${API_BASE}${path}`
}

export async function getConversations() {
  const res = await fetch(apiPath('/api/chat/conversations/'), { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error('Erro ao obter conversas')
  return res.json()
}

export async function getMessages(conversationId: number) {
  const res = await fetch(apiPath(`/api/chat/conversations/${conversationId}/messages/`), { headers: { ...authHeaders() } })
  if (!res.ok) throw new Error('Erro ao obter mensagens')
  return res.json()
}

export function buildWsUrl(path: string) {
  if (API_BASE) {
    try {
      const u = new URL(API_BASE)
      const scheme = u.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${scheme}//${u.host}${path}`
    } catch {

    }
  }

  const hostname = window.location.hostname
  const backendPort = (import.meta.env.VITE_API_PORT ?? '8001') as string
  const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${scheme}//${hostname}:${backendPort}${path}`
}
