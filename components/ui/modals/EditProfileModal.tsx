'use client'

import React, { useState, useEffect } from 'react'
import ModalContainer from './ModalContainer'
import { updateUser, UserProfile } from '@/lib/db/user'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: {
    username: string
    firstName: string
    lastName: string
    gender: string
    phoneNumber: string
    address: string
    birthDate: string
  }
  onSuccess?: () => void
}

const inputStyle = 'w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors'
const labelStyle = 'text-sm font-medium text-gray-700'

const EditProfileModal = ({ isOpen, onClose, initialData, onSuccess }: EditProfileModalProps) => {
  const user     = useAuthStore(state => state.user)
  const setAlert = useUtilityStore(state => state.setAlert)
  const getUser = useAuthStore(state => state.getUser)

  const [formData, setFormData] = useState<UserProfile>({
    username:       initialData.username === '-' ? '' : initialData.username,
    firstName:      initialData.firstName === '-' ? '' : initialData.firstName,
    lastName:       initialData.lastName === '-' ? '' : initialData.lastName,
    sex:            initialData.gender === '-' ? '' : initialData.gender,
    phoneNumber:    initialData.phoneNumber === '-' ? '' : initialData.phoneNumber,
    address:        initialData.address === 'Belum menambahkan alamat utama.' ? '' : initialData.address,
    date:           initialData.birthDate,
    profilePicture: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')

  // Reset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username:       initialData.username === '-' ? '' : initialData.username,
        firstName:      initialData.firstName === '-' ? '' : initialData.firstName,
        lastName:       initialData.lastName === '-' ? '' : initialData.lastName,
        sex:            initialData.gender === '-' ? '' : initialData.gender,
        phoneNumber:    initialData.phoneNumber === '-' ? '' : initialData.phoneNumber,
        address:        initialData.address === 'Belum menambahkan alamat utama.' ? '' : initialData.address,
        date:           initialData.birthDate,
        profilePicture: '',
      })
      setError('')
    }
  }, [isOpen])

  const update = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    setError('')

    try {
      const updatedAuth = await updateUser(user.id, formData)

      if (updatedAuth?.user) {
        getUser(updatedAuth.user)
      }

      setAlert({ label: 'Profil berhasil diperbarui!', type: 'success' })
      onSuccess?.()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(message)
      setAlert({ label: message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="w-full max-w-lg"
    >
      <div className="bg-white rounded-[28px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-700 px-6 py-5 text-white">
          <h2 className="text-xl font-bold">Ubah Profil</h2>
          <p className="mt-1 text-sm text-slate-300">Perbarui informasi akun kamu</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 overflow-y-auto max-h-[65vh]">

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className={labelStyle}>Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={e => update('username', e.target.value)}
              className={inputStyle}
              placeholder="Username"
              autoComplete="off"
            />
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelStyle}>Nama Depan</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => update('firstName', e.target.value)}
                className={inputStyle}
                placeholder="Nama depan"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelStyle}>Nama Belakang</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => update('lastName', e.target.value)}
                className={inputStyle}
                placeholder="Nama belakang"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className={labelStyle}>Jenis Kelamin</label>
            <div className="flex items-center gap-4">
              {['laki-laki', 'perempuan'].map(gender => (
                <label key={gender} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    value={gender}
                    checked={formData.sex === gender}
                    onChange={e => update('sex', e.target.value)}
                    className="accent-green-500"
                  />
                  <span className="text-sm capitalize">{gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className={labelStyle}>Nomor Handphone</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={e => update('phoneNumber', e.target.value)}
              className={inputStyle}
              placeholder="Nomor handphone"
              autoComplete="off"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className={labelStyle}>Alamat</label>
            <textarea
              value={formData.address}
              onChange={e => update('address', e.target.value)}
              className={inputStyle}
              placeholder="Alamat lengkap"
              rows={3}
              autoComplete="off"
            />
          </div>

          {/* Birth Date */}
          <div className="space-y-1.5">
            <label className={labelStyle}>Tanggal Lahir</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => update('date', e.target.value)}
              className={inputStyle}
            />
          </div>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Menyimpan...
              </span>
            ) : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </ModalContainer>
  )
}

export default EditProfileModal