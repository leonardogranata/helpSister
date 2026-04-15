import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGraduationCap, faCircleCheck, faXmark, faPlus } from '@fortawesome/free-solid-svg-icons'
import type { Training } from '../../../services/profileService'
import { createTraining, deleteTraining } from '../../../services/profileService'
import SectionCard from './SectionCard'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import { TEXT_LIMITS, clampText } from '../constants/textLimits'

interface Props {
  trainings: Training[]
  isOwner: boolean
  onChange: (t: Training[]) => void
}

export default function TrainingSection({ trainings, isOwner, onChange }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', completed: true })
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const handleAdd = async () => {
    const sanitizedForm = {
      ...form,
      title: clampText(form.title, TEXT_LIMITS.training.title),
      description: clampText(form.description, TEXT_LIMITS.training.description),
    }

    if (!sanitizedForm.title.trim()) {
      alert('Informe o título do curso/certificação.')
      return
    }

    setSaving(true)
    try {
      const created = await createTraining(sanitizedForm)
      onChange([...trainings, created])
      setShowModal(false)
      setForm({ title: '', description: '', completed: true })
    } catch (err) {
      alert('Erro: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteTraining(id)
    onChange(trainings.filter(t => t.id !== id))
    setConfirmId(null)
  }

  return (
    <>
      <SectionCard
        id="section-training"
        icon={<FontAwesomeIcon icon={faGraduationCap} />}
        title="Capacitação"
        editable={isOwner}
        isEmpty={trainings.length === 0}
        emptyLabel="Adicione cursos e certificações que comprovem seu preparo profissional."
        onAdd={() => setShowModal(true)}
      >
        <div className="space-y-3">
          {trainings.map(t => (
            <div key={t.id} className="flex items-start justify-between gap-2 p-3 bg-purple-50 rounded-xl min-w-0">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-hs-purple flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-hs-purple-dark hs-wrap-text break-words">
                    {clampText(t.title, TEXT_LIMITS.training.title)}
                  </div>
                  {t.description && (
                    <div className="text-xs text-hs-textbody mt-0.5 hs-wrap-text break-words">
                      {clampText(t.description, TEXT_LIMITS.training.description)}
                    </div>
                  )}
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={() => t.id && setConfirmId(t.id)}
                  className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {isOwner && (
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-hs-purple hover:text-hs-purple-dark flex items-center gap-1 transition-colors mt-2"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              Adicionar capacitação
            </button>
          )}
        </div>
      </SectionCard>

      {showModal && (
        <Modal title="Adicionar capacitação" onClose={() => setShowModal(false)} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do curso / certificação *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                placeholder="Ex: Primeiros socorros infantil"
                value={form.title}
                maxLength={TEXT_LIMITS.training.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instituição / Descrição</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                placeholder="Ex: Cruz Vermelha Brasileira"
                value={form.description}
                maxLength={TEXT_LIMITS.training.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="text-sm text-gray-500 px-4 py-2 rounded-full hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="bg-hs-purple text-white text-sm px-6 py-2 rounded-full hover:bg-hs-purple-dark disabled:opacity-50 transition-colors"
              >
                {saving ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmId !== null && (
        <ConfirmDialog
          title="Remover capacitação"
          message="Tem certeza que deseja remover esta capacitação? Essa ação não pode ser desfeita."
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  )
}
