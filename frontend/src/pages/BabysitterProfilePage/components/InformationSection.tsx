import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClipboardList,
  faLocationDot,
  faHouse,
  faLink,
  faIdCard,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons'
import type { BabysitterProfile } from '../../../services/profileService'
import SectionCard from './SectionCard'
import { TEXT_LIMITS, clampText } from '../constants/textLimits'

interface Props {
  profile: BabysitterProfile
}

function InfoRow({
  icon,
  label,
  value,
  ok,
  maxLength = 160,
}: {
  icon: ReactNode
  label: string
  value?: string
  ok?: boolean
  maxLength?: number
}) {
  const safeValue = clampText(value, maxLength) || '—'

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 min-w-0">
      <span className="text-xl text-hs-purple">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 leading-none mb-0.5">{label}</div>
        <div className="text-sm text-hs-purple-dark font-medium hs-wrap-text break-words">{safeValue}</div>
      </div>
      {ok !== undefined && (
        <span className={`text-xs px-2.5 py-1 rounded-full ${ok ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
          {ok ? 'Verificado' : 'Pendente'}
        </span>
      )}
    </div>
  )
}

export default function InformationSection({ profile }: Props) {
  return (
    <SectionCard icon={<FontAwesomeIcon icon={faClipboardList} />} title="Informações" isEmpty={false}>
      <InfoRow
        icon={<FontAwesomeIcon icon={faLocationDot} />}
        label="Localização"
        value={[profile.city, profile.state].filter(Boolean).join(', ') || 'Não informado'}
        maxLength={120}
      />
      <InfoRow
        icon={<FontAwesomeIcon icon={faHouse} />}
        label="Disponível para moradia"
        value={profile.housing_available ? 'Disponível para morar com a família' : 'Não disponível para moradia'}
        maxLength={120}
      />
      <InfoRow
        icon={<FontAwesomeIcon icon={faLink} />}
        label="LinkedIn"
        value={profile.linkedin || 'Não informado'}
        maxLength={TEXT_LIMITS.profile.linkedin}
      />
      <InfoRow
        icon={<FontAwesomeIcon icon={faIdCard} />}
        label="CPF verificado"
        ok={profile.cpf_verified}
      />
      <InfoRow
        icon={<FontAwesomeIcon icon={faFileLines} />}
        label="Documentação"
        value="Documentação conferida pela equipe"
        ok={profile.documentation_verified}
        maxLength={100}
      />
    </SectionCard>
  )
}
