import React from 'react'
import CustomBanner from '@/components/CustomBanner'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import dynamic from 'next/dynamic'
import {
  getCachedCategoryList,
  getCachedCollectionList,
  getCachedProductList,
} from '@/lib/server/catalog'

const ProductLoadMore = dynamic(() => import('@/components/ProductLoadMore'))
const CategoryCardLoadMore = dynamic(() => import('@/components/CategoryCardLoadMore'))
const CollectionCardLoadMore = dynamic(() => import('@/components/CollectionCardLoadMore'))

type CategorySectionProps = {
  label: string
  initialData: Awaited<ReturnType<typeof getCachedCategoryList>>['data']
  initialPagination: Awaited<ReturnType<typeof getCachedCategoryList>>['pagination']
}

type CollectionSectionProps = {
  label: string
  initialData: Awaited<ReturnType<typeof getCachedCollectionList>>['data']
  initialPagination: Awaited<ReturnType<typeof getCachedCollectionList>>['pagination']
}

const CategorySection = ({label, initialData, initialPagination}: CategorySectionProps) => {
  return (
    <div className="space-y-5">
      <h2 className='text-xl md:text-2xl font-bold'>{label}</h2>
      <CategoryCardLoadMore initialData={initialData} initialPagination={initialPagination} />
    </div>
  )
}

const CollectionSection = ({label, initialData, initialPagination}: CollectionSectionProps) => {
  return (
    <div className="space-y-5">
      <h2 className='text-xl md:text-2xl font-bold'>{label}</h2>
      <CollectionCardLoadMore initialData={initialData} initialPagination={initialPagination} />
    </div>
  )
}

const page = async () => {
  const [
    { data: initialCollectionData, pagination: collectionPagination },
    { data: initialCategoryData, pagination: categoryPagination },
    { data: initialProductData, pagination },
  ] = await Promise.all([
    getCachedCollectionList({ page: 1, limit: 10 }),
    getCachedCategoryList({ page: 1, limit: 10 }),
    getCachedProductList({ page: 1, limit: 20, random: true }),
  ])
  
  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="space-y-10">
          <CustomBanner label={
            <h1 className='text-2xl md:text-4xl text-white'>Dapatkan Produk Murah Hanya di <span className='font-bold'>Tokonyadia</span> </h1>
          } />

          {/* category list */}
          <CategorySection label='Banyak Pilihan Kategori' initialData={initialCategoryData} initialPagination={categoryPagination} />

          {/* collection list */}
          <CollectionSection label='Lihat Koleksi Populer' initialData={initialCollectionData} initialPagination={collectionPagination} />

          {/* product list */}
          <div className="space-y-2">
            <h2 className='text-xl md:text-2xl font-bold'>Temukan produk menarik</h2>
            <ProductLoadMore initialData={initialProductData} initialPagination={pagination} />
          </div>
        </div>
      </ContentContainer>
    </main>
  )
}

export default page
