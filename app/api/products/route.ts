import { getAllProducts } from '@/lib/db/products';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // ambil query params, fallback ke default
  const page   = Math.max(1, parseInt(searchParams.get('page')   ?? '1'))
  const limit  = Math.max(1, parseInt(searchParams.get('limit')  ?? '20'))

  const result = getAllProducts(page, limit)

  return NextResponse.json({
    success: true,
    ...result,
    message: 'Products fetched successfully'
  }, { status: 200 })
}