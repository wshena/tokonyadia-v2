import { GetAllProducts } from '@/lib/function'

export const productFetcher = async (page: number) => {
  return GetAllProducts({ page, limit: 20 })
}

export const flashSaleFetcher = async (page: number) => {
  return GetAllProducts({ page, limit: 20, category: 'flash-sale' })
}