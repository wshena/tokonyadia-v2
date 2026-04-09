'use client'

import Button from './Button'
import { CancelIcon, MenuIcon } from '@/components/icon'
import { useUtilityStore } from '@/lib/zustand/utilityStore'

const MobileMenuButton = () => {
  const isMenuOpen = useUtilityStore((state) => state.isMenuOpen)
  const toggleMenu = useUtilityStore((state) => state.toggleMenu)

  return (
    <Button
      type="button"
      aria-label={isMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
      aria-expanded={isMenuOpen}
      onClick={toggleMenu}
      iconOnly
      variant="icon"
      className="lg:hidden"
      icon={isMenuOpen ? <CancelIcon size={26} color="black" /> : <MenuIcon size={24} color="black" />}
    />
  )
}

export default MobileMenuButton
