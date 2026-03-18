import { getCategoryById } from '@/lib/db/categories'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  const id = (await params).id
  const category = getCategoryById(id)

  if (!category) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: category,
    message: 'Category fetched successfully'
  }, { status: 200 })
}