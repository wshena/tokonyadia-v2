'use client'

import Image from 'next/image'
import Link from 'next/link'
import { createSlug } from '@/lib/utils'
import type { ProductCardData } from '../card/ProductCard'

interface DesktopSearchModalProps {
  keyword: string
  products: ProductCardData[]
  isLoading: boolean
  onClose: () => void
}

const DesktopSearchModal = ({
  keyword,
  products,
  isLoading,
  onClose,
}: DesktopSearchModalProps) => {
  const trimmedKeyword = keyword.trim()

  if (!trimmedKeyword) return null

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Pencarian produk</p>
          <p className="text-xs text-gray-500">Hasil untuk &quot;{trimmedKeyword}&quot;</p>
        </div>

        <Link
          href={`/search?keyword=${encodeURIComponent(trimmedKeyword)}`}
          onClick={onClose}
          className="text-sm font-semibold text-green-600 hover:underline"
        >
          Lihat semua
        </Link>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-3 rounded-xl px-3 py-2"
              >
                <div className="h-14 w-14 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-2">
            {products.map((product) => {
              const slug = createSlug(product.title)
              const price =
                product?.price?.withDiscount && product?.price?.withDiscount > 0
                  ? product.price.withDiscount
                  : product?.price?.withoutDiscount

              return (
                <Link
                  key={product.product_id}
                  href={`/product/${product.product_id}/${slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-gray-50"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={product?.images?.['800x900']?.[0]}
                      alt={product?.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-gray-900">{product.title}</p>
                    <p className="mt-1 text-sm font-semibold text-green-600">
                      {product?.price?.currency}
                      {price}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {product?.performance?.sales ?? 0} terjual
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-semibold text-gray-700">Produk belum ditemukan</p>
            <p className="max-w-sm text-xs text-gray-500">
              Coba kata kunci lain untuk melihat produk yang paling mirip dengan pencarianmu.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DesktopSearchModal
