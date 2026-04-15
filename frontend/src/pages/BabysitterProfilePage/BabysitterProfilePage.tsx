import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar/Navbar'
import Footer from '../../components/layout/Footer/Footer'
import { getMyProfile, getPublicProfile } from '../../services/profileService'
import type {
  BabysitterProfile,
  Experience,
  Schedule,
  Training,
  Behavior,
  Activities,
  PersonalTraits,
} from '../../services/profileService'
import { getStoredUser } from '../../services/auth'

import CompletionBanner from './components/CompletionBanner'
import ProfileHeader from './components/ProfileHeader'
import ExperienceSection from './components/ExperienceSection'
import InformationSection from './components/InformationSection'
import AvailabilitySection from './components/AvailabilitySection'
import TrainingSection from './components/TrainingSection'
import BehaviorSection from './components/BehaviorSection'
import ActivitiesSection from './components/ActivitiesSection'
import PersonalTraitsSection from './components/PersonalTraitsSection'
import ReviewsSection from './components/ReviewsSection'

// ─── Profile completion steps ────────────────────────────────────────────────

function calcSteps(profile: BabysitterProfile) {
  return [
    {
      label: 'Foto de perfil',
      done: !!profile.profile_picture_url && !profile.profile_picture_url.includes('default'),
    },
    { label: 'Sobre mim',           done: profile.bio.length > 20 },
    { label: 'Título profissional',  done: !!profile.title && profile.title !== 'Babá profissional' },
    { label: 'LinkedIn',            done: !!profile.linkedin },
    { label: 'Experiências',         done: profile.experiences.length > 0 },
    { label: 'Disponibilidade',      done: profile.schedules.length > 0 },
    { label: 'Capacitação',          done: profile.trainings.length > 0 },
    {
      label: 'Postura',
      done: !!profile.behavior && Object.values(profile.behavior).some(v => !!v),
    },
    { label: 'Atividades',     done: !!profile.activities },
    { label: 'Perfil pessoal', done: !!profile.personal_traits },
  ]
}

const SECTION_IDS: Record<string, string> = {
  'Foto de perfil':      'profile-header',
  'Sobre mim':           'profile-header',
  'Título profissional': 'profile-header',
  'LinkedIn':            'profile-header',
  'Experiências':        'section-experiences',
  'Disponibilidade':     'section-schedule',
  'Capacitação':         'section-training',
  'Postura':             'section-behavior',
  'Atividades':          'section-activities',
  'Perfil pessoal':      'section-traits',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BabysitterProfilePage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  // "/baba/perfil" → own profile (id undefined)
  // "/baba/:id"    → public profile
  const isPublicView = !!id

  const [profile, setProfile] = useState<BabysitterProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  // ── Auth guard (runs once on mount) ──────────────────────────────────────
  useEffect(() => {
    if (isPublicView) return          // public profiles need no auth

    const user = getStoredUser()
    if (!user) {
      navigate('/entrar', { replace: true })
      return
    }
    if (user.user_type !== 'babysitter') {
      navigate('/', { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — run only on mount

  // ── Data loader — deps: only id & isPublicView (stable values) ───────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (isPublicView && id) {
        setProfile(await getPublicProfile(Number(id)))
      } else {
        // Read stored user fresh inside callback — avoids object-reference churn
        const user = getStoredUser()
        if (user?.user_type === 'babysitter') {
          setProfile(await getMyProfile())
        } else {
          setError('Você precisa estar logada como babá para ver este perfil.')
        }
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [id, isPublicView]) // storedUser deliberately NOT in deps — read fresh inside

  useEffect(() => { load() }, [load])

  // ── Section scroll helper ─────────────────────────────────────────────────
  const scrollTo = (label: string) => {
    const el = document.getElementById(SECTION_IDS[label])
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Optimistic local-state updaters ──────────────────────────────────────
  const updateProfile     = (p: BabysitterProfile)       => setProfile(p)
  const updateExperiences = (experiences: Experience[])  => setProfile(prev => prev ? { ...prev, experiences } : prev)
  const updateSchedules   = (schedules: Schedule[])      => setProfile(prev => prev ? { ...prev, schedules } : prev)
  const updateTrainings   = (trainings: Training[])      => setProfile(prev => prev ? { ...prev, trainings } : prev)
  const updateBehavior    = (behavior: Behavior)         => setProfile(prev => prev ? { ...prev, behavior } : prev)
  const updateActivities  = (activities: Activities)     => setProfile(prev => prev ? { ...prev, activities } : prev)
  const updateTraits      = (personal_traits: PersonalTraits) => setProfile(prev => prev ? { ...prev, personal_traits } : prev)

  // Determine ownership after profile loaded
  const storedUserId = getStoredUser()?.id
  const isOwner = !isPublicView && !!storedUserId

  // ─────────────────────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-hs-bg">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-hs-purple border-t-transparent rounded-full animate-spin" />
            <p className="text-hs-textbody text-sm">Carregando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Error
  // ─────────────────────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-hs-bg">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center px-4">
            <p className="text-5xl mb-4">😕</p>
            <p className="text-hs-purple-dark font-semibold text-lg mb-2">Perfil não encontrado</p>
            <p className="text-hs-textbody text-sm mb-6">
              {error || 'Este perfil não existe ou não está disponível.'}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-hs-purple border border-hs-purple px-5 py-2 rounded-full hover:bg-purple-50 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const steps = calcSteps(profile)

  // ─────────────────────────────────────────────────────────────────────────
  // Profile
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-hs-bg">
      <Navbar />

      <div className="pt-[68px] pb-12">
        <div className="max-w-5xl mx-auto px-4 pt-6">

          {/* Completion banner — own profile only */}
          {isOwner && (
            <CompletionBanner
              percentage={profile.completion_percentage}
              steps={steps}
              onStepClick={scrollTo}
            />
          )}

          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Left column ── */}
            <div className="flex-1 min-w-0">
              <div id="profile-header">
                <ProfileHeader
                  profile={profile}
                  isOwner={isOwner}
                  onUpdated={updateProfile}
                />
              </div>

              <ExperienceSection
                experiences={profile.experiences}
                isOwner={isOwner}
                onChange={updateExperiences}
              />

              <BehaviorSection
                behavior={profile.behavior}
                isOwner={isOwner}
                onChange={updateBehavior}
              />

              <ActivitiesSection
                activities={profile.activities}
                isOwner={isOwner}
                onChange={updateActivities}
              />

              <ReviewsSection
                reviews={profile.reviews}
                averageRating={profile.average_rating}
                reviewCount={profile.review_count}
              />
            </div>

            {/* ── Right sidebar ── */}
            <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
              <InformationSection profile={profile} />

              <AvailabilitySection
                schedules={profile.schedules}
                isOwner={isOwner}
                onChange={updateSchedules}
              />

              <TrainingSection
                trainings={profile.trainings}
                isOwner={isOwner}
                onChange={updateTrainings}
              />

              <PersonalTraitsSection
                personalTraits={profile.personal_traits}
                isOwner={isOwner}
                onChange={updateTraits}
              />
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
