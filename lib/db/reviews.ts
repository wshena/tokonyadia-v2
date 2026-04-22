import type { SupabaseClient } from '@supabase/supabase-js'

export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  order_id: string
  order_item_id: string
  status: 'pending' | 'approved' | 'rejected'
  rate: number
  comment: string
  user_display_name: string
  user_avatar_url?: string | null
  created_at: string
  updated_at: string
}

export interface ProductReviewSummary {
  averageRating: number
  reviewCount: number
}

export interface DeliveredReviewEligibility {
  orderId: string
  orderItemId: string
}

const normalizeReview = (review: Record<string, unknown>): ProductReview => ({
  id: String(review.id ?? ''),
  product_id: String(review.product_id ?? ''),
  user_id: String(review.user_id ?? ''),
  order_id: String(review.order_id ?? ''),
  order_item_id: String(review.order_item_id ?? ''),
  status: String(review.status ?? 'approved') as ProductReview['status'],
  rate: Number(review.rate ?? 0),
  comment: String(review.comment ?? ''),
  user_display_name: String(review.user_display_name ?? 'Pengguna'),
  user_avatar_url: typeof review.user_avatar_url === 'string' ? review.user_avatar_url : null,
  created_at: String(review.created_at ?? ''),
  updated_at: String(review.updated_at ?? ''),
})

export const getApprovedReviewsByProductId = async (supabase: SupabaseClient, productId: string) => {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(normalizeReview)
}

export const getUserReviews = async (supabase: SupabaseClient, userId: string, productIds?: string[]) => {
  let query = supabase
    .from('product_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (productIds?.length) {
    query = query.in('product_id', productIds)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data ?? []).map(normalizeReview)
}

export const getUserReviewByProductId = async (supabase: SupabaseClient, userId: string, productId: string) => {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? normalizeReview(data) : null
}

export const getProductReviewSummary = (reviews: ProductReview[]): ProductReviewSummary => {
  if (!reviews.length) {
    return { averageRating: 0, reviewCount: 0 }
  }

  const total = reviews.reduce((sum, review) => sum + review.rate, 0)

  return {
    averageRating: Number((total / reviews.length).toFixed(1)),
    reviewCount: reviews.length,
  }
}

export const findDeliveredOrderItemForReview = async (
  supabase: SupabaseClient,
  userId: string,
  productId: string
): Promise<DeliveredReviewEligibility | null> => {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('status', 'delivered')
    .order('created_at', { ascending: false })

  if (ordersError) throw new Error(ordersError.message)
  if (!orders?.length) return null

  const orderIds = orders.map(order => order.id)

  const { data: orderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select('id, order_id, product_id')
    .eq('product_id', productId)
    .in('order_id', orderIds)

  if (orderItemsError) throw new Error(orderItemsError.message)
  if (!orderItems?.length) return null

  const orderRank = new Map(orderIds.map((orderId, index) => [orderId, index]))
  const matchedItem = [...orderItems].sort(
    (a, b) =>
      (orderRank.get(a.order_id) ?? Number.MAX_SAFE_INTEGER) -
      (orderRank.get(b.order_id) ?? Number.MAX_SAFE_INTEGER)
  )[0]

  if (!matchedItem) return null

  return {
    orderId: matchedItem.order_id,
    orderItemId: matchedItem.id,
  }
}

export interface UpsertProductReviewPayload {
  productId: string
  userId: string
  orderId: string
  orderItemId: string
  rate: number
  comment: string
  userDisplayName: string
  userAvatarUrl?: string | null
  status?: ProductReview['status']
}

export const upsertProductReview = async (supabase: SupabaseClient, payload: UpsertProductReviewPayload) => {
  const { data, error } = await supabase
    .from('product_reviews')
    .upsert(
      {
        product_id: payload.productId,
        user_id: payload.userId,
        order_id: payload.orderId,
        order_item_id: payload.orderItemId,
        rate: payload.rate,
        comment: payload.comment,
        status: payload.status ?? 'approved',
        user_display_name: payload.userDisplayName,
        user_avatar_url: payload.userAvatarUrl ?? null,
      },
      { onConflict: 'user_id,product_id' }
    )
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return normalizeReview(data)
}
