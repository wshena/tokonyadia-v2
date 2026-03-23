'use client'

import { GetAllCollections } from '@/lib/function'
import LoadMoreList from './LoadMoreList'
import CollectionCard from './ui/card/CollectionCard'

const fetcher = async (page: number) => {
  return GetAllCollections({ page, limit: 20 })
}

interface Props {
  initialData: any[]
  initialPagination: any
}

export default function CollectionCardLoadMore({ initialData, initialPagination }: Props) {
  return (
    <LoadMoreList
      fetcher={fetcher}
      renderItem={(collection) => (
        <CollectionCard key={collection.collection_id} collection={collection} />
      )}
      initialData={initialData}
      initialPagination={initialPagination}
      gridClassName="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      className='flex md:grid flex-col items-center gap-4'
      loadMoreLabel="Lihat Lebih Banyak"
    />
  )
}