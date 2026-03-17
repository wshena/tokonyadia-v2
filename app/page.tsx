import { getAllProducts } from "@/lib/db/products";
import ContentContainer from "../components/ui/layouts/ContentContainer";
import BannerCarousel from "../components/ui/carousel/BannerCarousel";
import ProductLoadMore from '../components/ui/ProductLoadMore';
import { getAllCategories } from "@/lib/db/categories";
import { getAllCollections } from "@/lib/db/collections";

export default async function Home() {

  const { data: initialProductData, pagination } = getAllProducts(1, 20)
  // const { data: initialCategoryData } = getAllCategories(1, 20)
  // const { data: initialCollectionData } = getAllCollections(1, 20)

  // console.log('initialCollectionData', initialCollectionData)
  
  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className='space-y-10'>
          <BannerCarousel />
          <ProductLoadMore initialData={initialProductData} initialPagination={pagination} />
        </div>
      </ContentContainer>
    </main>
  );
}
