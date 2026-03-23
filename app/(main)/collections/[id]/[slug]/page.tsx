import CollectionCardLoadMore from '@/components/CollectionCardLoadMore';
import CustomBanner from '@/components/CustomBanner';
import ProductLoadMore from '@/components/ProductLoadMore';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { getAllCollections, getCollectionById } from '@/lib/db/collections';
import { getProductsByIds } from '@/lib/db/products';
import { notFound } from 'next/navigation';
import React from 'react'

const page = async ({params}:{params:{id:string; slug:string}}) => {
  const { id: collection_id, slug: collection_slug } = await params

  const collectionData = getCollectionById(collection_id);
  
  if (!collectionData) notFound()
  
  const productIds = collectionData?.products ?? []
  const { data: initialData, pagination: initialPagination } = getProductsByIds(productIds, 1, 20);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Beranda', href: '/' },
    { label: 'Koleksi'},
    { label: collectionData?.title ?? ''},
  ]

  // koleksi lainnya
  const { data: initialCollectionData, pagination: collectionPagination } = getAllCollections(1, 10);

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