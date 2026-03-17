import { getProductById, getRelatedProducts } from '@/lib/db/products'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = getProductById(params.id)

  if (!product) {
    return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
  }

  const related = getRelatedProducts(params.id, 10)

  return NextResponse.json({
    success: true,
    data: { ...product, related },
    message: 'Product fetched successfully'
  }, { status: 200 })
}