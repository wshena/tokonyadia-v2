import categories from '@/lib/data/categories.json';

type Category = typeof categories[0]

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

// Get all categories
export const getAllCategories = (page: number = 1, limit: number = 20) => {
  return paginate(categories, page, limit)
}

// Get category by ID
export const getCategoryById = (id: string): Category | null => {
  return categories.find(c => c.category_id === id) ?? null
}

// Get category by path/slug
export const getCategoryByPath = (path: string): Category | null => {
  return categories.find(c => c.path === path) ?? null
}

// Search category by title
export const searchCategories = (keyword: string, page: number = 1, limit: number = 20) => {
  const filtered = categories.filter(c =>
    c.title.toLowerCase().includes(keyword.toLowerCase())
  )
  return paginate(filtered, page, limit)
}

// Get categories that contain a specific product
export const getCategoriesByProduct = (productId: string, page: number = 1, limit: number = 20) => {
  const filtered = categories.filter(c => c.products.includes(productId))
  return paginate(filtered, page, limit)
}