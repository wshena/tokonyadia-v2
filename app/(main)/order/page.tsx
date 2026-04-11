import Link from 'next/link'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { cn } from '@/lib/utils'

const OrderPage = () => {
  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <section className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              Order Page
            </span>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Halaman order siap dilanjutkan</h1>
              <p className="text-sm leading-6 text-gray-600 md:text-base">
                Ringkasan dari cart sekarang sudah mengarah ke halaman ini. Kalau nanti kamu ingin,
                kita bisa lanjutkan dengan form alamat, metode pengiriman, dan pembayaran.
              </p>
            </div>
            <Link
              href="/cart"
              className={cn(
                'inline-flex rounded-lg border border-green-500 px-4 py-2 font-medium text-green-500 transition-colors hover:bg-green-50'
              )}
            >
              Kembali ke Cart
            </Link>
          </div>
        </section>
      </ContentContainer>
    </main>
  )
}

export default OrderPage
