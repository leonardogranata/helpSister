import React, { useState } from 'react'
import type { Experience } from '../../../services/profileService'
import { createExperience, updateExperience, deleteExperience } from '../../../services/profileService'
import SectionCard from './SectionCard'
import Modal from './Modal'

const AGE_RANGES = [
  { value: '0-2', label: '0 a 2 anos' },
  { value: '3-6', label: '3 a 6 anos' },
  { value: '7-10', label: '7 a 10 anos' },
  { value: '11-14', label: '11 a 14 anos' },
  { value: '15+', label: 'Acima de 15 anos' },
]

const emptyForm = (): Experience => ({
  title: '',
  employer: '',
  start_date: '',
  end_date: null,
  is_current: false,
  description: '',
  age_ranges: [],
})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${months[parseInt(month) - 1]} ${year}`
}

interface Props {
  experiences: Experience[]
  isOwner: boolean
  onChange: (exps: Experience[]) => void
}

export default function ExperienceSection({ experiences, isOwner, onChange }: Props) {
  const [modal, setModal] = useState<{ open: boolean; editing: Experience | null }>({ open: false, editing: null })
  const [form, setForm] = useState<Experience>(emptyForm())
  const [saving, setSaving] = useState(false)

  const openAdd = () => { setForm(emptyForm()); setModal({ open: true, editing: null }) }
  const openEdit = (exp: Experience) => { setForm({ ...exp }); setModal({ open: true, editing: exp }) }
  const closeModal = () => setModal({ open: false, editing: null })

  const toggleAgeRange = (val: string) => {
    setForm(f => ({
      ...f,
      age_ranges: f.age_ranges.includes(val)
        ? f.age_ranges.filter(v => v !== val)
        : [...f.age_ranges, val],
    }))
  }

  const handleSave = async () => {
    if (!form.title || !form.employer || !form.start_date) {
      alert('Preencha os campos obrigatórios.')
      return
    }
    setSaving(true)
    try {
      if (modal.editing?.id) {
        const updated = await updateExperience(modal.editing.id, form)
        onChange(experiences.map(e => (e.id === updated.id ? updated : e)))
      } else {
        const created = await createExperience(form)
        onChange([...experiences, created])
      }
      closeModal()
    } catch (err) {
      alert('Erro: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover esta experiência?')) return
    await deleteExperience(id)
    onChange(experiences.filter(e => e.id !== id))
  }

  return (
    <>
      <SectionCard
        id="section-experiences"
        icon="💼"
        title="Experiências"
        editable={isOwner}
        isEmpty={experiences.length === 0}
        emptyLabel="Adicione suas experiências de trabalho com crianças."
        onAdd={openAdd}
      >
        <div className="space-y-5">
          {experiences.map(exp => (
            <div key={exp.id} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-medium text-hs-purple-dark">{exp.title}</div>
                  <div className="text-sm text-hs-textbody">{exp.employer}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {formatDate(exp.start_date)} – {exp.is_current ? 'Atual' : formatDate(exp.end_date || '')}
                  </div>
                  {exp.description && (
                    <p className="text-sm text-hs-textbody mt-2 leading-relaxed">{exp.description}</p>
                  )}
                  {exp.age_ranges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {exp.age_ranges.map(r => (
                        <span key={r} className="text-xs bg-purple-50 text-hs-purple border border-purple-100 rounded-full px-2.5 py-0.5">
                          {AGE_RANGES.find(a => a.value === r)?.label || r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(exp)} className="text-gray-400 hover:text-hs-purple p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => exp.id && handleDelete(exp.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isOwner && (
            <button
              onClick={openAdd}
              className="text-sm text-hs-purple hover:text-hs-purple-dark flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar experiência
            </button>
          )}
        </div>
      </SectionCard>

      {modal.open && (
        <Modal
          title={modal.editing ? 'Editar experiência' : 'Adicionar experiência'}
          onClose={closeModal}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Função *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                  placeholder="Ex: Babá particular"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Família / Empresa *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                  placeholder="Ex: Família Rodrigues"
                  value={form.employer}
                  onChange={e => setForm(f => ({ ...f, employer: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Início *</label>
                <input
                  type="month"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                  value={form.start_date?.slice(0, 7)}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value + '-01' }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Término</label>
                <input
                  type="month"
                  disabled={form.is_current}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple disabled:opacity-50"
                  value={form.end_date?.slice(0, 7) || ''}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value + '-01' }))}
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={form.is_current}
                    onChange={e => setForm(f => ({ ...f, is_current: e.target.checked, end_date: null }))}
                    className="accent-hs-purple"
                  />
                  Trabalho atual
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                rows={3}
                placeholder="Descreva suas responsabilidades e conquistas nesta experiência..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple resize-none"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Faixas etárias atendidas</label>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => toggleAgeRange(r.value)}
                    className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                      form.age_ranges.includes(r.value)
                        ? 'bg-hs-purple text-white border-hs-purple'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-hs-purple'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="text-sm text-gray-500 px-4 py-2 rounded-full hover:bg-gray-50">
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
