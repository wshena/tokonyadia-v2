'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSlug } from '@/lib/utils'

export const ProductCard = (product: any) => {
  const [imgError, setImgError] = useState(false)

  const slug = createSlug(product.title)

  return (
    <Link href={`/product/${product?.product_id}/${slug}`}>
      <div className="w-33 md:w-40 lg:w-45 items-start bg-white space-y-5 transition">
        {imgError ? (
          <div className='w-full h-35 md:h-45 bg-gray-400 rounded-md' />
        ) : (
          <div className="w-full h-35 md:h-45 relative rounded-t-[5px] rounded-md">
            <Image
              src={product?.images["800x900"]?.[0]}
              alt={product?.title}
              fill
              loading='lazy'
              onError={() => setImgError(true)}
              onLoad={(e) => {
                if ((e.currentTarget as HTMLImageElement).naturalWidth === 0) {
                  setImgError(true)
                }
              }}
            />
          </div>
        )}

        <div className='space-y-1'>
          <p className="mt-2 text-[.8rem] md:text-[1rem] font-medium line-clamp-2">{product.title}</p>
          <p className="text-[.8rem] md:text-[1rem] font-bold">{product.price.currency}{product.price.withDiscount}</p>
          <div className="flex items-center text-[.7rem] gap-1">
            <span className='line-through text-gray-400'>{product?.price?.currency}{product?.price?.withoutDiscount}</span>
            <span className='text-red-400'>{product?.price?.discountPercentage}%</span>
          </div>
          <p className="text-xs text-gray-400">{product.performance.sales} terjual</p>
        </div>
      </div>
    </Link>
  )
}