'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore, type Product as CartStoreProduct } from '@/lib/zustand/CartStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { calculateTotalPrice } from '@/lib/utils'
import CartProductCard from '../card/CartProductCard'
import Button from '../button/Button'

const LinkToCart = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="flex items-center justify-between w-full pb-2.5 border-b">
      <h1 className="font-bold text-[1rem]">Keranjang</h1>
      <Link href="/cart" onClick={onClose} className="font-bold capitalize text-green-500">lihat</Link>
    </div>
  )
}

const IfEmpty = ({ onClose }: { onClose: () => void }) => {
  return (
    <>
      <LinkToCart onClose={onClose} />
      <h1 className="font-bold text-[1.3rem]">Wah belanjaanmu kosong nih</h1>
      <h2 className="text-[.9rem] text-gray-600">Yuk isi dengan barang-barang impianmu!</h2>
      <div className="relative w-1/2 h-32.5">
        <Image src="/image/empty-cart.png" fill alt="product-empty" sizes="160px" loading="lazy" className="object-contain" />
      </div>
      <Link href="/" onClick={onClose}>
        <Button variant='outline' label='Mulai Belanja' className='border border-green-500 text-green-500' />
      </Link>
    </>
  )
}

const CartModal = () => {
  const router     = useRouter()
  const { carts }  = useCartStore()
  const setCartButtonHover = useUtilityStore(state => state.setCartButtonHover)
  const setModalBackground = useUtilityStore(state => state.setModalBackground)
  const cartProducts = carts?.products ?? []
  const shouldScrollProductList = cartProducts.length > 3
  const closeCartModal = () => {
    setCartButtonHover(false)
    setModalBackground(false)
  }

  const subtotal = cartProducts.length > 0
    ? Number(calculateTotalPrice(cartProducts).toFixed(2))
    : 0
  const currency = cartProducts[0]?.productData?.price?.currency

  return (
    <div className="z-50 hidden lg:block p-4 w-87.5 h-fit rounded-[10px] bg-white text-black shadow-xl">
      <div className="flex flex-col items-center gap-5">
        {cartProducts.length <= 0 ? (
          <IfEmpty onClose={closeCartModal} />
        ) : (
          <>
            <LinkToCart onClose={closeCartModal} />

            {/* Product List */}
            <div
              className={`flex w-full flex-col items-start gap-3.75 ${
                shouldScrollProductList ? 'max-h-90 overflow-y-auto pr-2' : ''
              }`}
            >
              {cartProducts.map((item: CartStoreProduct) => (
                <CartProductCard
                  key={`${item?.productData?.product_id} - ${item?.variant}`}
                  product={item}
                />
              ))}
            </div>

            {/* Total & Checkout */}
            <div className="flex flex-col items-start gap-2.5 pt-2.5 w-full border-t">
              <div className="flex items-center justify-between w-full">
                <span>Total:</span>
                <span className="font-bold text-[1rem]">{currency} {subtotal}</span>
              </div>
              <Button
                onClick={() => {
                  closeCartModal()
                  router.push('/cart')
                }}
                variant='primary'
                className='bg-green-600 w-full text-center'
                color='white'
                label='Beli'
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CartModal
