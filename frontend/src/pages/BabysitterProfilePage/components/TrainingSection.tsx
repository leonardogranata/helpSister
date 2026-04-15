import React, { useState } from 'react'
import type { Training } from '../../../services/profileService'
import { createTraining, deleteTraining } from '../../../services/profileService'
import SectionCard from './SectionCard'
import Modal from './Modal'

interface Props {
  trainings: Training[]
  isOwner: boolean
  onChange: (t: Training[]) => void
}

export default function TrainingSection({ trainings, isOwner, onChange }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', completed: true })
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!form.title) { alert('Informe o título do curso/certificação.'); return }
    setSaving(true)
    try {
      const created = await createTraining(form)
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
    if (!confirm('Remover esta capacitação?')) return
    await deleteTraining(id)
    onChange(trainings.filter(t => t.id !== id))
  }

  return (
    <>
      <SectionCard
        id="section-training"
        icon="🎓"
        title="Capacitação"
        editable={isOwner}
        isEmpty={trainings.length === 0}
        emptyLabel="Adicione cursos e certificações que comprovem seu preparo profissional."
        onAdd={() => setShowModal(true)}
      >
        <div className="space-y-3">
          {trainings.map(t => (
            <div key={t.id} className="flex items-start justify-between gap-2 p-3 bg-purple-50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-hs-purple flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-hs-purple-dark">{t.title}</div>
                  {t.description && <div className="text-xs text-hs-textbody mt-0.5">{t.description}</div>}
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={() => t.id && handleDelete(t.id)}
                  className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {isOwner && (
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-hs-purple hover:text-hs-purple-dark flex items-center gap-1 transition-colors mt-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
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
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instituição / Descrição</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                placeholder="Ex: Cruz Vermelha Brasileira"
                value={form.description}
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
    </>
  )
}
