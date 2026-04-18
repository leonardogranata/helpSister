import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar/Navbar'
import Footer from '../../components/layout/Footer/Footer'
import { getMyProfile, getPublicProfile } from '../../services/profileService'
import type {
  Activities,
  BabysitterProfile,
  Behavior,
  Experience,
  PersonalTraits,
  Schedule,
  Training,
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

function calcSteps(profile: BabysitterProfile) {
  return [
    {
      label: 'Foto de perfil',
      done: !!profile.profile_picture_url && !profile.profile_picture_url.includes('default'),
    },
    { label: 'Sobre mim', done: profile.bio.length > 20 },
    { label: 'Titulo profissional', done: !!profile.title && profile.title !== 'Babá profissional' },
    { label: 'LinkedIn', done: !!profile.linkedin },
    { label: 'Experiencias', done: profile.experiences.length > 0 },
    { label: 'Disponibilidade', done: profile.schedules.length > 0 },
    { label: 'Capacitacao', done: profile.trainings.length > 0 },
    {
      label: 'Postura',
      done: !!profile.behavior && Object.values(profile.behavior).some(value => !!value),
    },
    { label: 'Atividades', done: !!profile.activities },
    { label: 'Perfil pessoal', done: !!profile.personal_traits },
  ]
}

const SECTION_IDS: Record<string, string> = {
  'Foto de perfil': 'profile-header',
  'Sobre mim': 'profile-header',
  'Titulo profissional': 'profile-header',
  LinkedIn: 'profile-header',
  Experiencias: 'section-experiences',
  Disponibilidade: 'section-schedule',
  Capacitacao: 'section-training',
  Postura: 'section-behavior',
  Atividades: 'section-activities',
  'Perfil pessoal': 'section-traits',
}

export default function BabysitterProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const viewerUser = getStoredUser()
  const isPublicView = !!id
  const viewerIsContractor = viewerUser?.user_type === 'contractor'

  const [profile, setProfile] = useState<BabysitterProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isPublicView) return

    const user = getStoredUser()
    if (!user) {
      navigate('/entrar', { replace: true })
      return
    }

    if (user.user_type !== 'babysitter') {
      navigate('/', { replace: true })
    }
  }, [isPublicView, navigate])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (isPublicView && id) {
        setProfile(await getPublicProfile(Number(id)))
        return
      }

      const user = getStoredUser()
      if (user?.user_type === 'babysitter') {
        setProfile(await getMyProfile())
      } else {
        setError('Voce precisa estar logada como baba para ver este perfil.')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [id, isPublicView])

  useEffect(() => {
    void load()
  }, [load])

  const scrollTo = (label: string) => {
    const element = document.getElementById(SECTION_IDS[label])
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const updateProfile = (nextProfile: BabysitterProfile) => setProfile(nextProfile)
  const updateExperiences = (experiences: Experience[]) =>
    setProfile(prev => (prev ? { ...prev, experiences } : prev))
  const updateSchedules = (schedules: Schedule[]) =>
    setProfile(prev => (prev ? { ...prev, schedules } : prev))
  const updateTrainings = (trainings: Training[]) =>
    setProfile(prev => (prev ? { ...prev, trainings } : prev))
  const updateBehavior = (behavior: Behavior) =>
    setProfile(prev => (prev ? { ...prev, behavior } : prev))
  const updateActivities = (activities: Activities) =>
    setProfile(prev => (prev ? { ...prev, activities } : prev))
  const updateTraits = (personalTraits: PersonalTraits) =>
    setProfile(prev => (prev ? { ...prev, personal_traits: personalTraits } : prev))

  const isOwner = !isPublicView && viewerUser?.user_type === 'babysitter'

  if (loading) {
    return (
      <div className="min-h-screen bg-hs-bg">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-hs-purple border-t-transparent" />
            <p className="text-sm text-hs-textbody">Carregando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-hs-bg">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="px-4 text-center">
            <p className="mb-4 text-5xl">: (</p>
            <p className="mb-2 text-lg font-semibold text-hs-purple-dark">Perfil nao encontrado</p>
            <p className="mb-6 text-sm text-hs-textbody">
              {error || 'Este perfil nao existe ou nao esta disponivel.'}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="rounded-full border border-hs-purple px-5 py-2 text-sm text-hs-purple transition-colors hover:bg-purple-50"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const steps = calcSteps(profile)

  return (
    <div className="min-h-screen bg-hs-bg">
      <Navbar />

      <div className="pb-12 pt-[68px]">
        <div className="mx-auto max-w-5xl px-4 pt-6">
          {isPublicView && viewerIsContractor && (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-purple-100 bg-white/90 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-hs-purple-dark">Visualizacao da contratante</p>
                <p className="text-sm text-hs-textbody">
                  Voce esta vendo o perfil publico completo da baba para comparar antes de contratar.
                </p>
              </div>
              <Link
                to="/contratar"
                className="inline-flex items-center justify-center rounded-full border border-hs-purple px-4 py-2 text-sm font-medium text-hs-purple transition-colors hover:bg-purple-50"
              >
                Voltar para a busca
              </Link>
            </div>
          )}

          {isOwner && (
            <CompletionBanner
              percentage={profile.completion_percentage}
              steps={steps}
              onStepClick={scrollTo}
            />
          )}

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="min-w-0 flex-1">
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

            <div className="w-full flex-shrink-0 space-y-4 lg:w-72">
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
