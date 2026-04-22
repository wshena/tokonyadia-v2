import { addWishlistItem, clearWishlistByUser, getWishlistByUser } from '@/lib/db/wishlist'
import { noStoreHeaders } from '@/lib/cache'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const products = await getWishlistByUser(supabase, user.id)
    return NextResponse.json({ success: true, data: products }, { headers: noStoreHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal memuat wishlist' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const product = body?.product

    if (!product?.product_id) {
      return NextResponse.json(
        { success: false, message: 'Produk wishlist tidak valid' },
        { status: 400 }
      )
    }

    const item = await addWishlistItem(supabase, { userId: user.id, product })
    return NextResponse.json({ success: true, data: item }, { status: 201, headers: noStoreHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal menambahkan wishlist' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await clearWishlistByUser(supabase, user.id)
    return NextResponse.json({ success: true, message: 'Wishlist berhasil dikosongkan' }, { headers: noStoreHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal mengosongkan wishlist' },
      { status: 500 }
    )
  }
}
