import React, { useRef, useState } from 'react'
import type { BabysitterProfile } from '../../../services/profileService'
import { updateMe, updateMyProfile } from '../../../services/profileService'
import Modal from './Modal'

interface Props {
  profile: BabysitterProfile
  isOwner: boolean
  onUpdated: (p: BabysitterProfile) => void
}

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400 text-sm">Sem avaliações</span>
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(value) ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-hs-textbody ml-1">{value.toFixed(1)}</span>
    </span>
  )
}

export default function ProfileHeader({ profile, isOwner, onUpdated }: Props) {
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: profile.name.split(' ')[0] || '',
    last_name: profile.name.split(' ').slice(1).join(' ') || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    title: profile.title || '',
    linkedin: profile.linkedin || '',
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update user info (name, phone, photo)
      const fd = new FormData()
      fd.append('first_name', form.first_name)
      fd.append('last_name', form.last_name)
      fd.append('phone', form.phone)
      if (selectedFile) fd.append('profile_picture', selectedFile)
      await updateMe(fd)

      // Update profile (bio, title)
      const updated = await updateMyProfile({ bio: form.bio, title: form.title, linkedin: form.linkedin })
      onUpdated(updated)
      setShowEdit(false)
      setPreviewUrl(null)
      setSelectedFile(null)
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const photoSrc = previewUrl || profile.profile_picture_url
  const linkedinValue = profile.linkedin || ''
  const linkedinHref = linkedinValue.startsWith('http') ? linkedinValue : `https://${linkedinValue}`

  return (
    <>
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        {/* Purple banner */}
        <div className="h-28 bg-gradient-to-r from-hs-purple-dark to-hs-purple" />

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-14 mb-4">
            <div className="relative">
              <img
                src={photoSrc}
                alt={profile.name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
              />
              {isOwner && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-hs-purple text-white w-7 h-7 rounded-full flex items-center justify-center shadow hover:bg-hs-purple-dark transition-colors"
                  title="Alterar foto"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-2">
              {isOwner ? (
                <button
                  onClick={() => setShowEdit(true)}
                  className="border border-hs-purple text-hs-purple text-sm px-4 py-2 rounded-full hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar perfil
                </button>
              ) : (
                <>
                  <button className="bg-hs-purple text-white text-sm px-5 py-2 rounded-full hover:bg-hs-purple-dark transition-colors">
                    Entrar em contato
                  </button>
                  <button className="border border-hs-purple text-hs-purple text-sm px-4 py-2 rounded-full hover:bg-purple-50 transition-colors">
                    Salvar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name & title */}
          <h1 className="text-2xl font-bold text-hs-purple-dark">{profile.name || 'Sem nome'}</h1>
          <p className="text-hs-textbody text-sm mb-1">{profile.title}</p>

          {/* Location */}
          {(profile.city || profile.state) && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {[profile.city, profile.state].filter(Boolean).join(', ')}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-3 mb-3">
            <StarRating value={profile.average_rating} />
            {profile.review_count > 0 && (
              <span className="text-sm text-hs-textbody">{profile.review_count} avaliações</span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-hs-textbody text-sm leading-relaxed">{profile.bio}</p>
          )}
          {linkedinValue && (
            <a
              href={linkedinHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center mt-3 text-sm text-hs-purple hover:text-hs-purple-dark underline"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <Modal title="Editar perfil" onClose={() => setShowEdit(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                  value={form.first_name}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                  value={form.last_name}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título profissional</label>
              <input
                placeholder="Ex: Babá profissional com 5 anos de experiência"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sobre mim</label>
              <textarea
                rows={4}
                placeholder="Conte um pouco sobre você, sua experiência e o que você ama fazer com as crianças..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple resize-none"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                placeholder="https://www.linkedin.com/in/seu-perfil"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                value={form.linkedin}
                onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEdit(false)}
                className="text-sm text-gray-500 px-4 py-2 rounded-full hover:bg-gray-50"
              >
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
