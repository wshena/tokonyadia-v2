'use client'

import { useMemo, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import CartProductCard from '@/components/ui/card/CartProductCard'
import { calculateTotalPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/lib/zustand/CartStore'

const IfEmpty = () => {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-10 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-[1.3rem] font-bold">Wah belanjaanmu kosong nih</h1>
        <h2 className="text-[.9rem] text-gray-600">Yuk isi dengan barang-barang impianmu!</h2>
        <div className="relative mt-4 h-32.5 w-40">
          <Image src="/image/empty-cart.png" fill alt="product-empty" className="object-contain" />
        </div>
        <Link
          href="/"
          className={cn(
            'mt-5 inline-flex rounded-lg border border-green-500 px-4 py-2 font-medium text-green-500 transition-colors hover:bg-green-50'
          )}
        >
          Mulai Belanja
        </Link>
      </div>
    </div>
  )
}

const formatCurrency = (currency: string, amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const CartPageContent = () => {
  const carts = useCartStore(state => state.carts)
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const summary = useMemo(() => {
    const products = carts?.products ?? []
    const totalItems = products.reduce((acc, item) => acc + item.quantity, 0)
    const subtotal = products.length > 0
      ? Number(calculateTotalPrice(products).toFixed(2))
      : 0
    const currency = products[0]?.productData?.price?.currency ?? 'USD'

    return {
      products,
      totalItems,
      subtotal,
      currency,
    }
  }, [carts])

  if (!isHydrated) {
    return (
      <section className="space-y-5">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-gray-200" />
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="min-h-52 flex-1 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-60 w-full animate-pulse rounded-2xl bg-gray-100 md:w-[320px]" />
        </div>
      </section>
    )
  }

  if (summary.products.length <= 0) {
    return <IfEmpty />
  }

  return (
    <section className="space-y-5">
      <h1 className="text-xl md:text-2xl">
        Keranjang belanja ({summary.totalItems})
      </h1>

      <div className="flex flex-col items-start gap-5 md:flex-row">
        <div className="flex w-full flex-1 flex-col gap-4">
          {summary.products.map((item) => (
            <div
              key={`${item?.productData?.product_id}-${item?.variant}`}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <CartProductCard product={item} />
            </div>
          ))}
        </div>

        <aside className="w-full shrink-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:sticky md:top-28 md:w-[320px]">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Summary</h2>
              <p className="text-sm text-gray-500">Periksa kembali belanjaanmu sebelum lanjut ke order.</p>
            </div>

            <div className="space-y-3 border-y border-gray-100 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Jumlah produk</span>
                <span className="font-medium">{summary.totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatCurrency(summary.currency, summary.subtotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(summary.currency, summary.subtotal)}
              </span>
            </div>

            <Link
              href="/order"
              className={cn(
                'block w-full rounded-lg bg-green-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-green-700'
              )}
            >
              Lanjut ke Order
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default CartPageContent
