import React from 'react'
import type { BabysitterProfile } from '../../../services/profileService'
import SectionCard from './SectionCard'

interface Props {
  profile: BabysitterProfile
}

function InfoRow({ icon, label, value, ok }: { icon: string; label: string; value?: string; ok?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="text-xs text-gray-400 leading-none mb-0.5">{label}</div>
        <div className="text-sm text-hs-purple-dark font-medium">{value || '—'}</div>
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
    <SectionCard icon="📋" title="Informações" isEmpty={false}>
      <InfoRow
        icon="📍"
        label="Localização"
        value={[profile.city, profile.state].filter(Boolean).join(', ') || 'Não informado'}
      />
      <InfoRow
        icon="🏠"
        label="Disponível para moradia"
        value={profile.housing_available ? 'Disponível para morar com a família' : 'Não disponível para moradia'}
      />
      <InfoRow
        icon="🔗"
        label="LinkedIn"
        value={profile.linkedin || 'Não informado'}
      />
      <InfoRow
        icon="💳"
        label="CPF verificado"
        ok={profile.cpf_verified}
      />
      <InfoRow
        icon="📄"
        label="Documentação"
        value="Documentação conferida pela equipe"
        ok={profile.documentation_verified}
      />
    </SectionCard>
  )
}
