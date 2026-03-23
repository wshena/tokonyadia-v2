import ProductDescription from '@/components/ProductDescription';
import ProductImage from '@/components/ProductImage';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import AddToCartCard from '@/components/ui/card/AddToCartCard';
import { ProductCard } from '@/components/ui/card/ProductCard';
import ContentContainer from '@/components/ui/layouts/ContentContainer';
import { getAllProducts, getProductById, getRandomProducts, getRelatedProducts } from '@/lib/db/products';
import { createSlug } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const page = async ({params}:{params:{id:string; slug:string}}) => {
  const { id, slug } = await params
  
  const product = getProductById(id);

  if (!product) notFound();

  const relatedProducts = getRelatedProducts(id);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Beranda', href: '/' },
    { label: 'Produk'},
    { label: product?.category ?? '', href: `/categories/${product?.category_id}/${createSlug(product?.category)}` },
    { label: product?.title ?? '' },
  ]


  // random product
  const randomProduct = getRandomProducts(12)

  return (
    <main className='w-full pt-10 md:pt-20'>
      <ContentContainer>
        <div className="flex flex-col gap-8">
          {/* breadcrumb */}
          <Breadcrumb items={breadcrumbs} className="mb-4" />

          {/* product data display */}
          <div className="flex flex-col md:flex-row flex-nowrap md:flex-wrap lg:flex-nowrap items-start justify-between color-black relative gap-7.5 md:gap-0 mb-12.5">

            {/* product image */}
            <ProductImage imageArray={product?.images?.["800x900"]} />

            {/* product description */}
            <ProductDescription product={product} />

            {/* add to cart card */}
            <AddToCartCard productData={product} />
          </div>
          
          {/* related product */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className='font-bold text-[1.5rem] lg:text-[2rem]'>Produk terkait</h2>
              <Link href={`/related/${product?.product_id}/${slug}`} className="text-green-500 hover:text-green-700">
                Lihat semua
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.product_id} {...product} />
              ))}
            </div>
          </div>

          {/* pilihan lain */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className='font-bold text-[1.5rem] lg:text-[2rem]'>Pilihan lainnya untukmu</h2>
              <Link href="/product/all" className="text-green-500 hover:text-green-700">
                Lihat semua
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {randomProduct?.data?.map((product) => (
                <ProductCard key={product.product_id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </ContentContainer>
    </main>
  )
}

export default page