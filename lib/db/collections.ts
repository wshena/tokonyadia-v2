import collections from '@/lib/data/collections.json';

type Collection = typeof collections[0]

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

// Get all collections
export const getAllCollections = (page: number = 1, limit: number = 20) => {
  return paginate(collections, page, limit)
}

// Get collection by ID
export const getCollectionById = (id: string): Collection | null => {
  return collections.find(c => c.collection_id === id) ?? null
}

// Get collection by path/slug
export const getCollectionByPath = (path: string): Collection | null => {
  return collections.find(c => c.path === path) ?? null
}

// Search collection by title
export const searchCollections = (keyword: string, page: number = 1, limit: number = 20) => {
  const filtered = collections.filter(c =>
    c.title.toLowerCase().includes(keyword.toLowerCase())
  )
  return paginate(filtered, page, limit)
}

// Get collections that contain a specific product
export const getCollectionsByProduct = (productId: string, page: number = 1, limit: number = 20) => {
  const filtered = collections.filter(c => c.products.includes(productId))
  return paginate(filtered, page, limit)
}