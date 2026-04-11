import ProductLoadMore from '@/components/ProductLoadMore'
import CartPageContent from '@/components/cart/CartPageContent'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { getRandomProducts } from '@/lib/db/products'

const CartPage = () => {
  const { data: initialProductData, pagination } = getRandomProducts(1, 20)

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="space-y-10 md:space-y-20">
          <CartPageContent />

          <div className="space-y-5">
            <h1 className="text-xl md:text-2xl">Isi keranjang anda dengan produk menarik</h1>
            <ProductLoadMore
              initialData={initialProductData}
              initialPagination={pagination}
            />
          </div>
        </div>
      </ContentContainer>
    </main>
  )
}

export default CartPage
