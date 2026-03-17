'use client'

import React from 'react'
import Image from 'next/image'
import { useCartStore } from '@/lib/zustand/CartStore'
import { TrashIcon } from '@/components/icon'
import Button from '../button/Button'


const CartProductCard = ({ product }: { product: any }) => {
  const removeFromCart = useCartStore(state => state.removeFromCart)

  const image           = product?.productData?.images["800x900"]?.[0]
  const price           = product?.price
  const product_subtotal = Number((product?.quantity * price).toFixed(2))

  return (
    <div className="flex flex-col items-end w-full">
      {/* Product Info */}
      <div className="flex flex-col md:flex-row items-start gap-2.5 w-full">
        {/* Image */}
        <div className="relative w-35 h-25">
          <Image src={image} alt="product-image" fill className="object-cover" />
        </div>

        {/* Details */}
        <div className="flex flex-col items-start w-full">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-[1rem]">{product?.productData?.title}</h2>
            <span className='text-[.8rem]'>{product?.productData?.price?.currency} {product_subtotal}</span>
          </div>
          
          <div className="text-sm flex flex-col gap-1">
            <span>jumlah: {product?.quantity}</span>
            <span>variant: {product?.variant}</span>
          
            {/* Remove Button */}
            <Button
              onClick={() => removeFromCart({
                id: product?.productData?.product_id,
                variant: product?.variant
              })}
              icon={ <TrashIcon size={15} color='black' /> } 
              variant='icon' 
              className='p-1 text-sm text-gray-700' 
              label='Hapus'
            />
            </div>
        </div>

      </div>

    </div>
  )
}

export default CartProductCard