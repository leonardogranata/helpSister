import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import type { Review } from '../../../services/profileService'
import SectionCard from './SectionCard'
import { TEXT_LIMITS, clampText } from '../constants/textLimits'

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <FontAwesomeIcon
          key={i}
          icon={i <= value ? faStarSolid : faStarRegular}
          className={`w-4 h-4 ${i <= value ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </span>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

interface Props {
  reviews: Review[]
  averageRating: number | null
  reviewCount: number
}

export default function ReviewsSection({ reviews, averageRating, reviewCount }: Props) {
  return (
    <SectionCard
      icon={<FontAwesomeIcon icon={faStarSolid} />}
      title="Avaliações das famílias"
      isEmpty={reviews.length === 0}
      emptyLabel="Ainda não há avaliações. As famílias que contratarem você poderão deixar avaliações aqui."
    >
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="text-4xl font-bold text-hs-purple-dark">{averageRating?.toFixed(1) || '—'}</div>
        <div>
          <Stars value={Math.round(averageRating || 0)} />
          <p className="text-xs text-gray-400 mt-1">{reviewCount} avaliações</p>
        </div>
      </div>

      <div className="space-y-5">
        {reviews.map(review => (
          <div key={review.id} className="flex gap-3 min-w-0">
            <img
              src={review.reviewer.profile_picture_url}
              alt={review.reviewer.full_name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-hs-purple-dark hs-wrap-text break-words">
                  {clampText(review.reviewer.full_name, TEXT_LIMITS.profile.firstName + TEXT_LIMITS.profile.lastName) || 'Família'}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(review.created_at)}</span>
              </div>
              <Stars value={review.rating} />
              <p className="text-sm text-hs-textbody mt-1.5 leading-relaxed hs-wrap-text break-words">
                {clampText(review.comment, TEXT_LIMITS.review.comment)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
