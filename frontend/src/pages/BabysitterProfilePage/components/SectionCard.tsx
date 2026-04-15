import React from 'react'

interface Props {
  id?: string
  icon: string
  title: string
  editable?: boolean
  onEdit?: () => void
  children: React.ReactNode
  emptyLabel?: string
  isEmpty?: boolean
  onAdd?: () => void
}

export default function SectionCard({
  id,
  icon,
  title,
  editable = false,
  onEdit,
  children,
  emptyLabel,
  isEmpty = false,
  onAdd,
}: Props) {
  return (
    <div id={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-hs-purple-dark flex items-center gap-2 text-base">
          <span>{icon}</span>
          {title}
        </h2>
        {editable && !isEmpty && onEdit && (
          <button
            onClick={onEdit}
            className="text-hs-purple hover:text-hs-purple-dark text-sm flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-4xl mb-3 opacity-30">+</div>
          <p className="text-hs-textbody text-sm mb-4">{emptyLabel || 'Nenhuma informação adicionada ainda.'}</p>
          {editable && onAdd && (
            <button
              onClick={onAdd}
              className="bg-hs-purple text-white text-sm px-5 py-2 rounded-full hover:bg-hs-purple-dark transition-colors"
            >
              Adicionar {title}
            </button>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
