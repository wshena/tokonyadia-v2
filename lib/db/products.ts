import products from '@/lib/data/products.json';

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

export const getAllProducts = (page: number = 1, limit: number = 20): PaginationResult<typeof products[0]> => {
  const offset = (page - 1) * limit
  const total = products.length
  const totalPages = Math.ceil(total / limit)
  const data = products.slice(offset, offset + limit)

  return {
    data,
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