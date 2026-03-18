import { getProductById, getRelatedProducts } from '@/lib/db/products'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  const product = getProductById(id)

  if (!product) {
    return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
  }

  const related = getRelatedProducts(id, 10)

  return NextResponse.json({
    success: true,
    data: { ...product, related },
    message: 'Product fetched successfully'
  }, { status: 200 })
}