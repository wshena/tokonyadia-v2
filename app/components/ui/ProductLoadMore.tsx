'use client'

import LoadMoreList from './LoadMoreList'
import { GetAllProducts } from '@/lib/function'
import { ProductCard } from './card/ProductCard'

const fetcher = async (page: number) => {
  return GetAllProducts({ page, limit: 20 })
}

interface Props {
  initialData: any[]
  initialPagination: any
}

export default function ProductLoadMore({ initialData, initialPagination }: Props) {
  return (
    <LoadMoreList
      fetcher={fetcher}
      renderItem={(product) => (
        <ProductCard key={product.product_id} {...product} />
      )}
      initialData={initialData}
      initialPagination={initialPagination}
      gridClassName="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      loadMoreLabel="Lihat Lebih Banyak"
    />
  )
}