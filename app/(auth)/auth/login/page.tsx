'use client'

import { EyeIcon, EyeSlashIcon, GoogleIcon } from '@/components/icon'
import Logo from '@/components/Logo'
import Button from '@/components/ui/button/Button'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAlert = useUtilityStore(state => state.setAlert)
  const getUser = useAuthStore(state => state.getUser)
  const getSession = useAuthStore(state => state.getSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passClick, setPassClick] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
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

    const supabase = createClient()
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (loginError) {
      setError('Email atau password tidak sesuai.')
      setAlert({ label: loginError.message, type: 'error' })
      return
    }

    getSession(data.session)
    getUser(data.user)
    setAlert({ label: 'Login berhasil. Selamat datang kembali!', type: 'success' })

    const nextPath = searchParams.get('next')
    router.push(nextPath || '/')
    router.refresh()
  }

  return (
    <form onSubmit={handleLogin}>
      <div className="w-[300px] rounded-[10px] border border-gray-300 p-4 shadow-lg md:w-fit md:p-[1.3rem]">
        <div className="flex w-full flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-[1.6rem] font-bold">Masuk ke Akun</h1>
            <p className="text-[1rem]">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-green-500">
                Daftar
              </Link>
            </p>
          </div>

          <Button
            type="button"
            variant="icon"
            color="white"
            icon={<GoogleIcon size={25} />}
            className="flex w-full items-center justify-center gap-3 border border-gray-300 bg-white"
            label="Google"
            disabled
          />

          <div className="flex w-full items-center justify-between gap-[10px]">
            <span className="h-[2px] w-[170px] bg-gray-300" />
            <span className="text-[.8rem]">atau</span>
            <span className="h-[2px] w-[170px] bg-gray-300" />
          </div>

          {error && <p className="text-[0.9rem] text-red-500">{error}</p>}

          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[10px] border border-gray-300 p-[.6rem] focus:outline-none"
            autoComplete="email"
            required
            placeholder="Masukkan email Anda"
          />

          <div className="flex w-full items-center justify-between rounded-[10px] border border-gray-300 p-[.6rem]">
            <input
              type={passClick ? 'text' : 'password'}
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-none focus:outline-none"
              autoComplete="current-password"
              required
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

          <button
            type="submit"
            disabled={loading}
            className={`h-[50px] w-full rounded-[10px] border-2 text-center font-bold transition-colors ${
              loading ? 'cursor-not-allowed bg-gray-400' : 'bg-green-500 text-white'
            }`}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </div>
      </div>
    </form>
  )
}

const Page = () => {
  return (
    <div className="w-screen">
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-[30px]">
          <Logo />
          <div className="flex flex-col items-center gap-x-[40px] md:flex-row">
            <Image
              src="/image/register_icon_new.png"
              alt="login-image"
              width={450}
              height={450}
              sizes="450px"
              className="hidden lg:block"
            />
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
