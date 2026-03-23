import CustomBanner from '@/components/CustomBanner'
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import ProductLoadMore from '@/components/ProductLoadMore'
import { getAllCategories, getCategoryById, getCategoryByPath } from '@/lib/db/categories'
import { getProductsByIds } from '@/lib/db/products'
import { notFound } from 'next/navigation'
import CategoryCardLoadMore from '@/components/CategoryCardLoadMore'

const page = async ({ params }: { params: Promise<{ id: string, slug: string }> }) => {
  const { id, slug } = await params

  // ← langsung panggil fungsi, tidak perlu Promise.resolve()
  const category = getCategoryById(id)

  if (!category) notFound()

  const productIds = category.products ?? []
  const { data: initialData, pagination: initialPagination } = getProductsByIds(productIds, 1, 20)

  // kategori lainnya
  const { data: initialCategoryData, pagination: categoryPagination } = getAllCategories(1, 10);

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