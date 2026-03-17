import { create } from 'zustand'
import { useUtilityStore } from './utilityStore'

export type Product = {
  productData: any
  variant: string
  stock: number
  price: number
  quantity: number
  timeAddToCart: any
}

interface Cart {
  id: string
  date: any
  products: Product[]
}

interface CartState {
  carts: Cart
  setCart: (cart: { id: string; date: any; products: Product[] }) => void
  addToCart: (product: Product) => void
  removeFromCart: (payload: { id: string; variant: string }) => void
  tryAddToCart: (product: Product) => void
}

// Helper — tampilkan alert lalu clear otomatis setelah 3 detik
const showAlert = (label: string, type: 'success' | 'error' | 'warning' | 'info', duration = 3000) => {
  const { setAlert } = useUtilityStore.getState()
  setAlert({ label, type })
  setTimeout(() => setAlert({ label: '', type: 'info' }), duration)  // ← auto clear
}

export const useCartStore = create<CartState>((set, get) => ({
  carts: {
    id: '',
    date: '',
    products: [],
  },

  setCart: ({ id, date, products }) =>
    set(state => ({
      carts: { ...state.carts, id, date, products }
    })),

  addToCart: (product) => set((state) => {
    const products = state.carts.products
    const index = products.findIndex(
      item =>
        item.productData?.product_id === product.productData?.product_id &&
        item.variant === product.variant
    )

    if (index !== -1) {
      const updatedProducts = [...products]
      updatedProducts[index] = {
        ...updatedProducts[index],
        quantity: updatedProducts[index].quantity + product.quantity
      }
      return { carts: { ...state.carts, products: updatedProducts } }
    }

    return { carts: { ...state.carts, products: [...products, product] } }
  }),

  removeFromCart: ({ id, variant }) => set((state) => ({
    carts: {
      ...state.carts,
      products: state.carts.products.filter(
        item =>
          item.productData?.product_id !== id ||
          item.variant !== variant
      )
    }
  })),

  tryAddToCart: (product) => {
    const { carts, addToCart } = get()
    const cartItems = carts.products ?? []

    const cartItem = cartItems.find(
      item =>
        item.productData?.product_id === product.productData?.product_id &&
        item.variant === product.variant
    )

    if (cartItem) {
      const newQuantity = cartItem.quantity + product.quantity
      if (newQuantity > cartItem.stock) {
        showAlert('Permintaan anda melebihi stock', 'error')
        return
      }
    } else {
      if (product.quantity > product.stock) {
        showAlert('Stock barang kurang', 'error')
        return
      }
    }

    addToCart(product)
    showAlert('Product berhasil disimpan di keranjang!', 'success')
  }
}))