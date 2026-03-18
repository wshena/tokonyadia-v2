import { getFilteredProducts, getProductsByIds } from '@/lib/db/products'
import { searchCategories } from '@/lib/db/categories'
import { searchCollections } from '@/lib/db/collections'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword') ?? ''
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit   = Math.max(1, parseInt(searchParams.get('limit') ?? '20'))
  const section = searchParams.get('section') ?? 'products' // ← tentukan section mana yang di-fetch

  switch (section) {
    case 'products': {
      const result = getFilteredProducts({ keyword, page, limit })
      return NextResponse.json({ success: true, ...result })
    }

    case 'categories': {
      // Cari categories yang match keyword
      const { data: matchedCategories } = searchCategories(keyword, 1, 100)
      // Kumpulkan semua product_ids dari categories yang match
      const productIds = [...new Set(matchedCategories.flatMap(c => c.products))]
      const result = getProductsByIds(productIds, page, limit)
      return NextResponse.json({
        success: true,
        ...result,
        // Kirim juga nama categories yang match untuk ditampilkan sebagai label
        matchedNames: matchedCategories.map(c => c.title)
      })
    }

    case 'collections': {
      const { data: matchedCollections } = searchCollections(keyword, 1, 100)
      const productIds = [...new Set(matchedCollections.flatMap(c => c.products))]
      const result = getProductsByIds(productIds, page, limit)
      return NextResponse.json({
        success: true,
        ...result,
        matchedNames: matchedCollections.map(c => c.title)
      })
    }

    default:
      return NextResponse.json({ success: false, message: 'Invalid section' }, { status: 400 })
  }
}