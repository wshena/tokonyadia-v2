'use client'

import Link from 'next/link'
import { type FormEvent, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AvatarIcon, CancelIcon, CartIcon, CategoryIcon, PenIcon, SearchIcon } from '@/components/icon'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { createClient } from '@/utils/supabase/client'
import Button from '../button/Button'
import { cn } from '@/lib/utils'

const featuredLinks = [
  {
    label: 'Semua Produk',
    href: '/product/all',
    description: 'Jelajahi katalog lengkap dan temukan promo terbaru.',
    icon: <CartIcon size={20} color="black" />,
  },
  {
    label: 'Cari Produk',
    href: '/search?keyword=promo',
    description: 'Mulai dari kata kunci populer untuk belanja lebih cepat.',
    icon: <SearchIcon size={20} color="black" />,
  },
  {
    label: 'Lihat Kategori',
    href: '/categories/all',
    description: 'Buka bagian kategori utama langsung dari beranda.',
    icon: <CategoryIcon size={20} color="black" />,
  },
]

const guestLinks = [
  { label: 'Masuk', href: '/auth/login' },
  { label: 'Daftar', href: '/auth/register' },
]

const userLinks = [
  { label: 'Pesanan Saya', href: '/order' },
  { label: 'Wishlist Saya', href: '/wishlist' },
  { label: 'Pengaturan Akun', href: '/user/settings' },
]

const MobileNavigation = () => {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const logoutUser = useAuthStore(state => state.logoutUser)
  const isMenuOpen = useUtilityStore((state) => state.isMenuOpen)
  const closeMenu = useUtilityStore((state) => state.closeMenu)
  const setAlert = useUtilityStore((state) => state.setAlert)
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen, closeMenu])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!searchInput.trim()) return

    closeMenu()
    router.push(`/search?keyword=${encodeURIComponent(searchInput.trim())}`)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      setAlert({ label: error.message, type: 'error' })
      return
    }

    logoutUser()
    closeMenu()
    setAlert({ label: 'Berhasil keluar dari akun.', type: 'success' })
    router.push('/')
    router.refresh()
  }

  const fullName = [user?.user_metadata?.first_name, user?.user_metadata?.last_name]
    .filter(Boolean)
    .join(' ')
  const displayName = fullName || user?.user_metadata?.username || user?.email || 'Akun Tokonyadia'

  return (
    <div
      aria-hidden={!isMenuOpen}
      className={cn(
        'fixed inset-0 z-[80] lg:hidden',
        isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/45 transition-opacity duration-300 ease-out',
          isMenuOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeMenu}
      />

      <div
        className={cn(
          'relative ml-auto flex h-screen w-full flex-col bg-[#f7f8f5] shadow-2xl transition-transform duration-300 ease-out md:w-[30rem]',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">Tokonyadia</p>
            <h2 className="text-lg font-bold text-gray-900">Belanja lebih cepat dari perangkatmu</h2>
          </div>

          <Button
            type="button"
            onClick={closeMenu}
            iconOnly
            variant="icon"
            aria-label="Tutup menu"
            icon={<CancelIcon size={24} color="black" />}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
          <form
            onSubmit={handleSearch}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
          >
            <SearchIcon size={20} color="black" />
            <input
              type="text"
              name="mobile-search"
              placeholder="Cari produk, brand, atau promo"
              className="w-full bg-transparent text-sm text-black outline-none"
              autoComplete="off"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </form>

          <div className="mb-6 rounded-3xl bg-green-600 p-5 text-white shadow-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-green-100">Tokonyadia Mobile</p>
            <h3 className="mb-2 text-2xl font-bold leading-tight">Semua kebutuhan belanja dalam satu menu.</h3>
            <p className="text-sm text-green-50">Mulai dari cari produk, cek kategori, sampai mengelola akunmu dengan lebih cepat.</p>
          </div>

          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <CategoryIcon size={18} color="black" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">Akses Cepat</h3>
            </div>

            <div className="space-y-3">
              {featuredLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <div className="rounded-xl bg-green-50 p-3">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-gray-100 p-3">
                <AvatarIcon size={20} color="black" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.id ? displayName : 'Akun Tokonyadia'}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.id
                    ? 'Kelola pesanan dan pengaturan akunmu langsung dari sini.'
                    : 'Masuk untuk menyimpan wishlist dan melacak pesanan.'}
                </p>
              </div>
            </div>

            {user?.id ? (
              <div className="space-y-3">
                {userLinks.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl border border-green-100 px-4 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
                  >
                    <PenIcon size={14} color="#15803d" />
                    {item.label}
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {guestLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="rounded-xl border border-green-200 px-4 py-3 text-center text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">Layanan</h3>

            <div className="space-y-2">
              <Link href="/" onClick={closeMenu} className="block rounded-xl px-3 py-3 text-gray-800 transition-colors hover:bg-gray-50">
                Beranda
              </Link>
              <Link href="/product/all" onClick={closeMenu} className="block rounded-xl px-3 py-3 text-gray-800 transition-colors hover:bg-gray-50">
                Produk Terbaru
              </Link>
              <Link href="/search?keyword=elektronik" onClick={closeMenu} className="block rounded-xl px-3 py-3 text-gray-800 transition-colors hover:bg-gray-50">
                Rekomendasi Elektronik
              </Link>
              <Link href="/search?keyword=rumah" onClick={closeMenu} className="block rounded-xl px-3 py-3 text-gray-800 transition-colors hover:bg-gray-50">
                Kebutuhan Rumah
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default MobileNavigation
