'use client'

import { EyeIcon, EyeSlashIcon } from '@/components/icon'
import Logo from '@/components/Logo'
import { createUser, type UserProfile } from '@/lib/db/user'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const formStyle = 'w-full rounded-[10px] border border-gray-300 p-2 focus:outline-none'

interface FormData extends UserProfile {
  email: string
  password: string
}

const RegisterForm = () => {
  const router = useRouter()
  const setAlert = useUtilityStore(state => state.setAlert)

  const [step, setStep] = useState(1)
  const [passClick, setPassClick] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedGender, setSelectedGender] = useState('')

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    sex: '',
    phoneNumber: '',
    address: '',
    date: '',
    profilePicture: '',
  })

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedGender(e.target.value)
    updateFormData({ sex: e.target.value })
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          sex: formData.sex,
          phone_number: formData.phoneNumber,
          address: formData.address,
          birth_date: formData.date,
          profile_picture: formData.profilePicture,
        },
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      setAlert({ label: signUpError.message, type: 'error' })
      return
    }

    if (!data.user?.id) {
      setError('User berhasil dibuat di autentikasi, tetapi id user tidak ditemukan.')
      setAlert({
        label: 'User berhasil dibuat di autentikasi, tetapi profil gagal diproses.',
        type: 'error',
      })
      return
    }

    try {
      await createUser(data.user.id, {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        sex: formData.sex,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        date: formData.date,
        profilePicture: formData.profilePicture,
      })
    } catch (profileError) {
      const message =
        profileError instanceof Error
          ? profileError.message
          : 'Profil user gagal disimpan ke database.'

      setError(message)
      setAlert({ label: message, type: 'error' })
      return
    }

    setAlert({
      label: 'Pendaftaran berhasil. Silakan cek email atau langsung login jika konfirmasi email dimatikan.',
      type: 'success',
    })
    router.push('/auth/login')
  }

  return (
    <div className="w-75 rounded-[10px] border border-gray-300 bg-white px-[1.4rem] py-12 shadow-lg md:w-125">
      <div className="mb-7.5 flex flex-col items-start gap-1">
        <h1 className="text-[1rem] font-bold md:text-[1.5rem]">Daftar ke Tokonyadia</h1>
        <h2 className="text-[.9rem]">
          <span>Sudah ada akun? </span>
          <Link href="/auth/login" className="text-mainGreen">
            Masuk ke Tokonyadia
          </Link>
        </h2>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
        <div className="h-0.5 flex-1 bg-gray-200" />
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1Submit}>
          <div className="flex w-full flex-col items-start gap-5">
            <input
              type="text"
              placeholder="Username"
              required
              value={formData.username}
              onChange={(e) => updateFormData({ username: e.target.value })}
              className={formStyle}
              autoComplete="off"
            />

            <div className="flex w-full items-center justify-between gap-2.5">
              <input
                type="text"
                placeholder="First Name"
                required
                value={formData.firstName}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                className={formStyle}
                autoComplete="off"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                className={formStyle}
                autoComplete="off"
              />
            </div>

            <input
              type="text"
              placeholder="Nomor Handphone"
              required
              value={formData.phoneNumber}
              onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
              className={formStyle}
              autoComplete="off"
            />

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <label htmlFor="male" className="cursor-pointer text-[1rem]">Laki-laki</label>
                <input
                  type="radio"
                  name="sex"
                  id="male"
                  value="laki-laki"
                  checked={selectedGender === 'laki-laki'}
                  onChange={handleGenderChange}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="female" className="cursor-pointer text-[1rem]">Perempuan</label>
                <input
                  type="radio"
                  name="sex"
                  id="female"
                  value="perempuan"
                  checked={selectedGender === 'perempuan'}
                  onChange={handleGenderChange}
                  required
                />
              </div>
            </div>

            <textarea
              placeholder="Alamat"
              required
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              className={formStyle}
              autoComplete="off"
              rows={5}
            />

            <div className="flex items-center gap-5">
              <label htmlFor="date" className="text-sm">Tanggal Lahir:</label>
              <input
                type="date"
                name="date"
                id="date"
                required
                value={formData.date}
                onChange={(e) => updateFormData({ date: e.target.value })}
                className="rounded-[10px] border border-gray-300 p-1 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full cursor-pointer rounded-[10px] bg-green-500 px-4 py-2 text-white"
          >
            Selanjutnya
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit}>
          <div className="flex w-full flex-col items-start gap-5">
            {error && <p className="text-sm text-red-500">{error}</p>}

            <input
              type="email"
              placeholder="Alamat Email"
              required
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className={formStyle}
              autoComplete="email"
            />

            <div className="flex w-full items-center justify-between rounded-[10px] border border-gray-300 p-[.6rem]">
              <input
                type={passClick ? 'text' : 'password'}
                name="password"
                id="password"
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                className="w-full border-none focus:outline-none"
                required
                autoComplete="new-password"
                placeholder="Masukkan password"
              />
              <button
                type="button"
                onClick={() => setPassClick(!passClick)}
                className="p-1"
              >
                {passClick ? <EyeSlashIcon size={20} color="black" /> : <EyeIcon size={20} color="black" />}
              </button>
            </div>
          </div>

          <div className="mt-5 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="cursor-pointer rounded-[10px] bg-gray-500 px-4 py-2 text-white"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer rounded-[10px] bg-green-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

const Page = () => {
  return (
    <div className="w-screen">
      <div className="flex min-h-screen w-full items-center justify-center py-10">
        <div className="flex flex-col items-center gap-7.5">
          <Logo />
          <div className="flex flex-col items-center gap-y-10 xl:gap-y-0 xl:gap-x-10 xl:flex-row">
            <Image
              src="/image/register_icon_new.png"
              alt="register-image"
              width={450}
              height={450}
              className="hidden xl:block"
            />
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
