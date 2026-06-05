import ContentContainer from "@/components/ui/layouts/ContentContainer";
import CategoryCard from "@/components/ui/card/CategoryCard";
import dynamic from "next/dynamic";
import {
  getCachedCategoryList,
  getCachedProductList,
} from "@/lib/server/catalog";

const BannerCarousel = dynamic(
  () => import("@/components/ui/carousel/BannerCarousel"),
);
const ProductLoadMore = dynamic(() => import("@/components/ProductLoadMore"));
const CategoryModalButton = dynamic(
  () => import("@/components/ui/button/CategoryModalButton"),
);
const DigitalProductTabs = dynamic(
  () => import("@/components/digital/DigitalProductTabs"),
);

const HomeBannerImages = [
  "/homeCarousel/item.jpg.webp",
  "/homeCarousel/item1.jpg",
  "/homeCarousel/item2.jpg",
  "/homeCarousel/item3.jpg",
];

export default async function Home() {
  const [{ data: initialProductData, pagination }, { data: categories }] =
    await Promise.all([
      getCachedProductList({ page: 1, limit: 20 }),
      getCachedCategoryList({ page: 1, limit: 7 }),
    ]);

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="space-y-10 md:space-y-20">
          <BannerCarousel images={HomeBannerImages} />
          <DigitalProductTabs />

          {/* categories */}
          <div className="w-full space-y-5">
            <h2 className="text-xl md:text-2xl font-bold">
              Lihat kategori lainnya
            </h2>
            <ul className="w-full flex overflow-x-auto flex-row md:flex-wrap items-center gap-3">
              <CategoryModalButton />
              {categories.map((category) => (
                <li key={category.category_id} className="shrink-0">
                  <CategoryCard category={category} />
                </li>
              ))}
            </ul>
          </div>

          <ProductLoadMore
            initialData={initialProductData}
            initialPagination={pagination}
          />
        </div>
      </ContentContainer>
    </main>
  );
}
