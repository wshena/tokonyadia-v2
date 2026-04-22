'use client'

import React from 'react'
import Image from 'next/image'
import { useCartStore, type Product as CartStoreProduct } from '@/lib/zustand/CartStore'
import { MinusIcon, PlusIcon, TrashIcon } from '@/components/icon'
import Button from '../button/Button'

const CartProductCard = ({ product }: { product: CartStoreProduct }) => {
  const removeFromCart = useCartStore(state => state.removeFromCart)
  const updateQuantity = useCartStore(state => state.updateQuantity)

  const image            = product?.productData?.images["800x900"]?.[0]
  const price =
    product?.productData?.price?.withDiscount && product?.productData?.price?.withDiscount > 0
      ? product.productData.price.withDiscount
      : product.productData.price.withoutDiscount

  const handleIncrease = () => {
    updateQuantity({
      id: product?.productData?.product_id,
      variant: product?.variant,
      quantity: product?.quantity + 1
    })
  }

  const handleDecrease = () => {
    updateQuantity({
      id: product?.productData?.product_id,
      variant: product?.variant,
      quantity: product?.quantity - 1
    })
  }

  return (
    <div className="flex flex-col items-end w-full">
      {/* Product Info */}
      <div className="flex flex-col md:flex-row items-start gap-2.5 w-full">
        {/* Image */}
        <div className="relative w-35 h-25 shrink-0">
          <Image src={image} alt="product-image" fill sizes="140px" loading="lazy" className="object-cover rounded" />
        </div>

        {/* Details */}
        <div className="flex flex-col items-start w-full gap-1">
          {/* Title & Subtotal */}
          <div className="flex items-center justify-between w-full">
            <h2 className="text-[.9rem] line-clamp-2">{product?.productData?.title}</h2>
            <span className="text-[.8rem] shrink-0 ml-2">
              {product?.productData?.price?.currency} {price}
            </span>
          </div>

          {/* Variant */}
          <span className="text-xs text-gray-500">variant: {product?.variant}</span>

          {/* Quantity Control */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 border rounded-lg px-2 py-1">
              <button
                onClick={handleDecrease}
                disabled={product?.quantity <= 1}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                <MinusIcon size={12} color={product?.quantity > 1 ? '#42B549' : 'gray'} />
              </button>

              <span className="text-sm w-5 text-center">{product?.quantity}</span>

              <button
                onClick={handleIncrease}
                disabled={product?.quantity >= product?.stock}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                <PlusIcon size={12} color={product?.quantity < product?.stock ? '#42B549' : 'gray'} />
              </button>
            </div>

            <span className="text-xs text-gray-400">Stok: {product?.stock}</span>
          </div>

          {/* Remove Button */}
          <Button
            onClick={() => removeFromCart({
              id: product?.productData?.product_id,
              variant: product?.variant
            })}
            icon={<TrashIcon size={13} color="black" />}
            variant="icon"
            className="p-1 text-xs text-gray-700 mt-1"
            label="Hapus"
          />
        </div>
      </div>
    </div>
  )
}

export default CartProductCard
