'use client'

import React from 'react'
import { GetAllCategories } from '@/lib/function'
import LoadMoreList from './LoadMoreList'
import CategoryCard from './ui/card/CategoryCard'

const fetcher = async (page: number) => {
  return GetAllCategories({ page, limit: 20 })
}

interface Props {
  initialData: any[]
  initialPagination: any
}

export default function CategoryCardLoadMore({ initialData, initialPagination }: Props) {
  return (
    <LoadMoreList
      fetcher={fetcher}
      renderItem={(category) => (
        <CategoryCard key={category.category_id} category={category} />
      )}
      initialData={initialData}
      initialPagination={initialPagination}
      gridClassName="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      loadMoreLabel="Lihat Lebih Banyak"
    />
  )
}