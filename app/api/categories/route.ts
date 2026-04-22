import { CATALOG_REVALIDATE_SECONDS, publicCacheHeaders, SEARCH_REVALIDATE_SECONDS } from '@/lib/cache'
import { getCachedCategoryList } from '@/lib/server/catalog'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page      = Math.max(1, parseInt(searchParams.get('page')      ?? '1'))
  const limit     = Math.max(1, parseInt(searchParams.get('limit')     ?? '20'))
  const keyword   = searchParams.get('keyword')   ?? undefined
  const productId = searchParams.get('productId') ?? undefined

  const result = await getCachedCategoryList({ page, limit, keyword, productId })

  return NextResponse.json({
    success: true,
    ...result,
    message: 'Categories fetched successfully'
  }, {
    status: 200,
    headers: publicCacheHeaders(keyword ? SEARCH_REVALIDATE_SECONDS : CATALOG_REVALIDATE_SECONDS),
  })
}
