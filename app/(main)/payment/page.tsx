'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import PaymentConfirmationModal from '@/components/ui/modals/PaymentConfirmationModal'
import { useUtilityStore } from '@/lib/zustand/utilityStore'

type OrderItem = {
  id: string
  product_id: string
  product_title: string
  variant: string
  quantity: number
  price: number
  subtotal: number
  image: string
}

type Order = {
  id: string
  status: string
  total_price: number
  currency: string
  created_at: string
  shipping_address: string
  payment_method: string
  delivery_method: string
  order_items?: OrderItem[]
}

const paymentMethods = [
  { value: 'brivia', label: 'BRI Virtual Account', description: 'Verifikasi otomatis dalam beberapa menit.' },
  { value: 'bcava', label: 'BCA Virtual Account', description: 'Cocok untuk pembayaran via mobile banking BCA.' },
  { value: 'mandiriva', label: 'Mandiri Virtual Account', description: 'Pembayaran aman dengan nomor VA unik.' },
  { value: 'bni', label: 'BNI Virtual Account', description: 'Praktis untuk pengguna BNI Mobile Banking.' },
  { value: 'qris', label: 'QRIS', description: 'Bayar cepat via aplikasi e-wallet atau mobile banking.' },
  { value: 'gopay', label: 'GoPay', description: 'Pembayaran instan langsung dari saldo GoPay.' },
  { value: 'shopeepay', label: 'ShopeePay', description: 'Mudah untuk pengguna ShopeePay aktif.' },
  { value: 'cod', label: 'Cash on Delivery', description: 'Bayar saat pesanan sudah tiba di alamat.' },
  { value: 'bank_transfer', label: 'Transfer Bank', description: 'Gunakan transfer manual ke rekening tujuan.' },
]

const formatCurrency = (currency: string, amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency || 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))

const PaymentPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAlert = useUtilityStore(state => state.setAlert)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const orderIds = useMemo(
    () => searchParams.get('orders')?.split(',').map(id => id.trim()).filter(Boolean) ?? [],
    [searchParams]
  )
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('qris')

  useEffect(() => {
    const fetchSelectedOrders = async () => {
      if (orderIds.length === 0) {
        router.replace('/order')
        return
      }

      try {
        const response = await fetch(
          `/api/orders?ids=${encodeURIComponent(orderIds.join(','))}&statuses=pending`,
          { cache: 'no-store' }
        )
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload?.message ?? 'Gagal memuat pesanan')
        }

        const nextOrders = payload.data ?? []
        setOrders(nextOrders)

        if (nextOrders.length > 0) {
          setSelectedPaymentMethod(nextOrders[0].payment_method || 'qris')
        }
      } catch (error: unknown) {
        setAlert({ label: error instanceof Error ? error.message : 'Gagal memuat pesanan', type: 'error' })
      } finally {
        setLoading(false)
      }
    }

    fetchSelectedOrders()
  }, [orderIds, router, setAlert])

  const totalAmount = orders.reduce((sum, order) => sum + order.total_price, 0)
  const currency = orders[0]?.currency || 'IDR'
  const selectedMethod = paymentMethods.find(method => method.value === selectedPaymentMethod)

  const confirmPayment = async () => {
    setIsProcessing(true)
    setShowPaymentModal(false)

    try {
      await Promise.all(
        orders.map(async order => {
          const response = await fetch(`/api/orders/${order.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: selectedPaymentMethod === 'cod' ? 'shipped' : 'paid',
              paymentMethod: selectedPaymentMethod,
            }),
          })

          if (!response.ok) {
            const payload = await response.json().catch(() => null)
            throw new Error(payload?.message ?? `Gagal memproses order ${order.id}`)
          }
        })
      )

      setAlert({
        label: selectedPaymentMethod === 'cod'
          ? 'Order berhasil dibuat. Pembayaran akan dilakukan saat pesanan tiba.'
          : 'Pembayaran berhasil dan order akan segera diproses.',
        type: 'success',
      })
      router.push(`/shipping?orders=${orderIds.join(',')}`)
    } catch (error: unknown) {
      setAlert({ label: error instanceof Error ? error.message : 'Pembayaran gagal. Silakan coba lagi.', type: 'error' })
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
              <p className="mt-4 text-gray-600">Memuat detail pembayaran...</p>
            </div>
          </div>
        </ContentContainer>
      </main>
    )
  }

  if (orders.length === 0) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Tidak ada order yang siap dibayar</h1>
            <p className="mt-3 text-gray-600">Order mungkin sudah dibayar, dibatalkan, atau tidak ditemukan.</p>
            <Link href="/order" className="mt-6 inline-flex rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700">
              Kembali ke Order
            </Link>
          </div>
        </ContentContainer>
      </main>
    )
  }

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Konfirmasi Pembayaran</h1>
            <p className="mt-2 text-gray-600">Satu metode pembayaran akan diterapkan ke semua order yang dipilih.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-6">
              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Ringkasan Order</h2>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                    {orders.length} order
                  </span>
                </div>

                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="rounded-2xl border border-gray-100 p-4">
                      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Order #{String(order.id).slice(-8)}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                        </div>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(order.currency, order.total_price)}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {(order.order_items ?? []).map(item => (
                          <div key={item.id} className="flex gap-4 rounded-2xl border border-gray-100 p-3">
                            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                              <Image src={item.image} alt={item.product_title} fill sizes="80px" className="object-cover" />
                            </div>
                            <div className="flex flex-1 items-center justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-gray-900">{item.product_title}</h3>
                                <p className="text-sm text-gray-500">Varian {item.variant} • Qty {item.quantity}</p>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(order.currency, item.subtotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Pilih Metode Pembayaran</h2>
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <label
                      key={method.value}
                      className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-colors ${
                        selectedPaymentMethod === method.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={method.value}
                        checked={selectedPaymentMethod === method.value}
                        onChange={event => setSelectedPaymentMethod(event.target.value)}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{method.label}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <aside className="h-fit rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold text-gray-900">Detail Pembayaran</h2>

              <div className="mt-5 space-y-3 rounded-2xl bg-gray-50 p-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total order</span>
                  <span>{orders.length}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total item</span>
                  <span>{orders.reduce((sum, order) => sum + (order.order_items ?? []).reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Metode terpilih</span>
                  <span className="text-right">{selectedMethod?.label}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                    <span>Total bayar</span>
                    <span className="text-green-600">{formatCurrency(currency, totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
                {selectedPaymentMethod === 'cod'
                  ? 'Untuk COD, order langsung masuk ke proses pengiriman dan pembayaran dilakukan saat paket diterima.'
                  : 'Setelah konfirmasi, semua order terpilih akan langsung diperbarui ke status sudah dibayar.'}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => router.back()}
                  disabled={isProcessing}
                  className="flex-1 rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={isProcessing}
                  className="flex-1 rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  Bayar Sekarang
                </button>
              </div>
            </aside>
          </div>
        </div>
      </ContentContainer>

      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={confirmPayment}
        isProcessing={isProcessing}
        orders={orders}
        totalAmount={totalAmount}
        currency={currency}
        formatCurrency={formatCurrency}
        selectedPaymentLabel={selectedMethod?.label ?? '-'}
      />
    </main>
  )
}

export default PaymentPage
