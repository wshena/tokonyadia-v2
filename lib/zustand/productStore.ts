import {create} from 'zustand'

interface Stock {
  type: string
  quantity: number
}

interface ProductState {
  stock: Stock
  history: any[]

  // Actions
  setStock: (stock: Stock) => void
  addToProductHistory: (product: any) => void
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
      item => item?.product_id === product?.product_id && item.variant === product.variant
    )

    if (exists !== -1) return state

    return { history: [...state.history, product] }
  }),

  clearAllProductHistory: () => set({ history: [] }),
}))