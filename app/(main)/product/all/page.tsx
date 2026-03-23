import React from 'react'
import CustomBanner from '@/components/CustomBanner'
import CategoryCard from '@/components/ui/card/CategoryCard'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import ProductLoadMore from '@/components/ProductLoadMore'
import { getAllCategories } from '@/lib/db/categories'
import { getAllCollections } from '@/lib/db/collections'
import { getAllProducts, getRandomProducts } from '@/lib/db/products'
import CategoryCardLoadMore from '@/components/CategoryCardLoadMore'
import CollectionCardLoadMore from '@/components/CollectionCardLoadMore'

const CategorySection = ({label, initialData, initialPagination}:{label:string, initialData:any[], initialPagination:any}) => {
  return (
    <div className="space-y-5">
      <h2 className='text-xl md:text-2xl font-bold'>{label}</h2>
      <CategoryCardLoadMore initialData={initialData} initialPagination={initialPagination} />
    </div>
  )
}

const CollectionSection = ({label, initialData, initialPagination}:{label:string, initialData:any[], initialPagination:any}) => {
  return (
    <div className="space-y-5">
      <h2 className='text-xl md:text-2xl font-bold'>{label}</h2>
      <CollectionCardLoadMore initialData={initialData} initialPagination={initialPagination} />
    </div>
  )
}

const page = () => {
  const { data:initialCollectionData, pagination: collectionPagination } = getAllCollections(1, 10);
  const { data:initialCategoryData, pagination: categoryPagination } = getAllCategories(1, 10);
  const { data: initialProductData, pagination } = getRandomProducts(1, 20)
  
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