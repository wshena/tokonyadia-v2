import { deleteOrder, getOrderById, updateOrder } from '@/lib/db/order'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const order = await getOrderById(supabase, id)

  if (!order || order.user_id !== user.id) {
    return NextResponse.json({ success: false, message: 'Order tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: order })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }   = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const order = await getOrderById(supabase, id)
    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ success: false, message: 'Order tidak ditemukan' }, { status: 404 })
    }

    const body = await request.json()
    const nextStatus = body?.status ? String(body.status).toLowerCase() : undefined
    const nextPaymentMethod = body?.payment_method ?? body?.paymentMethod
    const nextDeliveryMethod = body?.delivery_method ?? body?.deliveryMethod

    if (!nextStatus && !nextPaymentMethod && !nextDeliveryMethod) {
      return NextResponse.json(
        { success: false, message: 'Minimal satu field pembaruan wajib diisi' },
        { status: 400 }
      )
    }

    const allowedStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
    if (nextStatus && !allowedStatuses.includes(nextStatus)) {
      return NextResponse.json({ success: false, message: 'Status tidak valid' }, { status: 400 })
    }

    if (nextStatus) {
      if (order.status === 'delivered' && nextStatus !== 'delivered') {
        return NextResponse.json({ success: false, message: 'Order yang sudah delivered tidak bisa diubah statusnya' }, { status: 400 })
      }

      if (order.status === 'cancelled' && nextStatus !== 'cancelled') {
        return NextResponse.json({ success: false, message: 'Order yang sudah cancelled tidak bisa diubah statusnya' }, { status: 400 })
      }
    }

    const updated = await updateOrder(supabase, id, {
      ...(nextStatus ? { status: nextStatus } : {}),
      ...(nextPaymentMethod ? { payment_method: nextPaymentMethod } : {}),
      ...(nextDeliveryMethod ? { delivery_method: nextDeliveryMethod } : {}),
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? 'Gagal memperbarui order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }   = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  // ← validasi kepemilikan
  const order = await getOrderById(supabase, id)
  if (!order || order.user_id !== user.id) {
    return NextResponse.json({ success: false, message: 'Order tidak ditemukan' }, { status: 404 })
  }

  await deleteOrder(supabase, id)
  return NextResponse.json({ success: true, message: 'Order berhasil dihapus' })
}
