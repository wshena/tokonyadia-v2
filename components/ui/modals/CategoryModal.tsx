'use client'

import React, { useEffect, useState } from 'react'
import { getAllCategories } from '@/lib/db/categories'
import { getProductsByIds } from '@/lib/db/products'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { ProductCard } from '@/components/ui/card/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/card/ProductCardSkeleton'
import Link from 'next/link'
import { createSlug } from '@/lib/utils'

type Category = {
  category_id: string
  title: string
  thumbnail: string
  path: string
  products: string[]
}

const CategoryModal = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load semua categories saat mount
  useEffect(() => {
    const { data } = getAllCategories(1, 100)
    setCategories(data as Category[])
    if (data.length > 0) setSelectedCategory(data[0] as Category)
  }, [])

  // Load products saat selectedCategory berubah
  useEffect(() => {
    if (!selectedCategory) return

    setIsLoading(true)
    const { data } = getProductsByIds(selectedCategory.products, 1, 8)
    setProducts(data)
    setIsLoading(false)
  }, [selectedCategory])

  return (
    <div className="flex w-[700px] lg:w-[950px] xl:w-[1000px] 2xl:w-[1300px] h-[450px] bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden p-3">

      {/* Side Tabs — daftar kategori */}
      <div className="w-[180px] shrink-0 border-r border-gray-100 overflow-y-auto">
        {categories.map((category) => (
          <button
            key={category.category_id}
            onClick={() => setSelectedCategory(category)}
            className={`cursor-pointer w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${
              selectedCategory?.category_id === category.category_id
                ? 'text-green-600 font-semibold bg-green-50 border-r-2 border-green-500'
                : 'text-gray-700'
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>

      {/* Product Display */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-[.95rem]">{selectedCategory?.title}</h2>
          {selectedCategory && (
            <Link
              href={`/categories/${selectedCategory.category_id}/${createSlug(selectedCategory.title)}`}
              className="text-green-600 text-sm hover:underline"
            >
              Lihat semua
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedCategory ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">Pilih kategori</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : products.map((product) => (
                    <ProductCard key={product.product_id} {...product} />
                  ))
              }
              {!isLoading && products.length === 0 && (
                <div className="col-span-4 flex items-center justify-center h-[200px]">
                  <p className="text-gray-400 text-sm">Tidak ada produk</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default CategoryModal