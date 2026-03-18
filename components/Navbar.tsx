import Logo from './Logo'
import SearchForm from './SearchForm'
import Button from './ui/button/Button'
import CartButton from './ui/button/CartButton'

const CartAndLoginLayout = () => {
  return (
    <div className="flex items-center gap-3">
      <CartButton />
      <Button size='sm' label='Masuk' variant='outline' className='hidden md:block text-green-600 border-green-600' />
      <Button size='sm' label='Daftar' variant='primary' className='hidden md:block bg-green-600 text-white hover:bg-green-600' />
    </div>
  )
}

const LogoCategorySearchLayout = () => {
  return (
    <div className="flex items-center gap-3">
      <Logo />
      <Button label='Kategori' variant='ghost' className='hidden md:block text-gray-600 font-medium text-md hover:bg-gray-200' />
      <SearchForm />
    </div>
  )
}

const Navbar = () => {
  return (
    <nav className='z-10 fixed top-0 left-0 w-full bg-white text-black px-5 py-3 border-b border-gray-100'>
      <div className="flex items-center justify-between">
        <LogoCategorySearchLayout />
        <CartAndLoginLayout />
      </div>
    </nav>
  )
}

export default Navbar