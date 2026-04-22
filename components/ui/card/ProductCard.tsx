'use client'

import { useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FullHeartIcon, HeartIcon } from '@/components/icon'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { useWishlistStore } from '@/lib/zustand/wishlistStore'
import { createSlug } from '@/lib/utils'

export interface ProductCardData {
  product_id: string
  title: string
  images: {
    ['800x900']: string[]
  }
  price?: {
    currency?: string
    withDiscount?: number
    withoutDiscount?: number
    discountPercentage?: number
  }
  performance?: {
    sales?: number
  }
}

export const ProductCard = (product: ProductCardData) => {
  const [imgError, setImgError] = useState(false)
  const user = useAuthStore(state => state.user)
  const setAlert = useUtilityStore(state => state.setAlert)
  const addToWishlist = useWishlistStore(state => state.addToWishlist)
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist)
  const inWishlist = useWishlistStore(state =>
    Boolean(
      user?.id &&
      state.wishlist
        .find(item => item.userId === user.id)
        ?.products
        .some(savedProduct => savedProduct.product_id === product.product_id)
    )
  )
  const slug = createSlug(product.title)

  const price = product?.price?.withDiscount && product.price.withDiscount > 0
    ? product.price.withDiscount
    : product?.price?.withoutDiscount

  const handleToggleWishlist = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!user?.id) {
      setAlert({ label: 'Login untuk menyimpan produk ke wishlist.', type: 'warning' })
      return
    }

    try {
      if (inWishlist) {
        await removeFromWishlist({ userId: user.id, productId: product.product_id })
        setAlert({ label: 'Produk dihapus dari wishlist.', type: 'success' })
        return
      }

      await addToWishlist({ userId: user.id, product })
      setAlert({ label: 'Produk ditambahkan ke wishlist.', type: 'success' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui wishlist.'
      setAlert({ label: message, type: 'error' })
    }
  }

  return (
    <Link href={`/product/${product?.product_id}/${slug}`} className="group block">
      <div className="relative w-33 space-y-5 bg-white transition md:w-40 lg:w-45">
        <button
          type="button"
          onClick={handleToggleWishlist}
          data-ignore-route-loading="true"
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:scale-105"
          aria-label={inWishlist ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
        >
          {inWishlist ? <FullHeartIcon size={16} color="#dc2626" /> : <HeartIcon size={16} color="#111827" />}
        </button>

        {imgError ? (
          <div className="h-35 w-full rounded-md bg-gray-200 md:h-45" />
        ) : (
          <div className="relative h-35 w-full overflow-hidden rounded-md md:h-45">
            <Image
              src={product?.images?.['800x900']?.[0]}
              alt={product?.title}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 160px, 180px"
              onError={() => setImgError(true)}
              onLoad={(event) => {
                if ((event.currentTarget as HTMLImageElement).naturalWidth === 0) {
                  setImgError(true)
                }
              }}
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          </div>
        )}

        <div className="space-y-1">
          <p className="mt-2 line-clamp-2 text-[.8rem] font-medium md:text-[1rem]">{product.title}</p>
          <p className="text-[.8rem] font-bold md:text-[1rem]">
            {product?.price?.currency}{price}
          </p>
          <div className="flex items-center gap-1 text-[.7rem]">
            <span className="text-gray-400 line-through">
              {product?.price?.currency}{product?.price?.withoutDiscount}
            </span>
            <span className="text-red-400">{product?.price?.discountPercentage}%</span>
          </div>
          <p className="text-xs text-gray-400">{product?.performance?.sales} terjual</p>
        </div>
      </div>
    </Link>
  )
}
