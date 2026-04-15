import React, { useState } from 'react'
import type { PersonalTraits } from '../../../services/profileService'
import { updatePersonalTraits } from '../../../services/profileService'
import SectionCard from './SectionCard'
import Modal from './Modal'

const TRAITS: { key: keyof Omit<PersonalTraits, 'bio_quote'>; label: string }[] = [
  { key: 'organized', label: 'Organizada' },
  { key: 'patient', label: 'Paciente' },
  { key: 'creative', label: 'Criativa' },
  { key: 'attentive', label: 'Atenciosa' },
  { key: 'playful', label: 'Brincalhona' },
]

const LABELS = ['', 'Pouco', 'Regular', 'Bom', 'Muito', 'Excelente']

interface Props {
  personalTraits: PersonalTraits | null
  isOwner: boolean
  onChange: (t: PersonalTraits) => void
}

export default function PersonalTraitsSection({ personalTraits, isOwner, onChange }: Props) {
  const fallbackTraits: PersonalTraits = { organized: 3, patient: 3, creative: 3, attentive: 3, playful: 3, bio_quote: '' }
  const safeTraits = personalTraits || fallbackTraits

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<PersonalTraits>(
    personalTraits || fallbackTraits
  )
  const [saving, setSaving] = useState(false)

  const openModal = () => {
    setForm(personalTraits || fallbackTraits)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updatePersonalTraits(form)
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
        id="section-traits"
        icon="👤"
        title="Perfil pessoal"
        editable={isOwner}
        isEmpty={!personalTraits}
        emptyLabel="Adicione suas características pessoais para que as famílias te conheçam melhor."
        onAdd={openModal}
        onEdit={openModal}
      >
        <div className="space-y-3">
          {TRAITS.map(t => {
            const val = safeTraits[t.key] as number
            return (
              <div key={t.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-hs-textbody">{t.label}</span>
                  <span className="text-xs text-hs-purple font-medium">{LABELS[val]}</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2">
                  <div
                    className="bg-hs-purple rounded-full h-2 transition-all"
                    style={{ width: `${(val / 5) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
          {safeTraits.bio_quote && (
            <blockquote className="mt-4 border-l-4 border-hs-purple pl-4 text-sm text-hs-textbody italic">
              "{safeTraits.bio_quote}"
            </blockquote>
          )}
        </div>
      </SectionCard>

      {showModal && (
        <Modal title="Perfil pessoal" onClose={() => setShowModal(false)} size="md">
          <div className="space-y-5">
            {TRAITS.map(t => (
              <div key={t.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">{t.label}</label>
                  <span className="text-sm text-hs-purple font-medium">{LABELS[form[t.key as keyof typeof form] as number]}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={form[t.key as keyof typeof form] as number}
                  onChange={e => setForm(f => ({ ...f, [t.key]: parseInt(e.target.value) }))}
                  className="w-full accent-hs-purple"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>Pouco</span>
                  <span>Excelente</span>
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frase sobre você (opcional)</label>
              <textarea
                rows={2}
                placeholder="Ex: 'Eu amo cuidar das crianças e acompanhar seu crescimento...'"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple resize-none"
                value={form.bio_quote}
                onChange={e => setForm(f => ({ ...f, bio_quote: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3">
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
          </div>
        </Modal>
      )}
    </>
  )
}
