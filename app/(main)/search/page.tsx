import dynamic from 'next/dynamic'
import { getCachedSearchSection } from '@/lib/server/catalog'

const SearchResultClient = dynamic(() => import('@/components/SearchResult'))

interface SearchPageProps {
  searchParams: Promise<{ keyword?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { keyword = '' } = await searchParams

  // Fetch semua section di server secara paralel
  const [productResult, categoryResult, collectionResult] = await Promise.all([
    getCachedSearchSection('products', keyword, 1, 20),
    getCachedSearchSection('categories', keyword, 1, 20),
    getCachedSearchSection('collections', keyword, 1, 20),
  ])

  return (
    <main className="w-full pt-20">
      <SearchResultClient
        keyword={keyword}
        productResult={productResult}
        categoryResult={categoryResult}
        collectionResult={collectionResult}
      />
    </main>
  )
}
