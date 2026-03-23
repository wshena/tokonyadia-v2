'use client'

import React, { useState, useCallback } from 'react'
import Button from './ui/button/Button'

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface LoadMoreListProps<T> {
  fetcher: (page: number) => Promise<{ data: T[], pagination: PaginationMeta }>
  renderItem: (item: T, index: number) => React.ReactNode
  renderSkeleton?: () => React.ReactNode
  skeletonCount?: number
  initialData?: T[]
  initialPagination?: PaginationMeta
  className?: string
  gridClassName?: string
  loadMoreLabel?: string
  emptyLabel?: string
}

function LoadMoreList<T>({
  fetcher,
  renderItem,
  renderSkeleton,
  skeletonCount = 10,
  initialData = [],
  initialPagination,
  className,
  gridClassName = 'grid grid-cols-2 md:grid-cols-4 gap-4',
  loadMoreLabel = 'Lihat Lebih Banyak',
  emptyLabel = 'Tidak ada item',
}: LoadMoreListProps<T>) {
  const [items, setItems] = useState<T[]>(initialData)
  const [pagination, setPagination] = useState<PaginationMeta | undefined>(initialPagination)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    const nextPage = (pagination?.page ?? 0) + 1
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetcher(nextPage)
      setItems(prev => [...prev, ...result.data])
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }, [pagination, fetcher])

  if (items.length === 0 && !isLoading) {
    return <p className="text-center text-gray-400 py-8">{emptyLabel}</p>
  }

  return (
    <div className={className}>
      <div className={gridClassName}>
        {/* Items */}
        {items.map((item, index) => renderItem(item, index))}

        {/* Skeleton — muncul saat loading */}
        {isLoading && renderSkeleton && (
          Array.from({ length: skeletonCount }).map((_, i) => (
            <React.Fragment key={`skeleton-${i}`}>
              {renderSkeleton()}
            </React.Fragment>
          ))
        )}
      </div>

      {error && (
        <p className="text-center text-red-500 mt-4">{error}</p>
      )}

      {pagination?.hasNextPage && (
        <div className="flex flex-col items-center gap-2 mt-8">
          <Button
            variant="outline"
            isLoading={isLoading}
            onClick={loadMore}
            label={loadMoreLabel}
            className="px-10"
          />
        </div>
      )}

      {!pagination?.hasNextPage && items.length > 0 && (
        <p className="text-center text-sm text-gray-400 mt-8">
          Semua {pagination?.total} item sudah ditampilkan
        </p>
      )}
    </div>
  )
}

export default LoadMoreList