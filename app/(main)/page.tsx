import { getAllProducts } from "@/lib/db/products";
import { getAllCategories } from "@/lib/db/categories";
import { getAllCollections } from "@/lib/db/collections";
import ContentContainer from "@/components/ui/layouts/ContentContainer";
import BannerCarousel from "@/components/ui/carousel/BannerCarousel";
import ProductLoadMore from "@/components/ProductLoadMore";
import CategoryCard from "@/components/ui/card/CategoryCard";
import { CategoryIcon } from "@/components/icon";
import CategoryModalButton from "@/components/ui/button/CategoryModalButton";
import DigitalProductTabs from "@/components/digital/DigitalProductTabs";

const HomeBannerImages = [
  '/homeCarousel/item.jpg.webp',
  '/homeCarousel/item1.jpg',
  '/homeCarousel/item2.jpg',
  '/homeCarousel/item3.jpg',
]

export default async function Home() {

  const { data: initialProductData, pagination } = getAllProducts(1, 20);
  const { data: categories } = getAllCategories(1, 7);
  
  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className='space-y-10 md:space-y-20'>
          <BannerCarousel images={HomeBannerImages} />
          <DigitalProductTabs />

          {/* categories */}
          <div className="w-full space-y-5">
            <h2 className='text-xl md:text-2xl font-bold'>Lihat kategori lainnya</h2>
            <ul className="flex flex-col md:flex-row flex-wrap md:items-center gap-3">
              <CategoryModalButton />
              {categories.map((category) => (
                <li key={category.category_id}>
                  <CategoryCard category={category} />
                </li>
              ))}
            </ul>
          </div>

          <ProductLoadMore initialData={initialProductData} initialPagination={pagination} />
        </div>
      </ContentContainer>
    </main>
  );
}
