import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

interface Props {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel }: Props) {
  const [closing, setClosing] = useState(false)

  const close = (cb: () => void) => {
    setClosing(true)
    setTimeout(cb, 150)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(onCancel) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${closing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
        onClick={() => close(onCancel)}
      />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-4 ${closing ? 'animate-dialog-out' : 'animate-dialog-in'}`}>
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <FontAwesomeIcon icon={faTrash} className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={() => close(onCancel)}
            className="flex-1 text-sm text-gray-600 px-4 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => close(onConfirm)}
            className="flex-1 text-sm text-white bg-red-500 px-4 py-2.5 rounded-full hover:bg-red-600 transition-colors font-medium"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  )
}
