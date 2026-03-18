import products from '@/lib/data/products.json';
import { createSlug } from '../utils';

type Product = typeof products[0]

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Helper pagination
const paginate = <T>(data: T[], page: number, limit: number): PaginationResult<T> => {
  const offset = (page - 1) * limit
  const total = data.length
  const totalPages = Math.ceil(total / limit)

  return {
    data: data.slice(offset, offset + limit),
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  }
}

// Get all products
export const getAllProducts = (page: number = 1, limit: number = 20) => {
  return paginate(products, page, limit)
}

// Get product by ID
export const getProductById = (id: string): Product | null => {
  return products.find(p => p.product_id === id) ?? null
}

// Ambil products berdasarkan array of product_id (untuk hasil dari category/collection)
export const getProductsByIds = (ids: string[], page: number = 1, limit: number = 20) => {
  const filtered = products.filter(p => ids.includes(p.product_id))
  return paginate(filtered, page, limit)
}

// Get product by slug
export const getProductBySlug = (title: string): Product | null => {
  const slug = createSlug(title)
  return slug ? products.find(p => createSlug(p.title) === slug) ?? null : null
}

// Search product by name/keyword
export const searchProducts = (keyword: string, page: number = 1, limit: number = 20) => {
  const lower = keyword.toLowerCase()
  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(lower)
  )
  return paginate(filtered, page, limit)
}

// Get products by category
export const getProductsByCategory = (category: string, page: number = 1, limit: number = 20) => {
  const filtered = products.filter(p =>
    p.category.toLowerCase() === category.toLowerCase()
  )
  return paginate(filtered, page, limit)
}

// Get products by price range
export const getProductsByPriceRange = (min: number, max: number, page: number = 1, limit: number = 20) => {
  const filtered = products.filter(p =>
    p.price.withDiscount >= min && p.price.withDiscount <= max
  )
  return paginate(filtered, page, limit)
}

// Get products sorted
type SortBy = 'price_asc' | 'price_desc' | 'popular' | 'rating'

export const getProductsSorted = (sortBy: SortBy, page: number = 1, limit: number = 20) => {
  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':  return a.price.withDiscount - b.price.withDiscount
      case 'price_desc': return b.price.withDiscount - a.price.withDiscount
      case 'popular':    return b.performance.sales - a.performance.sales
      case 'rating': return (b.performance.ratingAverage ?? 0) - (a.performance.ratingAverage ?? 0)
      default:           return 0
    }
  })
  return paginate(sorted, page, limit)
}

// Get related products (same category, exclude current)
export const getRelatedProducts = (productId: string, limit: number = 10) => {
  const current = getProductById(productId)
  if (!current) return []

  return products
    .filter(p => p.category === current.category && p.product_id !== productId)
    // .slice(0, limit)
}

// Get related products dengan pagination
export const getRelatedProductsPaginated = (productId: string, page: number = 1, limit: number = 10) => {
  const current = getProductById(productId)
  if (!current) return paginate([], page, limit)

  const related = products.filter(p =>
    p.category === current.category && p.product_id !== productId
  )

  return paginate(related, page, limit)
}

// Filter gabungan (search + category + price + sort)
export interface FilterParams {
  keyword?:  string
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?:   SortBy
  page?:     number
  limit?:    number
}

export const getFilteredProducts = ({
  keyword,
  category,
  minPrice,
  maxPrice,
  sortBy,
  page  = 1,
  limit = 20,
}: FilterParams) => {
  let filtered = [...products]

  if (keyword)  filtered = filtered.filter(p => p.title.toLowerCase().includes(keyword.toLowerCase()))
  if (category) filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase())
  if (minPrice) filtered = filtered.filter(p => p.price.withDiscount >= minPrice)
  if (maxPrice) filtered = filtered.filter(p => p.price.withDiscount <= maxPrice)

  if (sortBy) {
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':  return a.price.withDiscount - b.price.withDiscount
        case 'price_desc': return b.price.withDiscount - a.price.withDiscount
        case 'popular':    return b.performance.sales - a.performance.sales
        case 'rating': return (b.performance.ratingAverage ?? 0) - (a.performance.ratingAverage ?? 0)
        default:           return 0
      }
    })
  }

  return paginate(filtered, page, limit)
}