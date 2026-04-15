import React, { useState } from 'react'
import type { Schedule } from '../../../services/profileService'
import { updateSchedule } from '../../../services/profileService'
import SectionCard from './SectionCard'
import Modal from './Modal'

const DAYS = [
  { value: 0, short: 'Seg', label: 'Segunda' },
  { value: 1, short: 'Ter', label: 'Terça' },
  { value: 2, short: 'Qua', label: 'Quarta' },
  { value: 3, short: 'Qui', label: 'Quinta' },
  { value: 4, short: 'Sex', label: 'Sexta' },
  { value: 5, short: 'Sáb', label: 'Sábado' },
  { value: 6, short: 'Dom', label: 'Domingo' },
]

const PERIODS: { key: keyof Omit<Schedule, 'id' | 'day_of_week' | 'day_label'>; label: string }[] = [
  { key: 'morning', label: 'Manhã' },
  { key: 'afternoon', label: 'Tarde' },
  { key: 'evening', label: 'Noite' },
  { key: 'overnight', label: 'Hora extra' },
]

function buildGrid(schedules: Schedule[]): Record<number, Record<string, boolean>> {
  const grid: Record<number, Record<string, boolean>> = {}
  DAYS.forEach(d => {
    const entry = schedules.find(s => s.day_of_week === d.value)
    grid[d.value] = {
      morning: entry?.morning ?? false,
      afternoon: entry?.afternoon ?? false,
      evening: entry?.evening ?? false,
      overnight: entry?.overnight ?? false,
    }
  })
  return grid
}

interface Props {
  schedules: Schedule[]
  isOwner: boolean
  onChange: (s: Schedule[]) => void
}

export default function AvailabilitySection({ schedules, isOwner, onChange }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [grid, setGrid] = useState<Record<number, Record<string, boolean>>>(() => buildGrid(schedules))
  const [saving, setSaving] = useState(false)

  const openModal = () => {
    setGrid(buildGrid(schedules))
    setShowModal(true)
  }

  const toggle = (day: number, period: string) => {
    setGrid(g => ({
      ...g,
      [day]: { ...g[day], [period]: !g[day][period] },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: Schedule[] = DAYS.map(d => ({
        day_of_week: d.value,
        morning: grid[d.value].morning,
        afternoon: grid[d.value].afternoon,
        evening: grid[d.value].evening,
        overnight: grid[d.value].overnight,
      })).filter(s => s.morning || s.afternoon || s.evening || s.overnight)

      const result = await updateSchedule(payload)
      onChange(result)
      setShowModal(false)
    } catch (err) {
      alert('Erro: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const isEmpty = schedules.length === 0

  return (
    <>
      <SectionCard
        id="section-schedule"
        icon="📅"
        title="Disponibilidade"
        editable={isOwner}
        isEmpty={isEmpty}
        emptyLabel="Informe seus horários disponíveis para que as famílias possam te encontrar."
        onAdd={openModal}
        onEdit={openModal}
      >
        {/* Read-only grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-400 font-normal pb-2 pr-3">Turno</th>
                {DAYS.map(d => (
                  <th key={d.value} className="text-center text-xs text-gray-400 font-normal pb-2 px-1">
                    {d.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(p => (
                <tr key={p.key}>
                  <td className="pr-3 py-1.5 text-hs-textbody text-xs">{p.label}</td>
                  {DAYS.map(d => {
                    const entry = schedules.find(s => s.day_of_week === d.value)
                    const available = entry ? entry[p.key] : false
                    return (
                      <td key={d.value} className="text-center px-1 py-1.5">
                        <span className={`inline-block w-5 h-5 rounded-full text-xs leading-5 ${
                          available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {available ? '✓' : '–'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {showModal && (
        <Modal title="Editar disponibilidade" onClose={() => setShowModal(false)} size="lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-xs text-gray-400 font-normal pb-3 pr-4">Turno</th>
                  {DAYS.map(d => (
                    <th key={d.value} className="text-center text-xs text-gray-600 font-medium pb-3 px-2">
                      {d.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(p => (
                  <tr key={p.key}>
                    <td className="pr-4 py-2 text-hs-textbody text-sm font-medium">{p.label}</td>
                    {DAYS.map(d => (
                      <td key={d.value} className="text-center px-2 py-2">
                        <button
                          onClick={() => toggle(d.value, p.key)}
                          className={`w-8 h-8 rounded-full text-xs font-medium border-2 transition-all ${
                            grid[d.value][p.key]
                              ? 'bg-hs-purple border-hs-purple text-white'
                              : 'bg-white border-gray-200 text-gray-400 hover:border-hs-purple'
                          }`}
                        >
                          {grid[d.value][p.key] ? '✓' : ''}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">Clique nos botões para marcar os horários disponíveis.</p>
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
