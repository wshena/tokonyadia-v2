import Breadcrumb, { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { ProductCard } from '@/app/components/ui/card/ProductCard';
import ContentContainer from '@/app/components/ui/layouts/ContentContainer';
import { getAllProducts, getProductById, getRelatedProducts } from '@/lib/db/products';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const page = async ({params}:{params:{id:string; slug:string}}) => {
  const { id, slug } = await params
  
  const product = getProductById(id);

  if (!product) notFound();

  const relatedProducts = getRelatedProducts(id);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Beranda', href: '/' },
    { label: 'Produk', href: '/products' },
    { label: product?.category ?? '', href: `/categories/${product?.category}` },
    { label: product?.title ?? '' },
  ]

  // all product
  const allProduct = getAllProducts(1, 12)

  console.log(allProduct)

  return (
    <main className='w-full pt-10 md:pt-20'>
      <ContentContainer>
        <div className="flex flex-col gap-8">
          <Breadcrumb items={breadcrumbs} className="mb-4" />
          <h1>product name: {product?.title}</h1>
          
          {/* related product */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className='font-bold text-[1.5rem] lg:text-[2rem]'>Produk terkait</h2>
              <Link href={`/related/${product?.product_id}`} className="text-green-500 hover:text-green-700">
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
              {allProduct?.data?.map((product) => (
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