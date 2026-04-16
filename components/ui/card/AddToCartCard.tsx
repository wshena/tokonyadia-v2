'use client'

import { FullHeartIcon, HeartIcon, MinusIcon, PlusIcon } from '@/components/icon'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useCartStore } from '@/lib/zustand/CartStore'
import { useProductStore } from '@/lib/zustand/productStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { useWishlistStore } from '@/lib/zustand/wishlistStore'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import Button from '../button/Button'

const AddToCartCard = ({ productData }: { productData: any }) => {
  const router = useRouter()

  // Zustand stores
  const user     = useAuthStore(state => state.user)
  const stock    = useProductStore(state => state.stock)
  const { carts, tryAddToCart } = useCartStore()
  const { setAlert } = useUtilityStore()
  const addToWishlist = useWishlistStore(state => state.addToWishlist)
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist)
  const isInWishlist = useWishlistStore(state => state.isInWishlist)
  const checkIfOnWishlist = isInWishlist(user?.id, productData?.product_id)

  const [quantity, setQuantity] = useState(1)

  const increaseQuantity = useCallback(() => setQuantity(prev => prev + 1), [])
  const decreaseQuantity = useCallback(() => setQuantity(prev => prev - 1), [])

  const price =
    productData?.price?.withDiscount && productData?.price?.withDiscount > 0
      ? productData.price.withDiscount
      : productData.price.withoutDiscount

  const handleAddToCart = async () => {
    tryAddToCart({
      productData,
      variant: stock.type,
      stock: stock.quantity,
      price,
      quantity,
      timeAddToCart: Date.now(),
    })
  }

  const handleBuy = async () => {
    if (!user?.id) {
      setAlert({ label: 'Anda harus login terlebih dahulu', type: 'warning' })
      return
    }

    const productInCart = carts?.products.find(
      (item: any) =>
        item?.productData?.product_id === productData?.product_id &&
        item?.variant === stock?.type
    )

    if (!productInCart) await handleAddToCart()
    router.push('/checkout')
  }

  const handleToggleWishlist = async () => {
    if (!user?.id) {
      setAlert({ label: 'Login untuk menambahkan produk ke wishlist anda', type: 'error' })
      return
    }

    try {
      if (checkIfOnWishlist) {
        await removeFromWishlist({ userId: user.id, productId: productData?.product_id })
        setAlert({ label: 'Berhasil menghapus produk dari wishlist anda', type: 'success' })
      } else {
        await addToWishlist({ userId: user.id, product: productData })
        setAlert({ label: 'Berhasil menambahkan produk ke wishlist anda', type: 'success' })
      }
    } catch (error: any) {
      setAlert({ label: error?.message ?? 'Gagal menyimpan wishlist', type: 'error' })
    }
  }

  return (
    <div className="w-full md:w-67 h-fit p-4 border border-gray-100 rounded-[10px] shadow-lg order-3 md:order-2 lg:order-3">
      <div className="flex flex-col items-start gap-3.75">

        {/* Title */}
        <h1 className="font-bold text-[1rem]">Atur jumlah dan catatan</h1>

        {/* Variant */}
        <span>Variant: {stock?.type}</span>

        {/* Quantity Control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-between gap-2 border rounded-[10px] p-[.4rem]">
            <button
              onClick={decreaseQuantity}
              disabled={quantity === 1}
              className="cursor-pointer disabled:cursor-not-allowed p-[.3rem]"
            >
              <MinusIcon size={15} color={`${quantity > 1 ? '#42B549' : 'gray'}`} />
            </button>
            <span>{quantity}</span>
            <button
              onClick={increaseQuantity}
              disabled={quantity === stock?.quantity}
              className="cursor-pointer disabled:cursor-not-allowed p-[.3rem]"
            >
              <PlusIcon size={15} color={`${quantity > 1 ? '#42B549' : 'gray'}`} />
            </button>
          </div>
          <span>Stock: {stock?.quantity}</span>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between w-full">
          <span>Subtotal</span>
          <h3 className="font-bold text-[1.3rem]">
            {productData?.price?.currency} {Number((price * quantity).toFixed(2))}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <Button onClick={handleAddToCart} variant='primary' label='+ Keranjang' className='bg-green-600' color='white' />
          <Button onClick={handleBuy} variant='outline' label='Beli Sekarang' className='border border-green-500 text-green-500' />
        </div>

        {/* Wishlist */}
        <div className="flex items-center justify-center w-full">
          <button
            className="cursor-pointer flex items-center gap-1.25"
            onClick={handleToggleWishlist}
          >
            {checkIfOnWishlist ? (
              <FullHeartIcon size={15} color="black" />
            ) : (
              <HeartIcon size={15} color="black" />
            )}
            <span className="font-bold capitalize text-[.9rem]">wishlist</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddToCartCard
