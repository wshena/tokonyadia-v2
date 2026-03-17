import { getAllCollections, searchCollections, getCollectionsByProduct } from '@/lib/db/collections'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page      = Math.max(1, parseInt(searchParams.get('page')      ?? '1'))
  const limit     = Math.max(1, parseInt(searchParams.get('limit')     ?? '20'))
  const keyword   = searchParams.get('keyword')   ?? undefined
  const productId = searchParams.get('productId') ?? undefined

  const result = keyword
    ? searchCollections(keyword, page, limit)
    : productId
      ? getCollectionsByProduct(productId, page, limit)
      : getAllCollections(page, limit)

  return NextResponse.json({
    success: true,
    ...result,
    message: 'Collections fetched successfully'
  }, { status: 200 })
}