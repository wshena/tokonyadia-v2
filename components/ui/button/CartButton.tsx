'use client'

import { useRef } from 'react'
import { useCartStore } from '@/lib/zustand/CartStore'
import CartModal from '../modals/CartModal'
import Button from './Button'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { CartIcon } from '@/components/icon'

interface CartButtonProps {
  withBackground?: boolean
}

const CartButton = ({ withBackground = true }: CartButtonProps) => {
  const { carts }          = useCartStore()
  const cartButtonHover    = useUtilityStore(state => state.cartButtonHover)
  const setCartButtonHover = useUtilityStore(state => state.setCartButtonHover)
  const setModalBackground = useUtilityStore(state => state.setModalBackground)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)  // ← delay close

  const total = carts?.products?.reduce((acc, item: any) => acc + item.quantity, 0)

  const handleMouseEnter = () => {
    // Cancel close jika sedang pending
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setCartButtonHover(true)
    if (withBackground) setModalBackground(true)
  }

  const handleMouseLeave = () => {
    // Delay close — beri waktu mouse pindah ke CartModal
    timeoutRef.current = setTimeout(() => {
      setCartButtonHover(false)
      if (withBackground) setModalBackground(false)
    }, 100)
  }

  return (
    <>
      {/* Background overlay — diklik untuk tutup */}
      {cartButtonHover && withBackground && (
        <div
          className="fixed top-0 left-0 w-full h-screen bg-black/80 z-40"
          onMouseEnter={handleMouseLeave}  // ← mouse masuk overlay = tutup
        />
      )}

      <div
        className="relative hidden md:block z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Cart Icon */}
        <Button
          iconOnly
          icon={<CartIcon size={25} color="black" />}
          variant="icon"
          className="hidden md:block"
        />

        {/* Count Badge */}
        {total !== 0 && (
          <div className="absolute -top-1 -right-1 py-0 px-2 rounded-full text-white bg-red-400">
            <span className="text-[.8rem]">{total}</span>
          </div>
        )}

        {/* Cart Modal */}
        {cartButtonHover && (
          <div
            className="absolute top-7.5 -right-25 z-50"
            onMouseEnter={handleMouseEnter}  // ← mouse masuk modal = batalkan close
            onMouseLeave={handleMouseLeave}  // ← mouse keluar modal = tutup
          >
            <CartModal />
          </div>
        )}
      </div>
    </>
  )
}

export default CartButton