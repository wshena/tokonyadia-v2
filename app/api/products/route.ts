import { getAllProducts, getFilteredProducts, getRandomProducts } from '@/lib/db/products'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page     = Math.max(1, parseInt(searchParams.get('page')     ?? '1'))
  const limit    = Math.max(1, parseInt(searchParams.get('limit')    ?? '20'))
  const keyword  = searchParams.get('keyword')  ?? undefined
  const category = searchParams.get('category') ?? undefined
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const sortBy   = searchParams.get('sortBy')   ?? undefined
  const random   = searchParams.get('random') === 'true'  // ← tambah param random

  if (random) {
    const result = getRandomProducts(page, limit)
    return NextResponse.json({ success: true, ...result, message: 'Products fetched successfully' }, { status: 200 })
  }

  const result = (keyword || category || minPrice || maxPrice || sortBy)
    ? getFilteredProducts({ keyword, category, minPrice, maxPrice, sortBy: sortBy as any, page, limit })
    : getAllProducts(page, limit)

  return NextResponse.json({ success: true, ...result, message: 'Products fetched successfully' }, { status: 200 })
}