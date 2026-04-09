'use client'

import Link from 'next/link'
import { CategoryIcon } from '@/components/icon'
import { getAllCategories } from '@/lib/db/categories'
import { createSlug } from '@/lib/utils'
import { useUtilityStore } from '@/lib/zustand/utilityStore'

const CategoryListModal = () => {
  const closeModal = useUtilityStore((state) => state.closeModal)
  const { data: categories } = getAllCategories(1, 100)

  return (
    <div className="flex max-h-[calc(100vh-2rem)] w-[min(56rem,calc(100vw-2rem))] flex-col rounded-2xl bg-white p-5 shadow-xl md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-lg font-bold md:text-xl">Semua Kategori</h2>
          <p className="text-sm text-gray-500">Pilih kategori yang ingin kamu lihat.</p>
        </div>

        <button
          type="button"
          onClick={closeModal}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          Tutup
        </button>
      </div>

      <div className="overflow-y-auto pr-1 xl:overflow-visible xl:pr-0">
        <ul className="grid max-h-[60vh] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:max-h-none">
          {categories.map((category) => (
            <li key={category.category_id}>
              <Link
                href={`/categories/${category.category_id}/${createSlug(category.title)}`}
                onClick={closeModal}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-black transition-shadow hover:shadow-md"
              >
                <CategoryIcon size={20} color="black" />
                <span className="capitalize">{category.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CategoryListModal
