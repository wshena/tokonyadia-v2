import { publicCacheHeaders, SEARCH_REVALIDATE_SECONDS } from '@/lib/cache'
import { getCachedSearchSection } from '@/lib/server/catalog'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword') ?? ''
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit   = Math.max(1, parseInt(searchParams.get('limit') ?? '20'))
  const section = searchParams.get('section') ?? 'products' // ← tentukan section mana yang di-fetch

  switch (section) {
    case 'products':
    case 'categories':
    case 'collections': {
      const result = await getCachedSearchSection(section, keyword, page, limit)
      return NextResponse.json(
        { success: true, ...result },
        { headers: publicCacheHeaders(SEARCH_REVALIDATE_SECONDS) }
      )
    }

    default:
      return NextResponse.json({ success: false, message: 'Invalid section' }, { status: 400 })
  }
}
