import { createClient } from '@/utils/supabase/server'
import { createDigitalTransaction, getUserDigitalTransactions } from '@/lib/db/digitalTransactions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') as 'topup' | 'tagihan' | null
    const status = searchParams.get('status') as any
    const limit = parseInt(searchParams.get('limit') ?? '10')
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const result = await getUserDigitalTransactions(supabase, user.id, {
      category: category || undefined,
      status: status || undefined,
      limit,
      offset,
    })

    return NextResponse.json({
      data: result.data,
      count: result.count,
      message: 'Digital transactions fetched successfully',
    })
  } catch (error: any) {
    console.error('GET digital transactions error:', error)
    return NextResponse.json(
      { message: error?.message || 'Failed to fetch digital transactions' },
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
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const transaction = await createDigitalTransaction(supabase, user.id, {
      serviceId: body.serviceId,
      category: body.category,
      serviceLabel: body.serviceLabel,
      price: body.price,
      nominalLabel: body.nominalLabel,
      paymentMethod: body.paymentMethod,
      fieldValues: body.fieldValues,
      status: body.status || 'completed',
      transactionNotes: body.transactionNotes,
    })

    return NextResponse.json(
      {
        data: transaction,
        message: 'Digital transaction created successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST digital transaction error:', error)
    return NextResponse.json(
      { message: error?.message || 'Failed to create digital transaction' },
      { status: 500 }
    )
  }
}
