import {create} from 'zustand'
import type { Product } from '@/lib/db/products'

interface Stock {
  type: string
  quantity: number
}

interface ProductState {
  stock: Stock
  history: Product[]

  // Actions
  setStock: (stock: Stock) => void
  addToProductHistory: (product: Product) => void
  clearAllProductHistory: () => void
}

export const useProductStore = create<ProductState>((set) => ({
  // Initial state
  stock: {
    type: '',
    quantity: 0
  },
  history: [],

  // Actions
  setStock: (stock) => set({ stock }),

  addToProductHistory: (product) => set((state) => {
    const exists = state.history.findIndex(
      item => item?.product_id === product?.product_id
    )

    if (exists !== -1) return state

    return { history: [...state.history, product] }
  }),

  clearAllProductHistory: () => set({ history: [] }),
}))
