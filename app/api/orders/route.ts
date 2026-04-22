import { createOrder, getOrdersByUser } from '@/lib/db/order'
import { noStoreHeaders } from '@/lib/cache'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/orders — get semua order milik user yang login
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const orders = await getOrdersByUser(supabase, user.id)
    const idsParam = request.nextUrl.searchParams.get('ids')
    const statusesParam = request.nextUrl.searchParams.get('statuses')

    const ids = idsParam
      ? new Set(idsParam.split(',').map(id => id.trim()).filter(Boolean))
      : null

    const statuses = statusesParam
      ? new Set(statusesParam.split(',').map(status => status.trim().toLowerCase()).filter(Boolean))
      : null

    const filteredOrders = orders.filter(order => {
      const idMatch = ids ? ids.has(String(order.id)) : true
      const statusMatch = statuses ? statuses.has(String(order.status).toLowerCase()) : true

      return idMatch && statusMatch
    })

    return NextResponse.json({ success: true, data: filteredOrders }, { headers: noStoreHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal memuat pesanan' },
      { status: 500 }
    )
  }
}

// POST /api/orders — buat order baru
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { products, shippingAddress, notes, paymentMethod, deliveryMethod } = body

    if (!products?.length) {
      return NextResponse.json({ success: false, message: 'Cart kosong' }, { status: 400 })
    }

    if (!shippingAddress) {
      return NextResponse.json({ success: false, message: 'Alamat pengiriman wajib diisi' }, { status: 400 })
    }

    const order = await createOrder(supabase, {
      userId: user.id,
      products,
      shippingAddress,
      notes,
      paymentMethod,
      deliveryMethod
    })

    return NextResponse.json({ success: true, data: order }, { status: 201, headers: noStoreHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal membuat pesanan' },
      { status: 500 }
    )
  }
}
