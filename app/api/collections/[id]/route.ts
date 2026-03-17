import { getCollectionById } from '@/lib/db/collections'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const collection = getCollectionById(params.id)

  if (!collection) {
    return NextResponse.json({ success: false, message: 'Collection not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: collection,
    message: 'Collection fetched successfully'
  }, { status: 200 })
}