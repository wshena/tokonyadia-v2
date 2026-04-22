import { removeWishlistItem } from '@/lib/db/wishlist'
import { noStoreHeaders } from '@/lib/cache'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const resolvedParams = await params
    
    if (!resolvedParams?.productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 })
    }

    const { productId } = resolvedParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await removeWishlistItem(supabase, { userId: user.id, productId })
    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus dari wishlist' }, { headers: noStoreHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal menghapus wishlist' },
      { status: 500 }
    )
  }
}
