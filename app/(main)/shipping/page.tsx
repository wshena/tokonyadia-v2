'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { cn, createSlug } from '@/lib/utils'
import { getOrdersByUser } from '@/lib/db/order'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { createClient } from '@/utils/supabase/client'

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

const supabase = createClient()

const ShippingPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderParam = searchParams.get('orders')
  const orderIds = useMemo(() => {
    return orderParam?.split(',').map(id => id) || []
  }, [orderParam])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const setAlert = useUtilityStore(state => state.setAlert)

  useEffect(() => {
    if (!searchParams) return
    if (orderIds.length === 0) {
      router.replace('/order')
      return
    }

    fetchPaidOrders()
  }, [orderIds])

  const fetchPaidOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()

      const allOrders = data?.data || data || []

      console.log('orderIds:', orderIds)
      console.log('allOrders:', allOrders)

      const paidOrders = allOrders.filter((order: Order) => {
        const idMatch = orderIds.includes(order.id.toString())
        const statusMatch = ['paid', 'shipped', 'delivered'].includes(
          order.status?.toLowerCase().trim()
        )

        return idMatch && statusMatch
      })

      console.log('paidOrders:', paidOrders)

      setOrders(paidOrders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setAlert({ label: 'Gagal memuat status pengiriman', type: 'error' })
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Pembayaran Dikonfirmasi',
          description: 'Pesanan Anda telah dikonfirmasi dan sedang dipersiapkan.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: '📦'
        }
      case 'shipped':
        return {
          label: 'Sedang Dikirim',
          description: 'Pesanan Anda sedang dalam perjalanan ke alamat tujuan.',
          color: 'text-sky-600',
          bgColor: 'bg-sky-50',
          borderColor: 'border-sky-200',
          icon: '🚚'
        }
      case 'delivered':
        return {
          label: 'Sudah Diterima',
          description: 'Pesanan telah diterima dengan baik. Terima kasih!',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: '✅'
        }
      default:
        return {
          label: 'Status Tidak Diketahui',
          description: 'Status pesanan tidak dapat ditentukan.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: '❓'
        }
    }
  }

  const simulateStatusUpdate = async (orderId: number, currentStatus: string) => {
    try {
      let newStatus = currentStatus
      if (currentStatus === 'paid') {
        newStatus = 'shipped'
      } else if (currentStatus === 'shipped') {
        newStatus = 'delivered'
      }

      if (newStatus !== currentStatus) {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })
        setAlert({ label: `Status pesanan diperbarui ke ${getStatusInfo(newStatus).label}`, type: 'success' })
        fetchPaidOrders()
      }
    } catch (error) {
      setAlert({ label: 'Gagal memperbarui status', type: 'error' })
    }
  }

  if (loading) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="flex justify-center items-center min-h-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat status pengiriman...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tidak ada pesanan untuk dilacak</h1>
            <p className="text-gray-600 mb-6">Pesanan belum dibayar atau tidak valid.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Status Pengiriman</h1>
            <p className="text-gray-600">Pantau status pengiriman pesanan Anda</p>
          </div>

          <div className="space-y-6">
            {orders.map(order => {
              const statusInfo = getStatusInfo(order.status)
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{String(order.id).slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2',
                      statusInfo.bgColor,
                      statusInfo.color,
                      statusInfo.borderColor
                    )}>
                      <span>{statusInfo.icon}</span>
                      {statusInfo.label}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{statusInfo.description}</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Detail Pengiriman</h4>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Metode:</span> {order.delivery_method}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Pembayaran:</span> {order.payment_method}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Total:</span> {formatCurrency(order.currency, order.total_price)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Alamat Pengiriman</h4>
                      <p className="text-sm text-gray-600">{order.shipping_address}</p>
                    </div>
                  </div>

                  {/* Simulate status progression for demo */}
                  <div className="flex gap-2">
                    {order.status === 'paid' && (
                      <button
                        onClick={() => simulateStatusUpdate(parseInt(order.id), 'paid')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Simulasi: Kirim Pesanan
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => simulateStatusUpdate(parseInt(order.id), 'shipped')}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Simulasi: Tandai Diterima
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <div className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded-lg">
                        ✅ Pesanan telah diterima
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/order"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Kembali ke Daftar Order
            </Link>
          </div>
        </div>
      </ContentContainer>
    </main>
  )
}

export default ShippingPage