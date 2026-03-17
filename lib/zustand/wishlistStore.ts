import { create } from 'zustand'

interface WishlistItem {
  userId: string
  products: any[]
}

interface WishlistState {
  wishlist: WishlistItem[]

  // Actions
  initWishlist:     (userId: string) => void
  addToWishlist:    (payload: { userId: string; product: any }) => void
  removeFromWishlist: (payload: { userId: string; productId: string }) => void
  clearAllWishlist: (userId: string) => void
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  // Initial state
  wishlist: [],

  initWishlist: (userId) => {
    const exists = get().wishlist.find(w => w.userId === userId)
    if (!exists) {
      set(state => ({
        wishlist: [...state.wishlist, { userId, products: [] }]
      }))
    }
  },

  addToWishlist: ({ userId, product }) => set((state) => {
    const wishlist    = [...state.wishlist]
    const userIndex   = wishlist.findIndex(w => w.userId === userId)

    if (userIndex === -1) {
      // User belum punya wishlist → buat baru
      return { wishlist: [...wishlist, { userId, products: [product] }] }
    }

    const userWishlist = wishlist[userIndex]
    const alreadyExists = userWishlist.products.find(
      item => item.product_id === product.product_id
    )

    if (alreadyExists) return state   // ← sudah ada, tidak perlu tambah

    wishlist[userIndex] = {
      ...userWishlist,
      products: [...userWishlist.products, product]
    }

    return { wishlist }
  }),

  removeFromWishlist: ({ userId, productId }) => set((state) => {
    const wishlist  = [...state.wishlist]
    const userIndex = wishlist.findIndex(w => w.userId === userId)

    if (userIndex === -1) return state

    wishlist[userIndex] = {
      ...wishlist[userIndex],
      products: wishlist[userIndex].products.filter(
        item => item.product_id !== productId
      )
    }

    return { wishlist }
  }),

  clearAllWishlist: (userId) => set((state) => {
    const wishlist  = [...state.wishlist]
    const userIndex = wishlist.findIndex(w => w.userId === userId)

    if (userIndex === -1) return state

    wishlist[userIndex] = { ...wishlist[userIndex], products: [] }

    return { wishlist }
  }),
}))