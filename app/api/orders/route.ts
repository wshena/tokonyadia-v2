import { createOrder, getOrdersByUser } from '@/lib/db/order'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/orders — get semua order milik user yang login
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const orders = await getOrdersByUser(supabase, user.id)
  return NextResponse.json({ success: true, data: orders })
}

// POST /api/orders — buat order baru
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { products, shippingAddress, notes } = body

  if (!products?.length) {
    return NextResponse.json({ success: false, message: 'Cart kosong' }, { status: 400 })
  }

  if (!shippingAddress) {
    return NextResponse.json({ success: false, message: 'Alamat pengiriman wajib diisi' }, { status: 400 })
  }

  const order = await createOrder(supabase, { userId: user.id, products, shippingAddress, notes })

  return NextResponse.json({ success: true, data: order }, { status: 201 })
}