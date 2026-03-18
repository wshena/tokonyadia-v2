import CustomBanner from '@/components/CustomBanner';
import ContentContainer from '@/components/ui/layouts/ContentContainer';
import RelatedProductLoadMore from '@/components/ui/RelatedProductLoadMore';
import { getRelatedProducts } from '@/lib/db/products';
import React from 'react'

const page = async ({params}: {params: {id: string; slug: string}}) => {
  const { id, slug } = await params

  const relatedProducts = getRelatedProducts(id);
  const initialData = relatedProducts.slice(0, 10)
  const initialPagination = {
    total:       relatedProducts.length,
    page:        1,
    limit:       10,
    totalPages:  Math.ceil(relatedProducts.length / 10),
    hasNextPage: relatedProducts.length > 10,
    hasPrevPage: false,
  }

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="space-y-10">
          <CustomBanner label={
            <h1 className='text-2xl md:text-4xl text-white'>Pilihan <span className='font-bold'>Lainnya Untukmu</span> </h1>
          } />
          
          <RelatedProductLoadMore
            productId={id}
            initialData={initialData}
            initialPagination={initialPagination}
          />
        </div>
      </ContentContainer>
    </main>
  )
}

export default page