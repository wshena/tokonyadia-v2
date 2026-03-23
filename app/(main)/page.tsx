import { getAllProducts } from "@/lib/db/products";
import { getAllCategories } from "@/lib/db/categories";
import { getAllCollections } from "@/lib/db/collections";
import ContentContainer from "@/components/ui/layouts/ContentContainer";
import BannerCarousel from "@/components/ui/carousel/BannerCarousel";
import ProductLoadMore from "@/components/ProductLoadMore";

const HomeBannerImages = [
  '/homeCarousel/item.jpg.webp',
  '/homeCarousel/item1.jpg',
  '/homeCarousel/item2.jpg',
  '/homeCarousel/item3.jpg',
]

export default async function Home() {

  const { data: initialProductData, pagination } = getAllProducts(1, 20)
  
  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className='space-y-10'>
          <BannerCarousel images={HomeBannerImages} />
          <ProductLoadMore initialData={initialProductData} initialPagination={pagination} />
        </div>
      </ContentContainer>
    </main>
  );
}
