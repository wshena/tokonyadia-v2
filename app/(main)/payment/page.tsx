'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { getOrdersByUser } from '@/lib/db/order'
import { createClient } from '@/utils/supabase/client'
import { createSlug } from '@/lib/utils'
import Image from 'next/image'
import PaymentConfirmationModal from '@/components/ui/modals/PaymentConfirmationModal'

export interface OrderItem {
  id: string
  order_id: string
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
  user_id: string
  status: string
  total_price: number
  currency: string
  shipping_address: string
  notes?: string
  created_at: string
  updated_at: string
  delivery_method: string
  payment_method: string
  order_items?: OrderItem[]
}

const supabase = createClient();

const PaymentPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderIds = useMemo(() => {
    return searchParams
      .get('orders')
      ?.split(',')
      .map(id => id) || []
  }, [searchParams])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const setAlert = useUtilityStore(state => state.setAlert)

  useEffect(() => {
    if (!searchParams) return
    if (orderIds.length === 0) {
      router.replace('/order')
      return
    }

    fetchSelectedOrders()
  }, [orderIds])

  const fetchSelectedOrders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const allOrders = await getOrdersByUser(supabase, user.id)

      console.log('Debug - orderIds from URL:', orderIds)
      console.log('Debug - allOrders:', allOrders.map(o => ({ id: o.id, status: o.status })))

      const selectedOrders = allOrders.filter((order: Order) => {
        const idMatch = orderIds.includes(order.id.toString())
        const statusMatch = order.status.toLowerCase() === 'pending'
        console.log(`Debug - Order ${order.id}: idMatch=${idMatch}, statusMatch=${statusMatch}, status=${order.status}`)
        return idMatch && statusMatch
      })

      console.log('Debug - selectedOrders:', selectedOrders)

      setOrders(selectedOrders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setAlert({ label: 'Gagal memuat pesanan', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (currency: string, amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return '-'
    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate)
  }

  const totalAmount = orders.reduce((sum, order) => sum + order.total_price, 0)
  const currency = orders[0]?.currency || 'USD'

  const handlePayment = () => {
    setShowPaymentModal(true)
  }

  const confirmPayment = async () => {
    setIsProcessing(true)
    setShowPaymentModal(false)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update order status to 'paid'
      const promises = orders.map(order =>
        fetch(`/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'paid' }),
        })
      )
      await Promise.all(promises)

      setAlert({ label: 'Pembayaran berhasil! Pesanan akan segera diproses.', type: 'success' })
      router.push(`/shipping?orders=${orderIds.join(',')}`)
    } catch (error: any) {
      setAlert({ label: 'Pembayaran gagal. Silakan coba lagi.', type: 'error' })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="flex justify-center items-center min-h-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tidak ada pesanan untuk dibayar</h1>
            <p className="text-gray-600 mb-6">Semua pesanan telah dibayar atau tidak valid.</p>
            <Link
              href="/order"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Kembali ke Order
            </Link>
          </div>
        </ContentContainer>
      </main>
    )
  }

  console.log(orders)

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Konfirmasi Pembayaran</h1>
            <p className="text-gray-600">Periksa detail pesanan sebelum melanjutkan pembayaran</p>
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan ({orders.length})</h2>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-100 rounded-lg p-4">
                    <div className='space-y-5'>
                      <div className="">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-sm text-gray-500">Order #{String(order.id).slice(-8)}</span>
                            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                          </div>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(order.currency, order.total_price)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.order_items?.length || 0} produk • {order.delivery_method} • {order.payment_method}
                        </div>
                      </div>

                      {/* order items */}
                      <div className="space-y-4 py-5">
                        {order?.order_items?.map((product:any) => (
                          <div
                            key={`${order.id}-${product.product_id}-${product.variant}`}
                            className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 md:flex-row"
                          >
                            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gray-100 md:w-28">
                              <Image
                                src={product.image}
                                alt={product.product_title}
                                fill
                                className="object-cover"
                              />
                            </div>
                      
                            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-1">
                                <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase">{product.category}</p>
                                <h3 className="text-base font-semibold text-gray-900">{product.title}</h3>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                  <span>Varian {product.variant}</span>
                                  <span>Qty {product.quantity}</span>
                                </div>
                              </div>
                      
                              <div className="space-y-2 md:text-right">
                                <p className="text-sm text-gray-500">Harga produk</p>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(product.price.currency, product.price)}</p>
                                  <Link
                                    href={`/product/${product.product_id}/${createSlug(product.product_title)}`}
                                    className="inline-flex text-sm font-medium text-green-600 transition-colors hover:text-green-700"
                                  >Lihat produk</Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Pembayaran</span>
                  <span className="text-green-600">{formatCurrency(currency, totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Metode Pembayaran</h2>
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Order #{String(order.id).slice(-8)}</span>
                      <p className="text-sm text-gray-600">{order.payment_method}</p>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(order.currency, order.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => router.back()}
                disabled={isProcessing}
                className="cursor-pointer flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="cursor-pointer flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Memproses Pembayaran...
                  </>
                ) : (
                  `Bayar ${formatCurrency(currency, totalAmount)}`
                )}
              </button>
            </div>
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
      />
    </main>
  )
}

export default PaymentPage