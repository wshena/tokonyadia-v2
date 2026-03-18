import {
  GetAllProducts,
  GetAllCategories,
  GetAllCollections,
  GetFilteredProducts,
  GetProductById,
  SearchProducts,
  GetProductsByCategory,
  GetProductsSorted,
  SearchCategories,
  GetCategoriesByProduct,
  GetCategoryById,
  SearchCollections,
  GetCollectionsByProduct,
  GetCollectionById,
  GetRelatedProducts,
} from '@/lib/function'

// ===== PRODUCTS =====

export const productFetcher = async (page: number) => {
  return GetAllProducts({ page, limit: 20 })
}

// Filter gabungan — keyword, category, price, sort
export interface ProductFilterParams {
  keyword?:  string
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?:   'price_asc' | 'price_desc' | 'popular' | 'rating'
  limit?:    number
}

export const relatedProductFetcher = (productId: string) => {
  return async (page: number) => {
    return GetRelatedProducts(productId, { page, limit: 10 })
  }
}

export const filteredProductFetcher = (filterParams: ProductFilterParams) => {
  return async (page: number) => {
    return GetFilteredProducts({ page, limit: 20, ...filterParams })
  }
}

export const searchProductFetcher = (keyword: string) => {
  return async (page: number) => {
    return SearchProducts(keyword, { page, limit: 20 })
  }
}

export const categoryProductFetcher = (category: string) => {
  return async (page: number) => {
    return GetProductsByCategory(category, { page, limit: 20 })
  }
}

export const sortedProductFetcher = (sortBy: string) => {
  return async (page: number) => {
    return GetProductsSorted(sortBy, { page, limit: 20 })
  }
}

export const productByIdFetcher = async (id: string) => {
  return GetProductById(id)
}

// ===== CATEGORIES =====

export const categoryFetcher = async (page: number) => {
  return GetAllCategories({ page, limit: 20 })
}

export const searchCategoryFetcher = (keyword: string) => {
  return async (page: number) => {
    return SearchCategories(keyword, { page, limit: 20 })
  }
}

export const categoryByProductFetcher = (productId: string) => {
  return async (page: number) => {
    return GetCategoriesByProduct(productId, { page, limit: 20 })
  }
}

export const categoryByIdFetcher = async (id: string) => {
  return GetCategoryById(id)
}

// ===== COLLECTIONS =====

export const collectionFetcher = async (page: number) => {
  return GetAllCollections({ page, limit: 20 })
}

export const searchCollectionFetcher = (keyword: string) => {
  return async (page: number) => {
    return SearchCollections(keyword, { page, limit: 20 })
  }
}

export const collectionByProductFetcher = (productId: string) => {
  return async (page: number) => {
    return GetCollectionsByProduct(productId, { page, limit: 20 })
  }
}

export const collectionByIdFetcher = async (id: string) => {
  return GetCollectionById(id)
}


// ## Ringkasan Endpoint

// GET /api/products                          → semua produk
// GET /api/products?keyword=sepatu           → search
// GET /api/products?category=fashion         → filter kategori
// GET /api/products?minPrice=100&maxPrice=500 → filter harga
// GET /api/products?sortBy=price_asc         → sort
// GET /api/products?keyword=baju&sortBy=popular&page=2 → filter gabungan
// GET /api/products/[id]                     → detail + related products

// GET /api/categories                          → semua kategori
// GET /api/categories?keyword=fashion          → search
// GET /api/categories?productId=SKU-10240001   → kategori yang punya produk ini
// GET /api/categories/[id]                     → detail kategori

// GET /api/collections                         → semua koleksi
// GET /api/collections?keyword=men             → search
// GET /api/collections?productId=SKU-10240001  → koleksi yang punya produk ini
// GET /api/collections/[id]                    → detail koleksi