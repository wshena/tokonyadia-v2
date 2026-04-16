import { SupabaseClient } from '@supabase/supabase-js'
import type { WishlistProduct } from '@/lib/zustand/wishlistStore'

export interface WishlistRow {
  id: string
  user_id: string
  product_id: string
  product_data: WishlistProduct
  created_at: string
  updated_at: string
}

export const getWishlistByUser = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((item: WishlistRow) => item.product_data)
}

export const addWishlistItem = async (
  supabase: SupabaseClient,
  payload: { userId: string; product: WishlistProduct }
) => {
  const { userId, product } = payload

  const { data, error } = await supabase
    .from('wishlists')
    .upsert(
      {
        user_id: userId,
        product_id: product.product_id,
        product_data: product,
      },
      {
        onConflict: 'user_id,product_id',
      }
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const removeWishlistItem = async (
  supabase: SupabaseClient,
  payload: { userId: string; productId: string }
) => {
  const { userId, productId } = payload

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) throw new Error(error.message)
  return { success: true }
}

export const clearWishlistByUser = async (supabase: SupabaseClient, userId: string) => {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return { success: true }
}
