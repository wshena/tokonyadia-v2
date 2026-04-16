'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/zustand/CartStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { calculateTotal } from '@/lib/db/order'
import ContentContainer from '@/components/ui/layouts/ContentContainer'

interface Props {
  user: any
  profile: any
}

const CheckoutClient = ({ user, profile }: Props) => {
  const router  = useRouter()
  const { carts, setCart } = useCartStore()
  const setAlert = useUtilityStore(state => state.setAlert)

  const defaultAddress = profile?.address ?? ''

  const [shippingAddress, setShippingAddress] = useState(defaultAddress)
  const [notes, setNotes]                     = useState('')
  const [paymentMethod, setPaymentMethod]     = useState('brivia')
  const [deliveryMethod, setDeliveryMethod]   = useState('standard')
  const [isLoading, setIsLoading]             = useState(false)

  const products  = carts.products
  const total     = calculateTotal(products)
  const currency  = products[0]?.productData?.price?.currency ?? 'USD'

  // Redirect kalau cart kosong
  useEffect(() => {
    if (products.length === 0) {
      router.replace('/order')
    }
  }, [products.length, router])

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      setAlert({ label: 'Alamat pengiriman wajib diisi', type: 'error' })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products,
          shippingAddress,
          notes,
          paymentMethod,
          deliveryMethod,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message ?? 'Gagal membuat pesanan')
      }

      // Kosongkan cart setelah order berhasil
      setCart({ id: '', date: '', products: [] })

      setAlert({ label: 'Pesanan berhasil dibuat!', type: 'success' })
      router.push(`/order`)

    } catch (err: any) {
      setAlert({
        label: err?.message ?? 'Gagal membuat pesanan',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (products.length === 0) return null

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

            {/* Kiri — detail order */}
            <div className="flex flex-col gap-5">

              {/* Produk */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
                <h2 className="font-semibold text-lg">Produk yang dipesan</h2>
                <div className="flex flex-col gap-4 divide-y">
                  {products.map((item, idx) => {
                    const image    = item.productData?.images?.["800x900"]?.[0]
                    const subtotal = Number((item.price * item.quantity).toFixed(2))
                    return (
                      <div key={idx} className="flex items-start gap-4 pt-4 first:pt-0">
                        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden">
                          <Image src={image} alt={item.productData?.title} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <p className="font-medium line-clamp-2">{item.productData?.title}</p>
                          <p className="text-sm text-gray-500">Variant: {item.variant}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold shrink-0">{currency} {subtotal}</p>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Alamat pengiriman */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
                <h2 className="font-semibold text-lg">Alamat pengiriman</h2>
                <textarea
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  rows={4}
                  placeholder="Masukkan alamat pengiriman lengkap..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors resize-none"
                />
              </section>

              {/* Metode Pembayaran */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
                <h2 className="font-semibold text-lg">Metode Pembayaran</h2>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="brivia"
                      checked={paymentMethod === 'brivia'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">BRI Virtual Account</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="bcava"
                      checked={paymentMethod === 'bcava'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">BCA Virtual Account</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="mandiriva"
                      checked={paymentMethod === 'mandiriva'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">Mandiri Virtual Account</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="qris"
                      checked={paymentMethod === 'qris'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">QRIS</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="gopay"
                      checked={paymentMethod === 'gopay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">GoPay</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="shopeepay"
                      checked={paymentMethod === 'shopeepay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">ShopeePay</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">Transfer Bank</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">Cash on Delivery (COD)</span>
                  </label>
                </div>
              </section>

              {/* Metode Pengiriman */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
                <h2 className="font-semibold text-lg">Metode Pengiriman</h2>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="delivery"
                      value="standard"
                      checked={deliveryMethod === 'standard'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">Standard Delivery (2-3 hari)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="delivery"
                      value="instant"
                      checked={deliveryMethod === 'instant'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">Instant Courier (1 hari)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="delivery"
                      value="same-day"
                      checked={deliveryMethod === 'same-day'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">Same Day Delivery</span>
                  </label>
                </div>
              </section>

            </div>

            {/* Kanan — ringkasan order */}
            <div className="h-fit rounded-2xl border border-gray-200 bg-white p-5 space-y-4 lg:sticky lg:top-24">
              <h2 className="font-semibold text-lg">Ringkasan pesanan</h2>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total produk</span>
                  <span>{products.length} item</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total qty</span>
                  <span>{products.reduce((acc, p) => acc + p.quantity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pengiriman</span>
                  <span className="text-green-600">Gratis</span>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl text-green-600">{currency} {total}</span>
              </div>

              {/* Info pembeli */}
              <div className="rounded-xl bg-gray-50 p-3 text-sm space-y-1">
                <p className="text-gray-500">Pembeli</p>
                <p className="font-medium">{user?.user_metadata?.username ?? user?.email}</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading || products.length === 0}
                className="cursor-pointer w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Memproses...
                  </span>
                ) : 'Buat Pesanan'}
              </button>

              <button
                onClick={() => router.back()}
                className="cursor-pointer w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
              >
                Kembali ke cart
              </button>
            </div>

          </div>
        </div>
      </ContentContainer>
    </main>
  )
}

export default CheckoutClient
