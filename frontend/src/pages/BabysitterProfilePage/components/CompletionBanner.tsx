import React from 'react'

interface Step {
  label: string
  done: boolean
}

interface Props {
  percentage: number
  steps: Step[]
  onStepClick: (label: string) => void
}

export default function CompletionBanner({ percentage, steps, onStepClick }: Props) {
  if (percentage >= 100) return null

  return (
    <div className="bg-white border border-purple-200 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Circle progress */}
        <div className="relative flex-shrink-0">
          <svg width={72} height={72} viewBox="0 0 72 72">
            <circle cx={36} cy={36} r={30} fill="none" stroke="#ede9fe" strokeWidth={8} />
            <circle
              cx={36} cy={36} r={30}
              fill="none"
              stroke="#6105A6"
              strokeWidth={8}
              strokeDasharray={`${(percentage / 100) * 188.5} 188.5`}
              strokeLinecap="round"
              transform="rotate(-90 36 36)"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-hs-purple">
            {percentage}%
          </span>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-hs-purple-dark text-lg mb-1">
            Complete seu perfil para atrair mais famílias!
          </h3>
          <p className="text-hs-textbody text-sm mb-4">
            Perfis completos recebem até 5x mais contatos. Preencha as seções abaixo:
          </p>

          {/* Progress bar */}
          <div className="w-full bg-purple-100 rounded-full h-2 mb-4">
            <div
              className="bg-hs-purple rounded-full h-2 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Steps chips */}
          <div className="flex flex-wrap gap-2">
            {steps.filter(s => !s.done).map(step => (
              <button
                key={step.label}
                onClick={() => onStepClick(step.label)}
                className="text-xs bg-purple-50 hover:bg-purple-100 text-hs-purple border border-purple-200 rounded-full px-3 py-1 transition-colors"
              >
                + {step.label}
              </button>
            ))}
            {steps.filter(s => s.done).map(step => (
              <span
                key={step.label}
                className="text-xs bg-green-50 text-green-600 border border-green-200 rounded-full px-3 py-1 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {step.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
