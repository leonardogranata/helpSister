import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandshake } from '@fortawesome/free-solid-svg-icons'
import type { Behavior } from '../../../services/profileService'
import { updateBehavior } from '../../../services/profileService'
import SectionCard from './SectionCard'
import Modal from './Modal'
import { TEXT_LIMITS, clampText } from '../constants/textLimits'

const FIELDS: { key: keyof Behavior; label: string; placeholder: string }[] = [
  {
    key: 'family_orientation',
    label: 'Como lida com orientações da família',
    placeholder: 'Sigo respeitosamente as orientações dos responsáveis. Quaisquer dúvidas, busco esclarecer de forma tranquila...',
  },
  {
    key: 'playtime',
    label: 'Como lida com brincadeiras',
    placeholder: 'Mantenho a criança ativa para o total bem-estar. Priorizo atividades lúdicas...',
  },
  {
    key: 'flexibility',
    label: 'Flexibilidade e adaptação',
    placeholder: 'Prefiro seguir uma rotina para trazer segurança às crianças, mas sou capaz de me adaptar...',
  },
  {
    key: 'parent_communication',
    label: 'Comunicação com os pais',
    placeholder: 'Envio atualizações ao longo do dia para que os pais se sintam tranquilos...',
  },
  {
    key: 'daily_routine',
    label: 'Rotina do dia a dia',
    placeholder: 'Organizo a rotina conforme as necessidades da criança: hora de comer, brincar, descansar...',
  },
  {
    key: 'situation_dilemma',
    label: 'Como lida com situações difíceis',
    placeholder: 'Mantenho a calma e avalio a situação antes de agir. Em caso de emergência...',
  },
]

interface Props {
  behavior: Behavior | null
  isOwner: boolean
  onChange: (b: Behavior) => void
}

export default function BehaviorSection({ behavior, isOwner, onChange }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Behavior>(
    behavior || { family_orientation: '', playtime: '', flexibility: '', parent_communication: '', daily_routine: '', situation_dilemma: '' }
  )
  const [saving, setSaving] = useState(false)

  const hasContent = behavior && FIELDS.some(f => clampText(behavior[f.key], TEXT_LIMITS.behavior.answer).trim())

  const openModal = () => {
    setForm(behavior || { family_orientation: '', playtime: '', flexibility: '', parent_communication: '', daily_routine: '', situation_dilemma: '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    const sanitizedForm = FIELDS.reduce((acc, field) => {
      acc[field.key] = clampText(form[field.key], TEXT_LIMITS.behavior.answer)
      return acc
    }, {} as Behavior)

    setSaving(true)
    try {
      const updated = await updateBehavior(sanitizedForm)
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
        id="section-behavior"
        icon={<FontAwesomeIcon icon={faHandshake} />}
        title="Postura e comportamento"
        editable={isOwner}
        isEmpty={!hasContent}
        emptyLabel="Descreva sua postura profissional e como você se relaciona com as famílias."
        onAdd={openModal}
        onEdit={openModal}
      >
        <div className="space-y-4">
          {FIELDS.filter(f => behavior?.[f.key]).map(field => (
            <div key={field.key} className="min-w-0">
              <h4 className="text-xs font-semibold text-hs-purple uppercase tracking-wide mb-1 hs-wrap-text break-words">
                {field.label}
              </h4>
              <p className="text-sm text-hs-textbody leading-relaxed hs-wrap-text break-words">
                {clampText(behavior?.[field.key], TEXT_LIMITS.behavior.answer)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {showModal && (
        <Modal title="Postura e comportamento" onClose={() => setShowModal(false)} size="lg">
          <div className="space-y-5">
            {FIELDS.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <textarea
                  rows={3}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple resize-none hs-wrap-text"
                  value={form[field.key]}
                  maxLength={TEXT_LIMITS.behavior.answer}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                />
              </div>
            ))}
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
