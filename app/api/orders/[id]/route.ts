import { getOrderById, cancelOrder, deleteOrder } from '@/lib/db/order'
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

  // ← tidak bisa cancel kalau sudah delivered
  if (['delivered', 'cancelled'].includes(order.status)) {
    return NextResponse.json({ success: false, message: `Order tidak bisa dibatalkan` }, { status: 400 })
  }

  const updated = await cancelOrder(supabase, id)
  return NextResponse.json({ success: true, data: updated })
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