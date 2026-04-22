import { NextRequest, NextResponse } from 'next/server'
import { noStoreHeaders } from '@/lib/cache'
import {
  findDeliveredOrderItemForReview,
  getApprovedReviewsByProductId,
  getProductReviewSummary,
  getUserReviewByProductId,
  getUserReviews,
  upsertProductReview,
} from '@/lib/db/reviews'
import { createClient } from '@/utils/supabase/server'

type UserLike = {
  email?: string | null
  user_metadata?: Record<string, unknown>
}

type ProfileLike = {
  username?: string | null
  first_name?: string | null
  last_name?: string | null
}

const buildDisplayName = (user: UserLike, profile: ProfileLike | null) => {
  const profileName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
  const metadata = user.user_metadata ?? {}

  return (
    profileName ||
    profile?.username ||
    (typeof metadata.full_name === 'string' ? metadata.full_name : '') ||
    (typeof metadata.name === 'string' ? metadata.name : '') ||
    (typeof metadata.username === 'string' ? metadata.username : '') ||
    user.email?.split('@')[0] ||
    'Pengguna'
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const productId = request.nextUrl.searchParams.get('productId')?.trim()
    const productIds = request.nextUrl.searchParams
      .get('productIds')
      ?.split(',')
      .map(id => id.trim())
      .filter(Boolean)
    const mine = request.nextUrl.searchParams.get('mine') === 'true'

    if (mine) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      }

      const reviews = await getUserReviews(supabase, user.id, productIds)
      return NextResponse.json({ success: true, data: reviews }, { headers: noStoreHeaders })
    }

    if (!productId) {
      return NextResponse.json({ success: false, message: 'productId wajib diisi' }, { status: 400 })
    }

    const reviews = await getApprovedReviewsByProductId(supabase, productId)
    const summary = getProductReviewSummary(reviews)

    return NextResponse.json(
      { success: true, data: { reviews, summary } },
      { headers: noStoreHeaders }
    )
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal memuat review' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const productId = String(body?.product_id ?? '').trim()
    const rate = Number(body?.rate)
    const comment = String(body?.comment ?? '').trim()
    const submittedOrderId = String(body?.order_id ?? '').trim()
    const submittedOrderItemId = String(body?.order_item_id ?? '').trim()

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Produk review tidak valid' }, { status: 400 })
    }

    if (!Number.isInteger(rate) || rate < 1 || rate > 5) {
      return NextResponse.json({ success: false, message: 'Rating harus antara 1 sampai 5' }, { status: 400 })
    }

    if (comment.length < 10) {
      return NextResponse.json({ success: false, message: 'Komentar minimal 10 karakter' }, { status: 400 })
    }

    const existingReview = await getUserReviewByProductId(supabase, user.id, productId)
    const eligiblePurchase = await findDeliveredOrderItemForReview(supabase, user.id, productId)

    if (!eligiblePurchase) {
      return NextResponse.json(
        { success: false, message: 'Review hanya bisa dibuat untuk produk yang sudah diterima' },
        { status: 403 }
      )
    }

    if (
      (submittedOrderId && submittedOrderId !== eligiblePurchase.orderId) ||
      (submittedOrderItemId && submittedOrderItemId !== eligiblePurchase.orderItemId)
    ) {
      return NextResponse.json(
        { success: false, message: 'Transaksi review tidak cocok dengan pesanan yang sudah diterima' },
        { status: 400 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, first_name, last_name, profile_picture')
      .eq('id', user.id)
      .maybeSingle()

    const review = await upsertProductReview(supabase, {
      productId,
      userId: user.id,
      orderId: existingReview?.order_id ?? eligiblePurchase.orderId,
      orderItemId: existingReview?.order_item_id ?? eligiblePurchase.orderItemId,
      rate,
      comment,
      userDisplayName: buildDisplayName(user, profile),
      userAvatarUrl: profile?.profile_picture ?? null,
      status: 'approved',
    })

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: existingReview ? 'Review berhasil diperbarui' : 'Review berhasil dikirim',
      },
      { status: existingReview ? 200 : 201, headers: noStoreHeaders }
    )
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal menyimpan review' },
      { status: 500 }
    )
  }
}
