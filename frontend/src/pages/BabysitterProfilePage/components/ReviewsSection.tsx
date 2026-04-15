import React from 'react'
import type { Review } from '../../../services/profileService'
import SectionCard from './SectionCard'

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= value ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
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
      icon="⭐"
      title="Avaliações das famílias"
      isEmpty={reviews.length === 0}
      emptyLabel="Ainda não há avaliações. As famílias que contratarem você poderão deixar avaliações aqui."
    >
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="text-4xl font-bold text-hs-purple-dark">
          {averageRating?.toFixed(1) || '—'}
        </div>
        <div>
          <Stars value={Math.round(averageRating || 0)} />
          <p className="text-xs text-gray-400 mt-1">{reviewCount} avaliações</p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-5">
        {reviews.map(review => (
          <div key={review.id} className="flex gap-3">
            <img
              src={review.reviewer.profile_picture_url}
              alt={review.reviewer.full_name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-hs-purple-dark">
                  {review.reviewer.full_name || 'Família'}
                </span>
                <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
              </div>
              <Stars value={review.rating} />
              <p className="text-sm text-hs-textbody mt-1.5 leading-relaxed">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
