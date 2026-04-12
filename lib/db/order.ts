import { createClient } from '@/utils/supabase/client'
import { Product } from '@/lib/zustand/CartStore'
import { SupabaseClient } from '@supabase/supabase-js'

const supabase = createClient()

export interface CreateOrderPayload {
  userId: string
  products: Product[]
  shippingAddress: string
  notes?: string
  couponId?: string
}

export interface Order {
  id: string
  user_id: string
  status: string
  total_price: number
  currency: string
  shipping_address: string
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_title: string
  variant: string
  quantity: number
  price: number
  subtotal: number
  image: string
}

// Hitung total harga dari cart products
export const calculateTotal = (products: Product[]): number => {
  return Number(
    products.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)
  )
}

// Buat order baru
export const createOrder = async (supabase: SupabaseClient, payload: CreateOrderPayload) => {
  const { userId, products, shippingAddress, notes } = payload
  const total     = calculateTotal(products)
  const currency  = products[0]?.productData?.price?.currency ?? 'USD'

  // 1. Insert ke tabel orders
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id:          userId,
      status:           'pending',
      total_price:      total,
      currency,
      shipping_address: shippingAddress,
      notes:            notes ?? '',
    })
    .select()
    .single()

  if (orderError) throw new Error(orderError.message)

  // 2. Insert order_items
  const orderItems = products.map(item => ({
    order_id:      order.id,
    product_id:    item.productData?.product_id,
    product_title: item.productData?.title,
    variant:       item.variant,
    quantity:      item.quantity,
    price:         item.price,
    subtotal:      Number((item.price * item.quantity).toFixed(2)),
    image:        item.productData?.images?.['800x900']?.[0] || null,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw new Error(itemsError.message)

  return order
}

// Get semua order milik user
export const getOrdersByUser = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items (*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Get order by ID
export const getOrderById = async (supabase: SupabaseClient, orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', orderId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Update status order
export const updateOrderStatus = async (supabase: SupabaseClient, orderId: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Cancel order
export const cancelOrder = async (supabase: SupabaseClient, orderId: string) => {
  return updateOrderStatus(supabase, orderId, 'cancelled')
}