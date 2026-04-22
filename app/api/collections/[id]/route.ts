import { CATALOG_REVALIDATE_SECONDS, publicCacheHeaders } from '@/lib/cache'
import { getCachedCollectionDetail } from '@/lib/server/catalog'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  const collection = await getCachedCollectionDetail(id)

  if (!collection) {
    return NextResponse.json({ success: false, message: 'Collection not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: collection,
    message: 'Collection fetched successfully'
  }, {
    status: 200,
    headers: publicCacheHeaders(CATALOG_REVALIDATE_SECONDS),
  })
}
