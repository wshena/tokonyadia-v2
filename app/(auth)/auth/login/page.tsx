'use client'

import { EyeIcon, EyeSlashIcon, GoogleIcon } from '@/components/icon'
import Logo from '@/components/Logo'
import Button from '@/components/ui/button/Button'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const LoginForm = () => {
  const router   = useRouter()
  const setAlert = useUtilityStore(state => state.setAlert)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [passClick, setPassClick] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Email dan password harus diisi.')
      return
    }

    if (!isValidEmail(email)) {
      setError('Format email tidak valid.')
      return
    }

    setError(null)
    setLoading(true)

    // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    // console.log('Login response:', data)

    setLoading(false)

    // if (error) {
    //   setError(error.message)
    //   setAlert({ label: error.message, type: 'error' })
    //   return
    // }

    router.push('/')
  }

  return (
    <form onSubmit={handleLogin}>
      <div className="w-[300px] md:w-fit p-4 md:p-[1.3rem] rounded-[10px] border shadow-lg">
        <div className="flex flex-col items-center w-full gap-5">

          {/* Heading */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-bold text-[1.6rem]">Masuk ke Akun</h1>
            <p className="text-[1rem]">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-green-500">
                Daftar
              </Link>
            </p>
          </div>

          {/* Google Button */}
          <Button variant={'icon'} color='white' icon={<GoogleIcon size={25} />} className='bg-white w-full border border-gray-300 flex items-center justify-center gap-3' label='Google' />

          {/* Divider */}
          <div className="flex items-center justify-between gap-[10px] w-full">
            <span className="h-[2px] w-[170px] bg-gray-300" />
            <span className="text-[.8rem]">atau</span>
            <span className="h-[2px] w-[170px] bg-gray-300" />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-[0.9rem]">{error}</p>
          )}

          {/* Email Input */}
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-[.6rem] rounded-[10px] border border-gray-300 focus:outline-none w-full"
            autoComplete="off"
            required
            placeholder="Masukkan email Anda"
          />

          {/* Password Input */}
          <div className="flex items-center justify-between w-full p-[.6rem] rounded-[10px] border border-gray-300">
            <input
              type={passClick ? 'text' : 'password'}
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-[50px] rounded-[10px] text-center border-2 font-bold transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white'
            }`}
          >
            {loading ? 'Loading...' : 'Masuk'}
          </button>

        </div>
      </div>
    </form>
  )
}

const page = () => {
  return (
    <div className="w-screen">
      <div className="flex items-center justify-center w-full h-screen">
        <div className="flex flex-col items-center gap-[30px]">
          <Logo />
          <div className="flex flex-col md:flex-row items-center gap-x-[40px]">
            <Image
              src="/image/register_icon_new.png"
              alt="login-image"
              width={450}
              height={450}
              className="hidden lg:block"
            />
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default page