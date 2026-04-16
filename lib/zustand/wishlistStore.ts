import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistProduct {
  product_id: string
  title: string
  category?: string
  path?: string
  images?: {
    ['800x900']?: string[]
  }
  price?: {
    currency?: string
    withDiscount?: number
    withoutDiscount?: number
  }
  performance?: {
    sales?: number
  }
}

interface WishlistBucket {
  userId: string
  products: WishlistProduct[]
}

interface WishlistState {
  wishlist: WishlistBucket[]
  isHydrating: boolean
  initWishlist: (userId: string) => void
  setWishlistProducts: (userId: string, products: WishlistProduct[]) => void
  fetchWishlist: (userId: string) => Promise<void>
  addToWishlist: (payload: { userId: string; product: WishlistProduct }) => Promise<void>
  removeFromWishlist: (payload: { userId: string; productId: string }) => Promise<void>
  clearAllWishlist: (userId: string) => Promise<void>
  clearWishlistState: () => void
  getWishlistByUser: (userId?: string | null) => WishlistProduct[]
  isInWishlist: (userId: string | undefined, productId: string) => boolean
}

const ensureBucket = (wishlist: WishlistBucket[], userId: string) => {
  const exists = wishlist.some(item => item.userId === userId)
  return exists ? wishlist : [...wishlist, { userId, products: [] }]
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      isHydrating: false,

      initWishlist: (userId) => {
        set(state => ({
          wishlist: ensureBucket(state.wishlist, userId),
        }))
      },

      setWishlistProducts: (userId, products) => {
        set(state => {
          const wishlist = ensureBucket(state.wishlist, userId).map(bucket => (
            bucket.userId === userId ? { ...bucket, products } : bucket
          ))

          return { wishlist }
        })
      },

      fetchWishlist: async (userId) => {
        set({ isHydrating: true })
        get().initWishlist(userId)

        try {
          const response = await fetch('/api/wishlist', { cache: 'no-store' })
          const payload = await response.json()

          if (!response.ok) {
            throw new Error(payload?.message ?? 'Gagal memuat wishlist')
          }

          get().setWishlistProducts(userId, payload.data ?? [])
        } finally {
          set({ isHydrating: false })
        }
      },

      addToWishlist: async ({ userId, product }) => {
        get().initWishlist(userId)

        const currentProducts = get().getWishlistByUser(userId)
        if (currentProducts.some(item => item.product_id === product.product_id)) return

        get().setWishlistProducts(userId, [product, ...currentProducts])

        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product }),
          })

          const payload = await response.json().catch(() => null)
          if (!response.ok) {
            throw new Error(payload?.message ?? 'Gagal menambahkan wishlist')
          }
        } catch (error) {
          get().setWishlistProducts(userId, currentProducts)
          throw error
        }
      },

      removeFromWishlist: async ({ userId, productId }) => {
        const currentProducts = get().getWishlistByUser(userId)
        const nextProducts = currentProducts.filter(product => product.product_id !== productId)

        get().setWishlistProducts(userId, nextProducts)

        try {
          const response = await fetch(`/api/wishlist/${productId}`, {
            method: 'DELETE',
          })

          const payload = await response.json().catch(() => null)
          if (!response.ok) {
            throw new Error(payload?.message ?? 'Gagal menghapus wishlist')
          }
        } catch (error) {
          get().setWishlistProducts(userId, currentProducts)
          throw error
        }
      },

      clearAllWishlist: async (userId) => {
        const currentProducts = get().getWishlistByUser(userId)
        get().setWishlistProducts(userId, [])

        try {
          const response = await fetch('/api/wishlist', {
            method: 'DELETE',
          })

          const payload = await response.json().catch(() => null)
          if (!response.ok) {
            throw new Error(payload?.message ?? 'Gagal mengosongkan wishlist')
          }
        } catch (error) {
          get().setWishlistProducts(userId, currentProducts)
          throw error
        }
      },

      clearWishlistState: () => {
        set({ wishlist: [], isHydrating: false })
      },

      getWishlistByUser: (userId) => {
        if (!userId) return []
        return get().wishlist.find(item => item.userId === userId)?.products ?? []
      },

      isInWishlist: (userId, productId) => {
        if (!userId) return false
        return get().wishlist
          .find(item => item.userId === userId)
          ?.products
          .some(product => product.product_id === productId) ?? false
      },
    }),
    {
      name: 'tokonyadia-wishlist',
    }
  )
)
