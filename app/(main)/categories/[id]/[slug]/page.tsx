import CustomBanner from '@/components/CustomBanner'
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getCachedCategoryDetail, getCachedCategoryList, getCachedProductsByIds } from '@/lib/server/catalog'

const ProductLoadMore = dynamic(() => import('@/components/ProductLoadMore'))
const CategoryCardLoadMore = dynamic(() => import('@/components/CategoryCardLoadMore'))

const page = async ({ params }: { params: Promise<{ id: string, slug: string }> }) => {
  const { id } = await params

  // ← langsung panggil fungsi, tidak perlu Promise.resolve()
  const category = await getCachedCategoryDetail(id)

  if (!category) notFound()

  const productIds = category.products ?? []
  const { data: initialData, pagination: initialPagination } = await getCachedProductsByIds(productIds, 1, 20)

  // kategori lainnya
  const { data: initialCategoryData, pagination: categoryPagination } = await getCachedCategoryList({ page: 1, limit: 10 })

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Beranda', href: '/' },
    { label: 'Produk'},
    { label: category?.title ?? ''},
  ]

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="space-y-10">
          <Breadcrumb items={breadcrumbs} className="mb-4" />

          <CustomBanner
            label={
              <h1 className="text-2xl md:text-4xl text-white">
                Cari Lainnya di <span className="font-bold">Kategori {category.title}</span>
              </h1>
            }
          />

          <ProductLoadMore
            initialData={initialData}
            initialPagination={initialPagination}
          />

          {/* kategori lainnya */}
          <div className="space-y-5">
            <h2 className='text-xl md:text-2xl font-bold'>Lihat kategori lainnya</h2>
            <CategoryCardLoadMore initialData={initialCategoryData} initialPagination={categoryPagination} />
          </div>
        </div>
      </ContentContainer>
    </main>
  )
}

export default page
