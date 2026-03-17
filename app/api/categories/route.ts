import { getAllCategories, searchCategories, getCategoriesByProduct } from '@/lib/db/categories'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page      = Math.max(1, parseInt(searchParams.get('page')      ?? '1'))
  const limit     = Math.max(1, parseInt(searchParams.get('limit')     ?? '20'))
  const keyword   = searchParams.get('keyword')   ?? undefined
  const productId = searchParams.get('productId') ?? undefined

  const result = keyword
    ? searchCategories(keyword, page, limit)
    : productId
      ? getCategoriesByProduct(productId, page, limit)
      : getAllCategories(page, limit)

  return NextResponse.json({
    success: true,
    ...result,
    message: 'Categories fetched successfully'
  }, { status: 200 })
}