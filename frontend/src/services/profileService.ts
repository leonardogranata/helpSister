const BASE = '/api'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('hs_token')
  return token ? { Authorization: `Token ${token}` } : {}
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new Error(err.detail || JSON.stringify(err))
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Experience {
  id?: number
  title: string
  employer: string
  start_date: string
  end_date?: string | null
  is_current: boolean
  description: string
  age_ranges: string[]
}

export interface Schedule {
  id?: number
  day_of_week: number
  day_label?: string
  morning: boolean
  afternoon: boolean
  evening: boolean
  overnight: boolean
}

export interface Training {
  id?: number
  title: string
  description: string
  completed: boolean
}

export interface Behavior {
  family_orientation: string
  playtime: string
  flexibility: string
  parent_communication: string
  daily_routine: string
  situation_dilemma: string
}

export interface Activities {
  reading: boolean
  educational_toys: boolean
  outdoor: boolean
  social_skills: boolean
  arts: boolean
  cooking: boolean
  music: boolean
  crafts: boolean
}

export interface PersonalTraits {
  organized: number
  patient: number
  creative: number
  attentive: number
  playful: number
  bio_quote: string
}

export interface Reviewer {
  id: number
  full_name: string
  profile_picture_url: string
}

export interface Review {
  id: number
  reviewer: Reviewer
  rating: number
  comment: string
  created_at: string
}

export interface BabysitterProfile {
  id: number
  name: string
  email: string
  profile_picture_url: string
  city: string
  state: string
  zip_code: string
  phone: string
  bio: string
  title: string
  linkedin: string
  housing_available: boolean
  cpf_verified: boolean
  documentation_verified: boolean
  completion_percentage: number
  experiences: Experience[]
  schedules: Schedule[]
  trainings: Training[]
  behavior: Behavior | null
  activities: Activities | null
  personal_traits: PersonalTraits | null
  reviews: Review[]
  average_rating: number | null
  review_count: number
}

export interface UserInfo {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  state: string
  zip_code: string
  user_type: string
  profile_picture_url: string
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getMyProfile = (): Promise<BabysitterProfile> =>
  request(`${BASE}/profiles/babysitter/me/`)

export const updateMyProfile = (
  data: Partial<{ bio: string; title: string; linkedin: string; housing_available: boolean }>
): Promise<BabysitterProfile> =>
  request(`${BASE}/profiles/babysitter/me/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const getPublicProfile = (userId: number): Promise<BabysitterProfile> =>
  request(`${BASE}/profiles/babysitter/${userId}/`)

// ─── User info ───────────────────────────────────────────────────────────────

export const getMe = (): Promise<UserInfo> =>
  request(`${BASE}/auth/me/`)

export const updateMe = (formData: FormData): Promise<UserInfo> =>
  request(`${BASE}/auth/me/`, { method: 'PATCH', body: formData })

// ─── Experiences ─────────────────────────────────────────────────────────────

export const createExperience = (data: Experience): Promise<Experience> =>
  request(`${BASE}/profiles/babysitter/me/experiences/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const updateExperience = (id: number, data: Experience): Promise<Experience> =>
  request(`${BASE}/profiles/babysitter/me/experiences/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const deleteExperience = (id: number): Promise<void> =>
  request(`${BASE}/profiles/babysitter/me/experiences/${id}/`, { method: 'DELETE' })

// ─── Schedule ─────────────────────────────────────────────────────────────────

export const updateSchedule = (data: Schedule[]): Promise<Schedule[]> =>
  request(`${BASE}/profiles/babysitter/me/schedule/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

// ─── Trainings ───────────────────────────────────────────────────────────────

export const createTraining = (data: Training): Promise<Training> =>
  request(`${BASE}/profiles/babysitter/me/trainings/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

export const deleteTraining = (id: number): Promise<void> =>
  request(`${BASE}/profiles/babysitter/me/trainings/${id}/`, { method: 'DELETE' })

// ─── Behavior ────────────────────────────────────────────────────────────────

export const updateBehavior = (data: Partial<Behavior>): Promise<Behavior> =>
  request(`${BASE}/profiles/babysitter/me/behavior/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

// ─── Activities ──────────────────────────────────────────────────────────────

export const updateActivities = (data: Partial<Activities>): Promise<Activities> =>
  request(`${BASE}/profiles/babysitter/me/activities/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

// ─── Personal Traits ─────────────────────────────────────────────────────────

export const updatePersonalTraits = (data: Partial<PersonalTraits>): Promise<PersonalTraits> =>
  request(`${BASE}/profiles/babysitter/me/personal-traits/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const addReview = (babysitterId: number, data: { rating: number; comment: string }): Promise<Review> =>
  request(`${BASE}/profiles/babysitter/${babysitterId}/reviews/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
