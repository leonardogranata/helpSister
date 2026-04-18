import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../../components/layout/Footer/Footer'
import Navbar from '../../components/layout/Navbar/Navbar'
import { getStoredUser } from '../../services/auth'
import { getPublicBabysitters } from '../../services/profileService'
import type {
  Activities,
  BabysitterProfile,
  PersonalTraits,
  Schedule,
} from '../../services/profileService'

const DAY_OPTIONS = [
  { value: '0', label: 'Segunda' },
  { value: '1', label: 'Terca' },
  { value: '2', label: 'Quarta' },
  { value: '3', label: 'Quinta' },
  { value: '4', label: 'Sexta' },
  { value: '5', label: 'Sabado' },
  { value: '6', label: 'Domingo' },
]

const PERIOD_OPTIONS: { value: keyof Pick<Schedule, 'morning' | 'afternoon' | 'evening' | 'overnight'>; label: string }[] = [
  { value: 'morning', label: 'Manha' },
  { value: 'afternoon', label: 'Tarde' },
  { value: 'evening', label: 'Noite' },
  { value: 'overnight', label: 'Hora extra' },
]

const AGE_RANGE_LABELS: Record<string, string> = {
  '0-2': '0 a 2 anos',
  '3-6': '3 a 6 anos',
  '7-10': '7 a 10 anos',
  '11-14': '11 a 14 anos',
  '15+': '15 anos ou mais',
}

const ACTIVITY_OPTIONS: { key: keyof Activities; label: string }[] = [
  { key: 'reading', label: 'Leitura e historias' },
  { key: 'educational_toys', label: 'Brincadeiras educativas' },
  { key: 'outdoor', label: 'Atividades ao ar livre' },
  { key: 'social_skills', label: 'Habilidades sociais' },
  { key: 'arts', label: 'Artes e pintura' },
  { key: 'cooking', label: 'Culinaria com criancas' },
  { key: 'music', label: 'Musica' },
  { key: 'crafts', label: 'Artesanato' },
]

const TRAIT_OPTIONS: { key: keyof Omit<PersonalTraits, 'bio_quote'>; label: string }[] = [
  { key: 'organized', label: 'Organizada' },
  { key: 'patient', label: 'Paciente' },
  { key: 'creative', label: 'Criativa' },
  { key: 'attentive', label: 'Atenciosa' },
  { key: 'playful', label: 'Brincalhona' },
]

type TraitKey = keyof Omit<PersonalTraits, 'bio_quote'>

type Filters = {
  state: string
  city: string
  minRating: number
  housingAvailable: boolean
  availabilityDay: string
  availabilityPeriod: '' | keyof Pick<Schedule, 'morning' | 'afternoon' | 'evening' | 'overnight'>
  ageRanges: string[]
  activities: (keyof Activities)[]
  traitMinimums: Record<TraitKey, number>
}

const defaultFilters = (): Filters => ({
  state: '',
  city: '',
  minRating: 0,
  housingAvailable: false,
  availabilityDay: '',
  availabilityPeriod: '',
  ageRanges: [],
  activities: [],
  traitMinimums: {
    organized: 0,
    patient: 0,
    creative: 0,
    attentive: 0,
    playful: 0,
  },
})

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function getAgeRanges(profile: BabysitterProfile) {
  return Array.from(new Set(profile.experiences.flatMap(experience => experience.age_ranges)))
}

function getActivities(profile: BabysitterProfile) {
  return ACTIVITY_OPTIONS.filter(option => profile.activities?.[option.key]).map(option => option.key)
}

function matchesAvailability(
  schedules: Schedule[],
  day: string,
  period: '' | keyof Pick<Schedule, 'morning' | 'afternoon' | 'evening' | 'overnight'>,
) {
  if (!day && !period) return true

  return schedules.some(schedule => {
    const matchesDay = !day || String(schedule.day_of_week) === day
    const matchesPeriod = !period || schedule[period]
    return matchesDay && matchesPeriod
  })
}

function topActivities(profile: BabysitterProfile) {
  return ACTIVITY_OPTIONS.filter(option => profile.activities?.[option.key])
    .slice(0, 3)
    .map(option => option.label)
}

function topTraits(profile: BabysitterProfile) {
  if (!profile.personal_traits) return []

  return [...TRAIT_OPTIONS]
    .sort((left, right) => (profile.personal_traits?.[right.key] ?? 0) - (profile.personal_traits?.[left.key] ?? 0))
    .slice(0, 2)
    .map(option => `${option.label} ${profile.personal_traits?.[option.key] ?? 0}/5`)
}

function availabilitySummary(schedules: Schedule[]) {
  if (schedules.length === 0) return 'Disponibilidade nao informada'

  const days = schedules.map(schedule => DAY_OPTIONS.find(day => day.value === String(schedule.day_of_week))?.label).filter(Boolean)
  return `${schedules.length} dia(s) cadastrado(s): ${days.slice(0, 2).join(', ')}${days.length > 2 ? '...' : ''}`
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-sm transition-colors ${
        active
          ? 'border-hs-purple bg-hs-purple text-white'
          : 'border-purple-100 bg-white text-hs-purple-dark hover:border-hs-purple'
      }`}
    >
      {children}
    </button>
  )
}

function TraitSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (next: number) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-hs-textbody">
      <span>{label}</span>
      <select
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm text-hs-purple-dark outline-none transition-colors focus:border-hs-purple"
      >
        <option value={0}>Qualquer nivel</option>
        <option value={3}>A partir de 3/5</option>
        <option value={4}>A partir de 4/5</option>
        <option value={5}>Somente 5/5</option>
      </select>
    </label>
  )
}

function BabysitterCard({ profile }: { profile: BabysitterProfile }) {
  const ageRanges = getAgeRanges(profile).slice(0, 3)
  const activities = topActivities(profile)
  const traits = topTraits(profile)

  return (
    <article className="overflow-hidden rounded-[28px] border border-purple-100 bg-white shadow-[0_18px_60px_rgba(97,5,166,0.08)]">
      <div className="h-24 bg-gradient-to-r from-hs-purple-dark via-hs-purple to-hs-purple-light" />
      <div className="px-6 pb-6">
        <div className="-mt-12 flex items-start justify-between gap-4">
          <img
            src={profile.profile_picture_url}
            alt={profile.name}
            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
          />
          <div className="mt-14 flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-hs-purple">
              {profile.average_rating ? `${profile.average_rating.toFixed(1)} estrelas` : 'Sem avaliacoes'}
            </span>
            {profile.housing_available && (
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Aceita moradia
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-hs-purple-dark">{profile.name}</h2>
            <p className="text-sm text-hs-textbody">{profile.title || 'Babá profissional'}</p>
            <p className="mt-1 text-sm text-hs-purple">{[profile.city, profile.state].filter(Boolean).join(', ') || 'Localizacao nao informada'}</p>
          </div>

          {profile.bio && (
            <p className="line-clamp-3 text-sm leading-6 text-hs-textbody">
              {profile.bio}
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-hs-bg px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hs-purple">Disponibilidade</p>
              <p className="mt-2 text-sm text-hs-textbody">{availabilitySummary(profile.schedules)}</p>
            </div>
            <div className="rounded-2xl bg-hs-bg px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hs-purple">Perfil pessoal</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {traits.length > 0 ? (
                  traits.map(trait => (
                    <span key={trait} className="rounded-full bg-white px-3 py-1 text-xs text-hs-purple-dark">
                      {trait}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-hs-textbody">Nao informado</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hs-purple">Atividades com criancas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activities.length > 0 ? (
                  activities.map(activity => (
                    <span key={activity} className="rounded-full border border-purple-100 bg-white px-3 py-1 text-xs text-hs-purple-dark">
                      {activity}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-hs-textbody">Nao informado</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hs-purple">Faixas etarias</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ageRanges.length > 0 ? (
                  ageRanges.map(range => (
                    <span key={range} className="rounded-full border border-purple-100 bg-white px-3 py-1 text-xs text-hs-purple-dark">
                      {AGE_RANGE_LABELS[range] || range}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-hs-textbody">Nao informado</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-purple-50 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-hs-textbody">
              {profile.review_count > 0 ? `${profile.review_count} avaliacao(oes)` : 'Perfil sem avaliacoes ainda'}
            </div>
            <Link
              to={`/baba/${profile.id}`}
              className="inline-flex items-center justify-center rounded-full bg-hs-purple px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Abrir perfil
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function FindBabysittersPage() {
  const navigate = useNavigate()
  const storedUser = getStoredUser()

  const [profiles, setProfiles] = useState<BabysitterProfile[]>([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(() => defaultFilters())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    if (!storedUser) {
      navigate('/entrar', { replace: true })
      return
    }

    if (storedUser.user_type !== 'contractor') {
      navigate(storedUser.user_type === 'babysitter' ? '/baba/perfil' : '/', { replace: true })
    }
  }, [navigate, storedUser])

  useEffect(() => {
    if (storedUser?.user_type !== 'contractor') return

    let active = true

    const loadProfiles = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getPublicBabysitters()
        if (active) {
          setProfiles(response)
        }
      } catch (err) {
        if (active) {
          setError((err as Error).message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadProfiles()

    return () => {
      active = false
    }
  }, [storedUser?.user_type])

  const states = useMemo(
    () => Array.from(new Set(profiles.map(profile => profile.state).filter(Boolean))).sort(),
    [profiles],
  )

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        profiles
          .filter(profile => !filters.state || profile.state === filters.state)
          .map(profile => profile.city)
          .filter(Boolean),
      ),
    ).sort()
  }, [filters.state, profiles])

  const filteredProfiles = useMemo(() => {
    const searchTerm = normalizeText(deferredSearch)

    return profiles
      .filter(profile => {
        const profileActivities = getActivities(profile)
        const profileAgeRanges = getAgeRanges(profile)

        const matchesSearch =
          !searchTerm ||
          normalizeText(profile.name).includes(searchTerm) ||
          normalizeText(profile.title).includes(searchTerm)

        const matchesState = !filters.state || profile.state === filters.state
        const matchesCity = !filters.city || profile.city === filters.city
        const matchesRating = !filters.minRating || (profile.average_rating ?? 0) >= filters.minRating
        const matchesHousing = !filters.housingAvailable || profile.housing_available
        const matchesAgeRanges =
          filters.ageRanges.length === 0 ||
          filters.ageRanges.some(ageRange => profileAgeRanges.includes(ageRange))
        const matchesActivities =
          filters.activities.length === 0 ||
          filters.activities.every(activity => profileActivities.includes(activity))
        const matchesTraits = TRAIT_OPTIONS.every(option => {
          const minimum = filters.traitMinimums[option.key]
          if (minimum === 0) return true
          return (profile.personal_traits?.[option.key] ?? 0) >= minimum
        })

        return (
          matchesSearch &&
          matchesState &&
          matchesCity &&
          matchesRating &&
          matchesHousing &&
          matchesAgeRanges &&
          matchesActivities &&
          matchesTraits &&
          matchesAvailability(profile.schedules, filters.availabilityDay, filters.availabilityPeriod)
        )
      })
      .sort((left, right) => {
        const ratingDifference = (right.average_rating ?? 0) - (left.average_rating ?? 0)
        if (ratingDifference !== 0) return ratingDifference

        const completionDifference = right.completion_percentage - left.completion_percentage
        if (completionDifference !== 0) return completionDifference

        return left.name.localeCompare(right.name)
      })
  }, [deferredSearch, filters, profiles])

  const activeFilterCount = useMemo(() => {
    return [
      filters.state,
      filters.city,
      filters.minRating > 0 ? String(filters.minRating) : '',
      filters.housingAvailable ? 'housing' : '',
      filters.availabilityDay,
      filters.availabilityPeriod,
      ...filters.ageRanges,
      ...filters.activities,
      ...Object.values(filters.traitMinimums).filter(Boolean).map(String),
    ].filter(Boolean).length
  }, [filters])

  const resetFilters = () => {
    setSearch('')
    setFilters(defaultFilters())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-hs-bg">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-hs-purple border-t-transparent" />
            <p className="text-sm text-hs-textbody">Buscando babas cadastradas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hs-bg">
      <Navbar />

      <main className="pb-12 pt-[68px]">
        <section className="overflow-hidden border-b border-purple-100 bg-[radial-gradient(circle_at_top_left,_rgba(192,136,237,0.22),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,240,255,0.92))]">
          <div className="mx-auto max-w-content px-6 py-14">
            <div className="max-w-3xl">
              <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-hs-purple shadow-sm">
                Contratacao
              </span>
              <h1 className="mt-5 font-display text-5xl leading-tight text-hs-purple-dark">
                Encontre a baba ideal para a rotina da sua familia.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-hs-textbody">
                Compare perfis reais, pesquise pelo nome e filtre por localizacao, disponibilidade, atividades,
                experiencia com idades especificas e perfil pessoal.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-content gap-6 px-6 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-purple-100 bg-white p-5 shadow-[0_18px_60px_rgba(97,5,166,0.06)] lg:sticky lg:top-[92px] lg:h-fit">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-hs-purple">Busca e filtros</p>
                <h2 className="mt-1 text-2xl font-semibold text-hs-purple-dark">Refine sua procura</h2>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-hs-purple transition-colors hover:text-hs-purple-dark"
              >
                Limpar
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-hs-purple-dark">Buscar por nome</span>
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Digite o nome da baba"
                  className="w-full rounded-2xl border border-purple-100 bg-hs-bg px-4 py-3 text-sm text-hs-purple-dark outline-none transition-colors focus:border-hs-purple"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <label className="flex flex-col gap-2 text-sm text-hs-textbody">
                  <span>Estado</span>
                  <select
                    value={filters.state}
                    onChange={event => setFilters(current => ({ ...current, state: event.target.value, city: '' }))}
                    className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm text-hs-purple-dark outline-none transition-colors focus:border-hs-purple"
                  >
                    <option value="">Todos</option>
                    {states.map(state => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-hs-textbody">
                  <span>Cidade</span>
                  <select
                    value={filters.city}
                    onChange={event => setFilters(current => ({ ...current, city: event.target.value }))}
                    className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm text-hs-purple-dark outline-none transition-colors focus:border-hs-purple"
                  >
                    <option value="">Todas</option>
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <label className="flex flex-col gap-2 text-sm text-hs-textbody">
                  <span>Disponibilidade por dia</span>
                  <select
                    value={filters.availabilityDay}
                    onChange={event => setFilters(current => ({ ...current, availabilityDay: event.target.value }))}
                    className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm text-hs-purple-dark outline-none transition-colors focus:border-hs-purple"
                  >
                    <option value="">Qualquer dia</option>
                    {DAY_OPTIONS.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-hs-textbody">
                  <span>Turno</span>
                  <select
                    value={filters.availabilityPeriod}
                    onChange={event =>
                      setFilters(current => ({
                        ...current,
                        availabilityPeriod: event.target.value as Filters['availabilityPeriod'],
                      }))
                    }
                    className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm text-hs-purple-dark outline-none transition-colors focus:border-hs-purple"
                  >
                    <option value="">Qualquer turno</option>
                    {PERIOD_OPTIONS.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-2xl bg-hs-bg px-4 py-3 text-sm text-hs-textbody">
                <input
                  type="checkbox"
                  checked={filters.housingAvailable}
                  onChange={event => setFilters(current => ({ ...current, housingAvailable: event.target.checked }))}
                  className="h-4 w-4 accent-hs-purple"
                />
                Aceita moradia com a familia
              </label>

              <label className="flex flex-col gap-2 text-sm text-hs-textbody">
                <span>Avaliacao minima</span>
                <select
                  value={filters.minRating}
                  onChange={event => setFilters(current => ({ ...current, minRating: Number(event.target.value) }))}
                  className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm text-hs-purple-dark outline-none transition-colors focus:border-hs-purple"
                >
                  <option value={0}>Qualquer nota</option>
                  <option value={3}>3 estrelas ou mais</option>
                  <option value={4}>4 estrelas ou mais</option>
                  <option value={5}>Somente 5 estrelas</option>
                </select>
              </label>

              <div>
                <p className="text-sm font-medium text-hs-purple-dark">Atividades com criancas</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ACTIVITY_OPTIONS.map(option => (
                    <FilterPill
                      key={option.key}
                      active={filters.activities.includes(option.key)}
                      onClick={() =>
                        setFilters(current => ({
                          ...current,
                          activities: current.activities.includes(option.key)
                            ? current.activities.filter(activity => activity !== option.key)
                            : [...current.activities, option.key],
                        }))
                      }
                    >
                      {option.label}
                    </FilterPill>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-hs-purple-dark">Faixa etaria atendida</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(AGE_RANGE_LABELS).map(([value, label]) => (
                    <FilterPill
                      key={value}
                      active={filters.ageRanges.includes(value)}
                      onClick={() =>
                        setFilters(current => ({
                          ...current,
                          ageRanges: current.ageRanges.includes(value)
                            ? current.ageRanges.filter(ageRange => ageRange !== value)
                            : [...current.ageRanges, value],
                        }))
                      }
                    >
                      {label}
                    </FilterPill>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-hs-purple-dark">Perfil pessoal</p>
                <div className="mt-3 grid gap-3">
                  {TRAIT_OPTIONS.map(option => (
                    <TraitSelect
                      key={option.key}
                      label={option.label}
                      value={filters.traitMinimums[option.key]}
                      onChange={value =>
                        setFilters(current => ({
                          ...current,
                          traitMinimums: {
                            ...current.traitMinimums,
                            [option.key]: value,
                          },
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-[28px] border border-purple-100 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(97,5,166,0.04)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-hs-textbody">
                  {filteredProfiles.length} baba(s) encontrada(s)
                  {activeFilterCount > 0 ? ` com ${activeFilterCount} filtro(s) ativo(s)` : ''}
                </p>
                <p className="mt-1 text-sm text-hs-purple">
                  Resultados ordenados por avaliacao, completude do perfil e nome.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-hs-purple px-4 py-2 text-sm font-medium text-hs-purple transition-colors hover:bg-purple-50"
              >
                Voltar ao inicio
              </Link>
            </div>

            {error && (
              <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
                Nao foi possivel carregar as babas agora. {error}
              </div>
            )}

            {!error && filteredProfiles.length === 0 && (
              <div className="rounded-[28px] border border-purple-100 bg-white px-6 py-14 text-center shadow-[0_18px_60px_rgba(97,5,166,0.04)]">
                <h2 className="text-2xl font-semibold text-hs-purple-dark">Nenhuma baba encontrada</h2>
                <p className="mt-3 text-sm leading-6 text-hs-textbody">
                  Tente remover alguns filtros ou buscar por outro nome para ampliar os resultados.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-full bg-hs-purple px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            {!error && filteredProfiles.length > 0 && (
              <div className="grid gap-5 xl:grid-cols-2">
                {filteredProfiles.map(profile => (
                  <BabysitterCard key={profile.id} profile={profile} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
