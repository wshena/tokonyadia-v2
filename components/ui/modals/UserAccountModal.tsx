'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AvatarIcon, CancelIcon, CartIcon, CategoryIcon, PenIcon } from '@/components/icon'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { createClient } from '@/utils/supabase/client'

const menuItems = [
  {
    label: 'Pesanan Saya',
    href: '/order',
    description: 'Pantau status pembayaran, pengiriman, dan riwayat transaksi.',
    icon: <CartIcon size={18} color="black" />,
  },
  {
    label: 'Pengaturan Akun',
    href: '/user/settings',
    description: 'Kelola profil, kontak, alamat, dan preferensi akun kamu.',
    icon: <PenIcon size={16} color="black" />,
  },
  {
    label: 'Jelajahi Kategori',
    href: '/categories/all',
    description: 'Temukan produk baru berdasarkan kategori favoritmu.',
    icon: <CategoryIcon size={18} color="black" />,
  },
]

const UserAccountModal = () => {
  const router = useRouter()
  const closeModal = useUtilityStore(state => state.closeModal)
  const setAlert = useUtilityStore(state => state.setAlert)
  const user = useAuthStore(state => state.user)
  const logoutUser = useAuthStore(state => state.logoutUser)

  const fullName = [user?.user_metadata?.first_name, user?.user_metadata?.last_name]
    .filter(Boolean)
    .join(' ')
  const displayName = fullName || user?.user_metadata?.username || user?.email || 'Pengguna'
  const email = user?.email || 'Tidak ada email'
  const initial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      setAlert({ label: error.message, type: 'error' })
      return
    }

    logoutUser()
    closeModal()
    setAlert({ label: 'Berhasil keluar dari akun.', type: 'success' })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-h-[calc(100vh-2rem)] max-w-md rounded-[28px] border border-gray-200 bg-white p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
            {initial || <AvatarIcon size={24} color="#15803d" />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
              Akun Saya
            </p>
            <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeModal}
          className="cursor-pointer rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
          aria-label="Tutup modal akun"
        >
          <CancelIcon size={20} color="black" />
        </button>
      </div>

      <div className="mt-5 space-y-3 max-h-62.5 overflow-y-auto">
        {menuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeModal}
            className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-green-200 hover:bg-green-50"
          >
            <div className="rounded-xl bg-white p-3 shadow-sm">
              {item.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-gray-500">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4">
        <p className="text-sm leading-6 text-green-800">
          Akunmu aktif dan siap dipakai untuk belanja, melacak order, serta menyimpan preferensi belanja.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
        >
          Keluar dari Akun
        </button>
      </div>
    </div>
  )
}

export default UserAccountModal
