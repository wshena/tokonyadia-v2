'use client'

import { relatedProductFetcher } from '@/lib/fetcher'   // ← import dari fetcher
import LoadMoreList from './LoadMoreList'
import { ProductCard } from './ui/card/ProductCard'
import { ProductCardSkeleton } from './ui/card/ProductCardSkeleton'
import type { Product } from '@/lib/db/products'
import type { PaginationMeta } from '@/lib/function'

interface Props {
  productId: string
  initialData: Product[]
  initialPagination: PaginationMeta
}

export default function RelatedProductLoadMore({ productId, initialData, initialPagination }: Props) {
  return (
    <LoadMoreList
      fetcher={relatedProductFetcher(productId)}
      renderItem={(product) => (
        <ProductCard key={product.product_id} {...product} />
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
