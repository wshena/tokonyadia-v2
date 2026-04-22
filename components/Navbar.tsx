'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Logo from './Logo'
import Button from './ui/button/Button'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'

const SearchForm = dynamic(() => import('./SearchForm'))
const CartButton = dynamic(() => import('./ui/button/CartButton'))
const CategoryButton = dynamic(() => import('./ui/button/CategoryButton'))
const MobileMenuButton = dynamic(() => import('./ui/button/MobileMenuButton'))
const MobileNavigation = dynamic(() => import('./ui/navigation/MobileNavigation'), { ssr: false })
const UserAccountModal = dynamic(() => import('./ui/modals/UserAccountModal'))

const UserProfileButton = () => {
  const user = useAuthStore(state => state.user)
  const openModal = useUtilityStore(state => state.openModal)

  const fullName = [user?.user_metadata?.first_name, user?.user_metadata?.last_name]
    .filter(Boolean)
    .join(' ')
  const displayName = fullName || user?.user_metadata?.username || user?.email || 'Akun Saya'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <button
      type="button"
      onClick={() =>
        openModal(<UserAccountModal />, {
          contentClassName: 'w-full max-w-md',
        })
      }
      className="cursor-pointer hidden items-center gap-3 rounded-full border border-gray-200 bg-white px-3 py-2 transition-colors hover:border-green-200 hover:bg-green-50 lg:flex"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
        {initial}
      </div>
      <div className="text-left">
        <p className="text-xs text-gray-500">Akun</p>
        <p className="max-w-32 truncate text-sm font-semibold text-gray-900">{displayName}</p>
      </div>
    </button>
  )
}

const CartAndLoginLayout = () => {
  const router = useRouter()
  const user = useAuthStore(state => state.user)

  return (
    <div className="flex items-center gap-3">
      <CartButton />
      {user?.id ? (
        <UserProfileButton />
      ) : (
        <>
          <Button
            onClick={() => router.push('/auth/login')}
            size="sm"
            label="Masuk"
            variant="outline"
            className="hidden border-green-600 text-green-600 lg:block"
          />
          <Button
            onClick={() => router.push('/auth/register')}
            size="sm"
            label="Daftar"
            variant="primary"
            className="hidden bg-green-600 text-white hover:bg-green-600 lg:block"
          />
        </>
      )}
      <MobileMenuButton />
    </div>
  )
}

const LogoCategorySearchLayout = () => {
  return (
    <div className="flex items-center gap-3">
      <Logo />
      <CategoryButton />
      <SearchForm />
    </div>
  )
}

const Navbar = () => {
  return (
    <header>
      <nav className="fixed top-0 left-0 z-50 w-full border-b border-gray-100 bg-white px-5 py-3 text-black">
        <div className="flex items-center justify-between">
          <LogoCategorySearchLayout />
          <CartAndLoginLayout />
        </div>
      </nav>

      <MobileNavigation />
    </header>
  )
}

export default Navbar
