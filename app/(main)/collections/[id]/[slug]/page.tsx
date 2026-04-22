import CustomBanner from '@/components/CustomBanner';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import dynamic from 'next/dynamic';
import { getCachedCollectionDetail, getCachedCollectionList, getCachedProductsByIds } from '@/lib/server/catalog';
import { notFound } from 'next/navigation';
import React from 'react'

const CollectionCardLoadMore = dynamic(() => import('@/components/CollectionCardLoadMore'))
const ProductLoadMore = dynamic(() => import('@/components/ProductLoadMore'))

const page = async ({params}:{params:{id:string; slug:string}}) => {
  const { id: collection_id } = await params

  const collectionData = await getCachedCollectionDetail(collection_id);
  
  if (!collectionData) notFound()
  
  const productIds = collectionData?.products ?? []
  const { data: initialData, pagination: initialPagination } = await getCachedProductsByIds(productIds, 1, 20);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Beranda', href: '/' },
    { label: 'Koleksi'},
    { label: collectionData?.title ?? ''},
  ]

  // koleksi lainnya
  const { data: initialCollectionData, pagination: collectionPagination } = await getCachedCollectionList({ page: 1, limit: 10 });

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="space-y-10">
          <Breadcrumb items={breadcrumbs} className="mb-4" />

          <CustomBanner
            label={
              <h1 className="text-2xl md:text-4xl text-white">
                Cari Koleksi Produk di <span className="font-bold">{collectionData?.title}</span>
              </h1>
            }
          />

          <ProductLoadMore
            initialData={initialData}
            initialPagination={initialPagination}
          />

          {/* koleksi lainnya */}
          <div className="space-y-5">
            <h2 className='text-xl md:text-2xl font-bold'>Lihat koleksi lainnya</h2>
            <CollectionCardLoadMore initialData={initialCollectionData} initialPagination={collectionPagination} />
          </div>
        </div>
      </ContentContainer>
    </main>
  )
}

export default page
