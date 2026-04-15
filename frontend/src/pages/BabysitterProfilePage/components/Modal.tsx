import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ title, onClose, children, size = 'md' }: Props) {
  const [closing, setClosing] = useState(false)

  const close = () => {
    setClosing(true)
    setTimeout(onClose, 150)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${closing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
        onClick={close}
      />

      {/* Panel */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] overflow-y-auto ${closing ? 'animate-dialog-out' : 'animate-dialog-in'}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 border-b border-gray-100 min-w-0">
          <h3 className="font-semibold text-hs-purple-dark text-lg hs-wrap-text break-words min-w-0">{title}</h3>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
