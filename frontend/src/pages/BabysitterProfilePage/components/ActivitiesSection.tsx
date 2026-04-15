import React, { useState } from 'react'
import type { Activities } from '../../../services/profileService'
import { updateActivities } from '../../../services/profileService'
import SectionCard from './SectionCard'
import Modal from './Modal'

const ACTIVITY_LIST: { key: keyof Activities; label: string; icon: string }[] = [
  { key: 'reading', label: 'Leitura e histórias', icon: '📚' },
  { key: 'educational_toys', label: 'Brincadeiras educativas', icon: '🧩' },
  { key: 'outdoor', label: 'Atividades ao livre', icon: '🌳' },
  { key: 'social_skills', label: 'Habilidades sociais', icon: '🤝' },
  { key: 'arts', label: 'Desenhos e pintura', icon: '🎨' },
  { key: 'cooking', label: 'Culinária e receitas', icon: '👩‍🍳' },
  { key: 'music', label: 'Música e artigos', icon: '🎵' },
  { key: 'crafts', label: 'Trabalhos artesanais', icon: '✂️' },
]

const emptyActivities = (): Activities => ({
  reading: false, educational_toys: false, outdoor: false, social_skills: false,
  arts: false, cooking: false, music: false, crafts: false,
})

interface Props {
  activities: Activities | null
  isOwner: boolean
  onChange: (a: Activities) => void
}

export default function ActivitiesSection({ activities, isOwner, onChange }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Activities>(activities || emptyActivities())
  const [saving, setSaving] = useState(false)

  const selected = activities ? ACTIVITY_LIST.filter(a => activities[a.key]) : []

  const openModal = () => {
    setForm(activities || emptyActivities())
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateActivities(form)
      onChange(updated)
      setShowModal(false)
    } catch (err) {
      alert('Erro: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SectionCard
        id="section-activities"
        icon="⭐"
        title="Atividades com as crianças"
        editable={isOwner}
        isEmpty={!activities}
        emptyLabel="Informe quais atividades você oferece para as crianças."
        onAdd={openModal}
        onEdit={openModal}
      >
        <div className="flex flex-wrap gap-2">
          {selected.map(a => (
            <span
              key={a.key}
              className="flex items-center gap-1.5 bg-purple-50 text-hs-purple border border-purple-100 rounded-full text-sm px-3 py-1.5"
            >
              <span>{a.icon}</span>
              {a.label}
            </span>
          ))}
          {selected.length === 0 && activities && (
            <p className="text-sm text-gray-400">Nenhuma atividade selecionada.</p>
          )}
        </div>
      </SectionCard>

      {showModal && (
        <Modal title="Atividades com as crianças" onClose={() => setShowModal(false)} size="md">
          <p className="text-sm text-hs-textbody mb-4">Selecione todas as atividades que você oferece:</p>
          <div className="grid grid-cols-2 gap-3">
            {ACTIVITY_LIST.map(a => (
              <button
                key={a.key}
                type="button"
                onClick={() => setForm(f => ({ ...f, [a.key]: !f[a.key] }))}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm text-left transition-all ${
                  form[a.key]
                    ? 'border-hs-purple bg-purple-50 text-hs-purple'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="text-sm text-gray-500 px-4 py-2 rounded-full hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-hs-purple text-white text-sm px-6 py-2 rounded-full hover:bg-hs-purple-dark disabled:opacity-50 transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
