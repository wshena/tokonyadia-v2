import { getOrderById, cancelOrder } from '@/lib/db/order'
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const order = await cancelOrder(supabase, id)
  return NextResponse.json({ success: true, data: order })
}