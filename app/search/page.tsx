
import { getFilteredProducts, getProductsByIds } from '@/lib/db/products'
import { searchCategories } from '@/lib/db/categories'
import { searchCollections } from '@/lib/db/collections'
import SearchResultClient from '@/components/SearchResult'

interface SearchPageProps {
  searchParams: Promise<{ keyword?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { keyword = '' } = await searchParams

  // Fetch semua section di server secara paralel
  const [productResult, categoryResult, collectionResult] = await Promise.all([
    // Products langsung
    Promise.resolve(getFilteredProducts({ keyword, page: 1, limit: 20 })),

    // Categories → product ids → products
    (await Promise.resolve(() => {
      const { data: matchedCategories } = searchCategories(keyword, 1, 100)
      const productIds = [...new Set(matchedCategories.flatMap(c => c.products))]
      return {
        ...getProductsByIds(productIds, 1, 20),
        matchedNames: matchedCategories.map(c => c.title)
      }
    }))(),

    // Collections → product ids → products
    (await Promise.resolve(() => {
      const { data: matchedCollections } = searchCollections(keyword, 1, 100)
      const productIds = [...new Set(matchedCollections.flatMap(c => c.products))]
      return {
        ...getProductsByIds(productIds, 1, 20),
        matchedNames: matchedCollections.map(c => c.title)
      }
    }))(),
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