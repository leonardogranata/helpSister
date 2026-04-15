import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'

interface Props {
  id?: string
  icon: ReactNode
  title: string
  editable?: boolean
  onEdit?: () => void
  children: ReactNode
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
      <div className="flex items-center justify-between gap-2 mb-4 min-w-0">
        <h2 className="font-semibold text-hs-purple-dark flex items-center gap-2 text-base min-w-0 hs-wrap-text break-words">
          <span>{icon}</span>
          {title}
        </h2>
        {editable && !isEmpty && onEdit && (
          <button
            onClick={onEdit}
            className="text-hs-purple hover:text-hs-purple-dark text-sm flex items-center gap-1 transition-colors"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-8 text-center min-w-0">
          <div className="text-4xl mb-3 opacity-30">+</div>
          <p className="text-hs-textbody text-sm mb-4 hs-wrap-text break-words">
            {emptyLabel || 'Nenhuma informação adicionada ainda.'}
          </p>
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
