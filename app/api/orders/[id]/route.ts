import { getOrderById, cancelOrder, deleteOrder, updateOrderStatus } from '@/lib/db/order'
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

  const body = await request.json()
  const { status } = body

  if (!status) {
    return NextResponse.json({ success: false, message: 'Status wajib diisi' }, { status: 400 })
  }

  // ← validasi status yang diizinkan
  const allowedStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ success: false, message: 'Status tidak valid' }, { status: 400 })
  }

  // ← tidak bisa update status jika sudah delivered atau cancelled (kecuali untuk cancel)
  if (order.status === 'delivered' && status !== 'delivered') {
    return NextResponse.json({ success: false, message: 'Order yang sudah delivered tidak bisa diubah statusnya' }, { status: 400 })
  }

  if (order.status === 'cancelled' && status !== 'cancelled') {
    return NextResponse.json({ success: false, message: 'Order yang sudah cancelled tidak bisa diubah statusnya' }, { status: 400 })
  }

  const updated = await updateOrderStatus(supabase, id, status)
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