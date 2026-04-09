'use client'

import { GlobalSearch } from '@/lib/function'
import { ProductCard } from '@/components/ui/card/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/card/ProductCardSkeleton'
import LoadMoreList from './LoadMoreList'

interface SearchSection {
  data: any[]
  pagination: any
  matchedNames?: string[]
}

interface Props {
  keyword: string
  productResult:    SearchSection
  categoryResult:   SearchSection
  collectionResult: SearchSection
}

// Section component — modular, reusable per section
const SearchSection = ({
  title,
  matchedNames,
  initialData,
  initialPagination,
  fetcher,
}: {
  title: string
  matchedNames?: string[]
  initialData: any[]
  initialPagination: any
  fetcher: (page: number) => Promise<any>
}) => {
  if (initialData.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">{title}</h2>
        {matchedNames && matchedNames.length > 0 && (
          <p className="text-sm text-gray-400">
            Dari: {matchedNames.join(', ')}
          </p>
        )}
      </div>

      {/* Product Grid */}
      <LoadMoreList
        fetcher={fetcher}
        renderItem={(product: any) => (
          <ProductCard key={product.product_id} {...product} />
        )}
        renderSkeleton={() => <ProductCardSkeleton />}
        skeletonCount={10}
        initialData={initialData}
        initialPagination={initialPagination}
        gridClassName="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
        loadMoreLabel="Lihat Lebih Banyak"
      />
    </section>
  )
}

export default function SearchResultClient({
  keyword,
  productResult,
  categoryResult,
  collectionResult,
}: Props) {
  const totalResults =
    productResult.pagination.total +
    categoryResult.pagination.total +
    collectionResult.pagination.total

  return (
    <div className="max-w-7xl mx-auto px-4 flex flex-col gap-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          Hasil pencarian:{' '}
          <span className="text-green-600">"{keyword}"</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">{totalResults} hasil ditemukan</p>
      </div>

      {/* Tidak ada hasil sama sekali */}
      {totalResults === 0 && (
        <div className="flex flex-col items-center gap-3 py-20">
          <p className="text-gray-400 text-lg">Tidak ada hasil untuk "{keyword}"</p>
          <p className="text-gray-300 text-sm">Coba gunakan kata kunci yang berbeda</p>
        </div>
      )}

      {/* Section: Produk */}
      <SearchSection
        title="Produk"
        initialData={productResult.data}
        initialPagination={productResult.pagination}
        fetcher={(page) => GlobalSearch('products', keyword, { page, limit: 20 })}
      />

      {/* Section: Dari Kategori */}
      <SearchSection
        title="Dari Kategori"
        matchedNames={categoryResult.matchedNames}
        initialData={categoryResult.data}
        initialPagination={categoryResult.pagination}
        fetcher={(page) => GlobalSearch('categories', keyword, { page, limit: 20 })}
      />

      {/* Section: Dari Koleksi */}
      <SearchSection
        title="Dari Koleksi"
        matchedNames={collectionResult.matchedNames}
        initialData={collectionResult.data}
        initialPagination={collectionResult.pagination}
        fetcher={(page) => GlobalSearch('collections', keyword, { page, limit: 20 })}
      />
    </div>
  )
}