import { CATALOG_REVALIDATE_SECONDS, publicCacheHeaders } from '@/lib/cache'
import { getCachedCategoryDetail } from '@/lib/server/catalog'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  const id = (await params).id
  const category = await getCachedCategoryDetail(id)

  if (!category) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: category,
    message: 'Category fetched successfully'
  }, {
    status: 200,
    headers: publicCacheHeaders(CATALOG_REVALIDATE_SECONDS),
  })
}
