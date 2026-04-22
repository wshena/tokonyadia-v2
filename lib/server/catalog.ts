import { unstable_cache } from 'next/cache'
import {
  CATALOG_REVALIDATE_SECONDS,
  RANDOM_REVALIDATE_SECONDS,
  SEARCH_REVALIDATE_SECONDS,
} from '@/lib/cache'
import {
  getAllProducts,
  getFilteredProducts,
  getProductById,
  getProductsByIds,
  getRandomProducts,
  getRelatedProducts,
  getRelatedProductsPaginated,
  type FilterParams,
} from '@/lib/db/products'
import {
  getAllCategories,
  getCategoriesByProduct,
  getCategoryById,
  searchCategories,
} from '@/lib/db/categories'
import {
  getAllCollections,
  getCollectionById,
  getCollectionsByProduct,
  searchCollections,
} from '@/lib/db/collections'

type ProductListParams = FilterParams & {
  random?: boolean
}

type SearchSection = 'products' | 'categories' | 'collections'

const withCache = async <T>(
  keyParts: string[],
  revalidate: number,
  resolver: () => T | Promise<T>
) => unstable_cache(async () => resolver(), keyParts, { revalidate })()

export const getCachedProductList = async ({
  page = 1,
  limit = 20,
  keyword,
  category,
  minPrice,
  maxPrice,
  sortBy,
  random,
}: ProductListParams) => {
  const cacheKey = JSON.stringify({ page, limit, keyword, category, minPrice, maxPrice, sortBy, random })

  return withCache(
    ['catalog:products:list', cacheKey],
    random ? RANDOM_REVALIDATE_SECONDS : CATALOG_REVALIDATE_SECONDS,
    () => {
      if (random) {
        return getRandomProducts(page, limit)
      }

      if (keyword || category || minPrice || maxPrice || sortBy) {
        return getFilteredProducts({ keyword, category, minPrice, maxPrice, sortBy, page, limit })
      }

      return getAllProducts(page, limit)
    }
  )
}

export const getCachedProductDetail = async (id: string) => withCache(
  ['catalog:products:detail', id],
  CATALOG_REVALIDATE_SECONDS,
  () => {
    const product = getProductById(id)
    if (!product) return null

    return {
      ...product,
      related: getRelatedProducts(id, 10),
    }
  }
)

export const getCachedRelatedProducts = async (id: string, page: number = 1, limit: number = 10) => withCache(
  ['catalog:products:related', id, String(page), String(limit)],
  CATALOG_REVALIDATE_SECONDS,
  () => getRelatedProductsPaginated(id, page, limit)
)

export const getCachedCategoryList = async ({
  page = 1,
  limit = 20,
  keyword,
  productId,
}: {
  page?: number
  limit?: number
  keyword?: string
  productId?: string
}) => {
  const cacheKey = JSON.stringify({ page, limit, keyword, productId })

  return withCache(
    ['catalog:categories:list', cacheKey],
    keyword ? SEARCH_REVALIDATE_SECONDS : CATALOG_REVALIDATE_SECONDS,
    () => {
      if (keyword) return searchCategories(keyword, page, limit)
      if (productId) return getCategoriesByProduct(productId, page, limit)
      return getAllCategories(page, limit)
    }
  )
}

export const getCachedCategoryDetail = async (id: string) => withCache(
  ['catalog:categories:detail', id],
  CATALOG_REVALIDATE_SECONDS,
  () => getCategoryById(id)
)

export const getCachedCollectionList = async ({
  page = 1,
  limit = 20,
  keyword,
  productId,
}: {
  page?: number
  limit?: number
  keyword?: string
  productId?: string
}) => {
  const cacheKey = JSON.stringify({ page, limit, keyword, productId })

  return withCache(
    ['catalog:collections:list', cacheKey],
    keyword ? SEARCH_REVALIDATE_SECONDS : CATALOG_REVALIDATE_SECONDS,
    () => {
      if (keyword) return searchCollections(keyword, page, limit)
      if (productId) return getCollectionsByProduct(productId, page, limit)
      return getAllCollections(page, limit)
    }
  )
}

export const getCachedCollectionDetail = async (id: string) => withCache(
  ['catalog:collections:detail', id],
  CATALOG_REVALIDATE_SECONDS,
  () => getCollectionById(id)
)

export const getCachedProductsByIds = async (ids: string[], page: number = 1, limit: number = 20) => withCache(
  ['catalog:products:ids', JSON.stringify(ids), String(page), String(limit)],
  CATALOG_REVALIDATE_SECONDS,
  () => getProductsByIds(ids, page, limit)
)

export const getCachedSearchSection = async (
  section: SearchSection,
  keyword: string,
  page: number = 1,
  limit: number = 20
) => {
  const normalizedKeyword = keyword.trim()

  return withCache(
    ['catalog:search', section, normalizedKeyword, String(page), String(limit)],
    SEARCH_REVALIDATE_SECONDS,
    () => {
      if (section === 'products') {
        return getFilteredProducts({ keyword: normalizedKeyword, page, limit })
      }

      if (section === 'categories') {
        const { data: matchedCategories } = searchCategories(normalizedKeyword, 1, 100)
        const productIds = [...new Set(matchedCategories.flatMap(category => category.products))]
        return {
          ...getProductsByIds(productIds, page, limit),
          matchedNames: matchedCategories.map(category => category.title),
        }
      }

      const { data: matchedCollections } = searchCollections(normalizedKeyword, 1, 100)
      const productIds = [...new Set(matchedCollections.flatMap(collection => collection.products))]
      return {
        ...getProductsByIds(productIds, page, limit),
        matchedNames: matchedCollections.map(collection => collection.title),
      }
    }
  )
}
