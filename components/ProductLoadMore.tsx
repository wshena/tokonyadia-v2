'use client'

import LoadMoreList from './LoadMoreList'
import { GetAllProducts, type PaginationMeta } from '@/lib/function'
import { ProductCard } from './ui/card/ProductCard'
import { ProductCardSkeleton } from './ui/card/ProductCardSkeleton'
import type { Product } from '@/lib/db/products'

const fetcher = async (page: number) => {
  return GetAllProducts({ page, limit: 20 })
}

interface Props {
  initialData: Product[]
  initialPagination: PaginationMeta
}

export default function ProductLoadMore({ initialData, initialPagination }: Props) {
  return (
    <LoadMoreList
      fetcher={fetcher}
      renderItem={(product) => (
        <ProductCard key={`${product.product_id} - ${product.title}`} {...product} />
      )}
      renderSkeleton={() => <ProductCardSkeleton />}
      skeletonCount={20}
      initialData={initialData}
      initialPagination={initialPagination}
      gridClassName="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      loadMoreLabel="Lihat Lebih Banyak"
    />
  )
}
