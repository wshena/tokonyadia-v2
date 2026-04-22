import { CATALOG_REVALIDATE_SECONDS, publicCacheHeaders } from '@/lib/cache'
import { getCachedProductDetail } from '@/lib/server/catalog'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  const product = await getCachedProductDetail(id)

  if (!product) {
    return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: product,
    message: 'Product fetched successfully'
  }, {
    status: 200,
    headers: publicCacheHeaders(CATALOG_REVALIDATE_SECONDS),
  })
}
