'use client'

import { EyeIcon, EyeSlashIcon } from '@/components/icon'
import Logo from '@/components/Logo'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const formStyle = 'border border-gray-300 p-2 w-full focus:outline-none rounded-[10px]'

interface FormData {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
  sex: string
  phoneNumber: string
  address: string
  date: string
  profilePicture: string
}

const RegisterForm = () => {
  const router = useRouter()

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

    // const { data, error } = await supabase.auth.signUp({
    //   email: formData.email,
    //   password: formData.password,
    // })

    // if (error) {
    //   setError(error.message)
    //   setLoading(false)
    //   return
    // }

    // if (data?.user?.id) {
    //   await createUser(data.user.id, { ...formData })
    // }

    setLoading(false)
    router.push('/auth/login')
  }

  return (
    <div className="w-[300px] md:w-[500px] px-[1.4rem] py-[3rem] bg-white rounded-[10px] border border-gray-300 shadow-lg">

      {/* Header */}
      <div className="flex flex-col items-start gap-1 mb-[30px]">
        <h1 className="font-bold text-[1rem] md:text-[1.5rem]">Daftar ke Tokonyadia</h1>
        <h2 className="text-[.9rem]">
          <span>Sudah ada akun? </span>
          <Link href="/auth/login" className="text-mainGreen">Masuk ke Tokonyadia</Link>
        </h2>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
        <div className="h-[2px] flex-1 bg-gray-200" />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
      </div>

      {/* ===== STEP 1 ===== */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit}>
          <div className="flex flex-col items-start gap-5 w-full">

            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              required
              onChange={(e) => updateFormData({ username: e.target.value })}
              className={formStyle}
              autoComplete="off"
            />

            {/* First & Last Name */}
            <div className="flex items-center justify-between gap-[10px] w-full">
              <input
                type="text"
                placeholder="First Name"
                required
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                className={formStyle}
                autoComplete="off"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                className={formStyle}
                autoComplete="off"
              />
            </div>

            {/* Phone Number */}
            <input
              type="text"
              placeholder="Nomor Handphone"
              required
              onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
              className={formStyle}
              autoComplete="off"
            />

            {/* Jenis Kelamin */}
            <div className="flex items-center gap-[10px]">
              <div className="flex items-center gap-2">
                <label htmlFor="male" className="text-[1rem] cursor-pointer">Laki-laki</label>
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
                <label htmlFor="female" className="text-[1rem] cursor-pointer">Perempuan</label>
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

            {/* Alamat */}
            <textarea
              placeholder="Alamat"
              required
              onChange={(e) => updateFormData({ address: e.target.value })}
              className={formStyle}
              autoComplete="off"
              rows={5}
            />

            {/* Tanggal Lahir */}
            <div className="flex items-center gap-5">
              <label htmlFor="date" className="text-sm">Tanggal Lahir:</label>
              <input
                type="date"
                name="date"
                id="date"
                required
                onChange={(e) => updateFormData({ date: e.target.value })}
                className="border border-gray-300 p-1 rounded-[10px] focus:outline-none"
              />
            </div>

          </div>

          <button
            type="submit"
            className="cursor-pointer mt-6 w-full bg-green-500 text-white px-4 py-2 rounded-[10px]"
          >
            Selanjutnya
          </button>
        </form>
      )}

      {/* ===== STEP 2 ===== */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit}>
          <div className="flex flex-col items-start gap-5 w-full">

            {/* Error */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Email */}
            <input
              type="email"
              placeholder="Alamat Email"
              required
              onChange={(e) => updateFormData({ email: e.target.value })}
              className={formStyle}
              autoComplete="off"
            />

            {/* Password */}
            <div className="flex items-center justify-between w-full p-[.6rem] rounded-[10px] border border-gray-300">
              <input
                type={passClick ? 'text' : 'password'}
                name="password"
                id="password"
                onChange={(e) => updateFormData({ password: e.target.value })}
                className="border-none focus:outline-none w-full"
                required
                placeholder="Masukkan password"
              />
              <button
                type="button"
                onClick={() => setPassClick(!passClick)}
                className="p-1"
              >
                {passClick
                  ? <EyeSlashIcon size={20} color="black" />
                  : <EyeIcon size={20} color="black" />
                }
              </button>
            </div>

          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="cursor-pointer bg-gray-500 text-white px-4 py-2 rounded-[10px]"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`cursor-pointer px-4 py-2 rounded-[10px] text-white transition-colors ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500'
              }`}
            >
              {loading ? 'Loading...' : 'Daftar'}
            </button>
          </div>
        </form>
      )}

    </div>
  )
}

const page = () => {
  return (
    <div className="w-full relative">
      {/* Background Image */}
      <div className="flex items-center justify-center w-full h-screen">
          <Image src="/image/login-bg.png" alt="login-image" width={700} height={700} />
      </div>

      {/* Content — absolute overlay */}
      <div className="absolute top-0 left-0 w-full h-fit 2xl:h-screen flex items-center justify-center py-[100px]">
        <div className="flex flex-col items-center gap-[40px]">
          <Logo />
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

export default page