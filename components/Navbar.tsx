'use client'

import { useRouter } from 'next/navigation'
import Logo from './Logo'
import SearchForm from './SearchForm'
import Button from './ui/button/Button'
import CartButton from './ui/button/CartButton'
import CategoryButton from './ui/button/CategoryButton'
import MobileMenuButton from './ui/button/MobileMenuButton'
import MobileNavigation from './ui/navigation/MobileNavigation'

const CartAndLoginLayout = () => {
  const router = useRouter()

  return (
    <div className="flex items-center gap-3">
      <CartButton />
      <Button onClick={() => router.push('/auth/login')} size='sm' label='Masuk' variant='outline' className='hidden lg:block text-green-600 border-green-600' />
      <Button onClick={() => router.push('/auth/register')} size='sm' label='Daftar' variant='primary' className='hidden lg:block bg-green-600 text-white hover:bg-green-600' />
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
      <nav className='z-50 fixed top-0 left-0 w-full bg-white text-black px-5 py-3 border-b border-gray-100'>
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
