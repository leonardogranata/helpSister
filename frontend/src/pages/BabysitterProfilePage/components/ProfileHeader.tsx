import React, { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as faStarSolid, faCamera, faPenToSquare, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import type { BabysitterProfile } from '../../../services/profileService'
import { updateMe, updateMyProfile } from '../../../services/profileService'
import Modal from './Modal'
import { TEXT_LIMITS, clampText } from '../constants/textLimits'

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
        <FontAwesomeIcon
          key={i}
          icon={i <= Math.round(value) ? faStarSolid : faStarRegular}
          className={`w-4 h-4 ${i <= Math.round(value) ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-sm text-hs-textbody ml-1">{value.toFixed(1)}</span>
    </span>
  )
}

export default function ProfileHeader({ profile, isOwner, onUpdated }: Props) {
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: clampText(profile.name.split(' ')[0], TEXT_LIMITS.profile.firstName),
    last_name: clampText(profile.name.split(' ').slice(1).join(' '), TEXT_LIMITS.profile.lastName),
    phone: clampText(profile.phone, TEXT_LIMITS.profile.phone),
    bio: clampText(profile.bio, TEXT_LIMITS.profile.bio),
    title: clampText(profile.title, TEXT_LIMITS.profile.title),
    linkedin: clampText(profile.linkedin, TEXT_LIMITS.profile.linkedin),
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
    const sanitizedForm = {
      first_name: clampText(form.first_name, TEXT_LIMITS.profile.firstName),
      last_name: clampText(form.last_name, TEXT_LIMITS.profile.lastName),
      phone: clampText(form.phone, TEXT_LIMITS.profile.phone),
      bio: clampText(form.bio, TEXT_LIMITS.profile.bio),
      title: clampText(form.title, TEXT_LIMITS.profile.title),
      linkedin: clampText(form.linkedin, TEXT_LIMITS.profile.linkedin),
    }

    setSaving(true)
    try {
      // Update user info (name, phone, photo)
      const fd = new FormData()
      fd.append('first_name', sanitizedForm.first_name)
      fd.append('last_name', sanitizedForm.last_name)
      fd.append('phone', sanitizedForm.phone)
      if (selectedFile) fd.append('profile_picture', selectedFile)
      await updateMe(fd)

      // Update profile (bio, title)
      const updated = await updateMyProfile({
        bio: sanitizedForm.bio,
        title: sanitizedForm.title,
        linkedin: sanitizedForm.linkedin,
      })
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
  const linkedinValue = clampText(profile.linkedin, TEXT_LIMITS.profile.linkedin)
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
                  <FontAwesomeIcon icon={faCamera} className="w-3.5 h-3.5" />
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
                  <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                  Editar perfil
                </button>
              ) : (
                <span className="inline-flex items-center rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-hs-purple">
                  Perfil publico
                </span>
              )}
            </div>
          </div>

          {/* Name & title */}
          <h1 className="text-2xl font-bold text-hs-purple-dark hs-wrap-text break-words">
            {clampText(profile.name, TEXT_LIMITS.profile.firstName + TEXT_LIMITS.profile.lastName)}
          </h1>
          <p className="text-hs-textbody text-sm mb-1 hs-wrap-text break-words">
            {clampText(profile.title, TEXT_LIMITS.profile.title)}
          </p>

          {/* Location */}
          {(profile.city || profile.state) && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mb-2 min-w-0">
              <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 flex-shrink-0" />
              <span className="hs-wrap-text break-words">
                {[profile.city, profile.state].filter(Boolean).join(', ')}
              </span>
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
            <p className="text-hs-textbody text-sm leading-relaxed hs-wrap-text break-words">
              {clampText(profile.bio, TEXT_LIMITS.profile.bio)}
            </p>
          )}
          {linkedinValue && (
            <a
              href={linkedinHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center mt-3 text-sm text-hs-purple hover:text-hs-purple-dark underline hs-wrap-text break-all"
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
                  maxLength={TEXT_LIMITS.profile.firstName}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                  value={form.last_name}
                  maxLength={TEXT_LIMITS.profile.lastName}
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
                maxLength={TEXT_LIMITS.profile.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple"
                value={form.phone}
                maxLength={TEXT_LIMITS.profile.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sobre mim</label>
              <textarea
                rows={4}
                placeholder="Conte um pouco sobre você, sua experiência e o que você ama fazer com as crianças..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hs-purple resize-none hs-wrap-text"
                value={form.bio}
                maxLength={TEXT_LIMITS.profile.bio}
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
                maxLength={TEXT_LIMITS.profile.linkedin}
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
