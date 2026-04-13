export type FrontendUserType = 'contratante' | 'cuidadora'
export type BackendUserType = 'contractor' | 'babysitter'

export interface AuthUser {
  id: number
  name: string
  email: string
  user_type: BackendUserType
}

interface AuthResponse {
  token: string
  user: AuthUser
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function notifyAuthUpdate(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('hs-auth-updated'))
  }
}

function toApiPath(path: string): string {
  return `${API_BASE_URL}${path}`
}

export function toBackendUserType(userType: FrontendUserType): BackendUserType {
  return userType === 'cuidadora' ? 'babysitter' : 'contractor'
}

function pickFirstErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null

  const asRecord = payload as Record<string, unknown>
  if (typeof asRecord.detail === 'string') return asRecord.detail

  for (const value of Object.values(asRecord)) {
    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0]
    }

    if (typeof value === 'string') {
      return value
    }
  }

  return null
}

async function throwApiError(response: Response, fallbackMessage: string): Promise<never> {
  let message = fallbackMessage

  try {
    const payload = await response.json()
    message = pickFirstErrorMessage(payload) ?? fallbackMessage
  } catch {
    message = fallbackMessage
  }

  throw new Error(message)
}

export function saveAuthSession(data: AuthResponse): void {
  localStorage.setItem('hs_token', data.token)
  localStorage.setItem('hs_user', JSON.stringify(data.user))
  notifyAuthUpdate()
}

export function clearAuthSession(): void {
  localStorage.removeItem('hs_token')
  localStorage.removeItem('hs_user')
  notifyAuthUpdate()
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('hs_user')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthUser
    if (!parsed?.name || !parsed?.email) return null
    return parsed
  } catch {
    return null
  }
}

export async function loginUser(input: {
  email: string
  password: string
  userType: FrontendUserType
}): Promise<AuthResponse> {
  const response = await fetch(toApiPath('/api/auth/login/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      user_type: toBackendUserType(input.userType),
    }),
  })

  if (!response.ok) {
    await throwApiError(response, 'Erro ao fazer login.')
  }

  return response.json() as Promise<AuthResponse>
}

export async function registerUser(formData: FormData): Promise<AuthResponse> {
  const response = await fetch(toApiPath('/api/auth/register/'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    await throwApiError(response, 'Erro ao criar conta.')
  }

  return response.json() as Promise<AuthResponse>
}
