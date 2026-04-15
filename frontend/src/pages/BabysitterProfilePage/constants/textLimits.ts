export const TEXT_LIMITS = {
  profile: {
    firstName: 60,
    lastName: 80,
    phone: 25,
    title: 120,
    bio: 900,
    linkedin: 255,
  },
  experience: {
    title: 120,
    employer: 120,
    description: 700,
  },
  behavior: {
    answer: 700,
  },
  training: {
    title: 120,
    description: 220,
  },
  personalTraits: {
    bioQuote: 220,
  },
  review: {
    comment: 1200,
  },
} as const

export function clampText(value: string | null | undefined, max: number): string {
  return (value || '').slice(0, max)
}
