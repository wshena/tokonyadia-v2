'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/zustand/CartStore'
import { calculateTotalPrice } from '@/lib/utils'
import CartProductCard from '../card/CartProductCard'
import Button from '../button/Button'

const LinkToCart = () => {
  return (
    <div className="flex items-center justify-between w-full pb-2.5 border-b">
      <h1 className="font-bold text-[1rem]">Keranjang</h1>
      <Link href="/cart" className="font-bold capitalize text-green-500">lihat</Link>
    </div>
  )
}

const IfEmpty = () => {
  return (
    <>
      <LinkToCart />
      <h1 className="font-bold text-[1.3rem]">Wah belanjaanmu kosong nih</h1>
      <h2 className="text-[.9rem] text-gray-600">Yuk isi dengan barang-barang impianmu!</h2>
      <div className="relative w-1/2 h-32.5">
        <Image src="/image/empty-cart.png" fill alt="product-empty" />
      </div>
      <Link href="/">
        <Button variant='outline' label='Mulai Belanja' className='border border-green-500 text-green-500' />
      </Link>
    </>
  )
}

const CartModal = () => {
  const router     = useRouter()
  const { carts }  = useCartStore()

  const subtotal = carts?.products?.length > 0
    ? Number(calculateTotalPrice(carts.products).toFixed(2))
    : 0
  const currency = carts?.products[0]?.productData?.price?.currency

  return (
    <div className="z-50 hidden lg:block p-4 w-87.5 h-fit rounded-[10px] bg-white text-black shadow-lg">
      <div className="flex flex-col items-center gap-5">
        {carts?.products?.length <= 0 ? (
          <IfEmpty />
        ) : (
          <>
            <LinkToCart />

            {/* Product List */}
            <div className="flex flex-col items-start gap-3.75 w-full">
              {carts?.products?.map((item: any) => (
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
              <Button onClick={() => router.push('/cart')} variant='primary' className='bg-green-600 w-full text-center' color='white' label='Beli' />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CartModal