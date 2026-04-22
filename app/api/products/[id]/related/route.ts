import { CATALOG_REVALIDATE_SECONDS, publicCacheHeaders } from '@/lib/cache'
import { getCachedRelatedProducts } from '@/lib/server/catalog'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)

  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit = Math.max(1, parseInt(searchParams.get('limit') ?? '10'))

  const result = await getCachedRelatedProducts(id, page, limit)

  return NextResponse.json({
    success: true,
    ...result,
    message: 'Related products fetched successfully'
  }, {
    status: 200,
    headers: publicCacheHeaders(CATALOG_REVALIDATE_SECONDS),
  })
}
