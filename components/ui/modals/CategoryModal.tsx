'use client'

import React, { useMemo, useState } from 'react'
import { getAllCategories } from '@/lib/db/categories'
import { getProductsByIds } from '@/lib/db/products'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { ProductCard, type ProductCardData } from '@/components/ui/card/ProductCard'
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
  const [categories] = useState<Category[]>(() => getAllCategories(1, 100).data as Category[])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(() => categories[0] ?? null)
  const setCategoryButtonHover = useUtilityStore(state => state.setCategoryButtonHover)
  const setModalBackground = useUtilityStore(state => state.setModalBackground)

  const closeCategoryModal = () => {
    setCategoryButtonHover(false)
    setModalBackground(false)
  }
  const products = useMemo<ProductCardData[]>(
    () => (selectedCategory ? getProductsByIds(selectedCategory.products, 1, 100).data : []),
    [selectedCategory]
  )

  return (
    <div className="flex w-175 lg:w-237.5 xl:w-250 2xl:w-325 h-112.5 bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden p-3">

      {/* Side Tabs — daftar kategori */}
      <div className="w-45 shrink-0 border-r border-gray-100 overflow-y-auto">
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
              onClick={closeCategoryModal}
              className="text-green-600 text-sm hover:underline"
            >
              Lihat semua
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div
          className="flex-1 overflow-y-auto p-4"
          onClickCapture={(event) => {
            const target = event.target as HTMLElement
            if (target.closest('[data-ignore-route-loading="true"]')) return
            if (target.closest('a[href]')) {
              closeCategoryModal()
            }
          }}
        >
          {!selectedCategory ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">Pilih kategori</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {products.map((product) => (
                <ProductCard key={product.product_id} {...product} />
              ))}
              {products.length === 0 && (
                <div className="col-span-4 flex items-center justify-center h-50">
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
