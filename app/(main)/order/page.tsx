'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { cn, createSlug } from '@/lib/utils'
import { getOrdersByUser } from '@/lib/db/order'
import CancelOrderModal from '@/components/ui/modals/CancelOrderModal'
import DeleteOrderModal from '@/components/ui/modals/DeleteOrderModal'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { createClient } from '@/utils/supabase/client'

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

type OrderProduct = {
  productData: {
    product_id: string
    title: string
    category: string
    path: string
    images: {
      ['800x900']: string[]
    }
    price: {
      currency: string
    }
  }
  variant: string
  price: number
  quantity: number
}

type Order = {
  id: number
  products: OrderProduct[]
  status: OrderStatus
  created_at: string
  total_price: number
  currency: string
  shipping_address: string
  paymentMethod: string
  deliveryMethod: string
  notes: string
}

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
const orders = user ? await getOrdersByUser(supabase, user.id) : []

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string; description: string }
> = {
  pending: {
    label: 'Menunggu Pembayaran',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Selesaikan pembayaran agar pesanan segera diproses.',
  },
  paid: {
    label: 'Sudah Dibayar',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Pembayaran berhasil diverifikasi oleh sistem.',
  },
  shipped: {
    label: 'Dikirim',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Pesanan sedang dalam perjalanan ke alamat tujuan.',
  },
  delivered: {
    label: 'Selesai',
    className: 'bg-green-50 text-green-700 border-green-200',
    description: 'Pesanan sudah diterima dengan baik.',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Pesanan dibatalkan dan tidak akan diproses.',
  },
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

const formatDeliveryMethod = (value: string) => {
  switch (value) {
    case 'same-day':
      return 'Same Day'
    case 'instant':
      return 'Instant Courier'
    case 'standard':
      return 'Standard Delivery'
    default:
      return value
  }
}

const formatPaymentMethod = (value: string) => {
  switch (value) {
    case 'brivia':
      return 'BRI Virtual Account'
    default:
      return value
  }
}

const totalOrders = orders?.length
const totalItems = orders?.reduce((sum, order) => {
  return sum + order?.order_items?.reduce((itemSum:number, product:OrderProduct) => itemSum + product.quantity, 0)
}, 0)
const totalSpent = orders?.reduce((sum, order) => sum + order.total_price, 0)
const pendingOrders = orders?.filter(order => order.status === 'pending').length
const sortedOrders = orders
  .slice()
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

const getMostFrequentValue = <T extends string>(values: T[]) => {
  const counter = values.reduce(
    (acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1
      return acc
    },
    {} as Record<T, number>
  )

  return (Object.entries(counter) as Array<[T, number]>).sort((a, b) => b[1] - a[1])[0]?.[0] as T | undefined
}

const dominantStatus = getMostFrequentValue(orders.map(order => order.status)) ?? 'pending'
const favoritePaymentMethod =
  getMostFrequentValue(orders.map(order => order.paymentMethod)) ?? 'brivia'

const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [modalType, setModalType] = useState<'cancel' | 'delete' | 'bulk-cancel' | 'bulk-delete' | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const setAlert = useUtilityStore(state => state.setAlert)

  useEffect(() => {
    const init = async () => {
      await fetchOrders()
    }

    init()

    // Real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    // Polling fallback every 10 seconds
    const pollInterval = setInterval(fetchOrders, 10000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data.data || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setAlert({ label: 'Gagal memuat pesanan', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const openCancelModal = (orderId: number) => {
    setModalType('cancel')
    setSelectedOrderId(orderId)
  }

  const openDeleteModal = (orderId: number) => {
    setModalType('delete')
    setSelectedOrderId(orderId)
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedOrderId(null)
    setIsProcessing(false)
  }

  const executeBulkCancel = async () => {
    setIsProcessing(true)
    try {
      const promises = Array.from(selectedOrders).map(orderId =>
        fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to cancel order ${orderId}`)
          return res
        })
      )
      await Promise.all(promises)
      setAlert({ label: `${selectedOrders.size} pesanan berhasil dibatalkan`, type: 'success' })
      closeModal()
      setSelectedOrders(new Set())
      fetchOrders()
    } catch (error: any) {
      setAlert({ label: 'Gagal membatalkan beberapa pesanan', type: 'error' })
      setIsProcessing(false)
    }
  }

  const executeBulkDelete = async () => {
    setIsProcessing(true)
    try {
      const promises = Array.from(selectedOrders).map(orderId =>
        fetch(`/api/orders/${orderId}`, {
          method: 'DELETE',
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to delete order ${orderId}`)
          return res
        })
      )
      await Promise.all(promises)
      setAlert({ label: `${selectedOrders.size} pesanan berhasil dihapus`, type: 'success' })
      closeModal()
      setSelectedOrders(new Set())
      fetchOrders()
    } catch (error: any) {
      setAlert({ label: 'Gagal menghapus beberapa pesanan', type: 'error' })
      setIsProcessing(false)
    }
  }

  const toggleOrderSelection = (orderId: number) => {
    const order = orders.find(o => o.id === orderId)
    if (!order || order.status !== 'pending') return

    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const selectAllOrders = () => {
    const pendingOrderIds = new Set(
      orders
        .filter(order => order.status === 'pending')
        .map(order => order.id)
    )
    setSelectedOrders(pendingOrderIds)
  }

  const deselectAllOrders = () => {
    setSelectedOrders(new Set())
  }

  const bulkCancelOrders = () => {
    if (selectedOrders.size === 0) return
    setModalType('bulk-cancel')
    setSelectedOrderId(null)
  }

  const bulkDeleteOrders = () => {
    if (selectedOrders.size === 0) return
    setModalType('bulk-delete')
    setSelectedOrderId(null)
  }

  const proceedToPayment = () => {
    if (selectedOrders.size === 0) return

    // Filter hanya order dengan status 'pending'
    const pendingOrderIds = Array.from(selectedOrders)
      .filter(orderId => {
        const order = orders.find(o => o.id === orderId)
        return order && order.status === 'pending'
      })

    if (pendingOrderIds.length === 0) {
      setAlert({ label: 'Tidak ada pesanan pending yang dapat diproses pembayaran', type: 'error' })
      return
    }

    const orderIds = pendingOrderIds.join(',')
    window.location.href = `/payment?orders=${orderIds}`
  }

  if (loading) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="flex justify-center items-center min-h-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat pesanan...</p>
            </div>
          </div>
        </ContentContainer>
      </main>
    )
  }

  if (orders.length <= 0) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <section className="rounded-[28px] border border-gray-200 bg-white px-6 py-10 shadow-sm md:px-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-40 w-40">
                <Image
                  src="/image/3-emptystate.png"
                  alt="empty-order"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="mt-6 text-2xl font-bold">Belum ada pesanan</h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600 md:text-base">
                Semua pesananmu akan muncul di sini. Mulai belanja dulu, lalu lanjutkan checkout
                dari cart untuk membuat order pertama.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className={cn(
                    'inline-flex rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700'
                  )}
                >
                  Mulai Belanja
                </Link>
                <Link
                  href="/cart"
                  className={cn(
                    'inline-flex rounded-lg border border-green-500 px-5 py-3 font-medium text-green-600 transition-colors hover:bg-green-50'
                  )}
                >
                  Lihat Cart
                </Link>
              </div>
            </div>
          </section>
        </ContentContainer>
      </main>
    )
  }

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="space-y-8 md:space-y-10">
          <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
            <div className="bg-linear-to-r from-green-600 via-emerald-500 to-lime-400 px-6 py-8 text-white md:px-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl space-y-3">
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                    Pusat Pesanan
                  </span>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold md:text-4xl">Pantau semua ordermu di satu tempat</h1>
                    <p className="max-w-xl text-sm leading-6 text-white/90 md:text-base">
                      Lihat status pembayaran, detail produk, alamat pengiriman, dan ringkasan
                      transaksi tanpa perlu pindah halaman.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/cart"
                    className="inline-flex rounded-lg bg-white px-4 py-2 font-medium text-green-700 transition-colors hover:bg-green-50"
                  >
                    Kembali ke Cart
                  </Link>
                  <Link
                    href="/product/all"
                    className="inline-flex rounded-lg border border-white/40 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Belanja Lagi
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 md:px-8">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Total pesanan</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{totalOrders}</h2>
                <p className="mt-1 text-sm text-gray-600">Semua transaksi yang sudah tercatat.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Produk dibeli</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{totalItems}</h2>
                <p className="mt-1 text-sm text-gray-600">Total item dari seluruh order.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Menunggu proses</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{pendingOrders}</h2>
                <p className="mt-1 text-sm text-gray-600">Pesanan yang masih butuh tindakan.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Total belanja</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(orders[0]?.currency ?? 'USD', totalSpent)}
                </h2>
                <p className="mt-1 text-sm text-gray-600">Akumulasi nilai transaksi sampai sekarang.</p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* Bulk Actions */}
            {selectedOrders.size > 0 ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedOrders.size} pesanan dipilih
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={proceedToPayment}
                      className="cursor-pointer px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Bayar ({selectedOrders.size})
                    </button>
                    <button
                      onClick={bulkCancelOrders}
                      className="cursor-pointer px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Batalkan
                    </button>
                    <button
                      onClick={bulkDeleteOrders}
                      className="cursor-pointer px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={deselectAllOrders}
                      className="cursor-pointer px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Batal Pilih
                    </button>
                  </div>
                </div>

                <div className="mt-10 space-y-5">
                  {/* Select All */}
                  {orders.length > 0 && (
                    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={
                          orders.filter(order => order.status === 'pending').length > 0 &&
                          selectedOrders.size === orders.filter(order => order.status === 'pending').length &&
                          selectedOrders.size > 0
                        }
                        onChange={() => {
                          const pendingOrders = orders.filter(order => order.status === 'pending')
                          const allPendingSelected = pendingOrders.every(order => selectedOrders.has(order.id))

                          if (allPendingSelected) {
                            deselectAllOrders()
                          } else {
                            selectAllOrders()
                          }
                        }}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">
                        Pilih Semua Pending ({orders.filter(order => order.status === 'pending').length})
                      </span>
                    </div>
                  )}
                  {sortedOrders.map(order => {
                      const orderStatus = statusConfig[order.status as OrderStatus] ?? statusConfig.pending
                      const totalProductQuantity = order?.products?.reduce(
                        (sum:number, product:OrderProduct) => sum + product.quantity,
                        0
                      )

                      return (
                        <article
                          key={order.id}
                          className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm md:p-6"
                        >
                          {/* Order Header with Checkbox */}
                          <div className="flex items-start gap-3 mb-4">
                            <input
                              type="checkbox"
                              checked={selectedOrders.has(order.id)}
                              onChange={() => toggleOrderSelection(order.id)}
                              disabled={order.status !== 'pending'}
                              className={cn(
                                "w-4 h-4 mt-1 text-green-600 focus:ring-green-500",
                                order.status !== 'pending' && "cursor-not-allowed opacity-50"
                              )}
                            />
                            <div className="flex-1">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={cn(
                                      'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
                                      orderStatus.className
                                    )}
                                  >
                                    {orderStatus.label}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    #{String(order.id).slice(-8)}
                                  </span>
                                </div>
                                <div>
                                  <h2 className="text-xl font-semibold text-gray-900">
                                    Pesanan dibuat pada {formatDate(order?.created_at)}
                                  </h2>
                                  <p className="mt-1 text-sm text-gray-600">{orderStatus.description}</p>
                                </div>
                              </div>

                              <div className="rounded-2xl bg-gray-50 px-4 py-3 md:min-w-56">
                                <p className="text-sm text-gray-500">Total pembayaran</p>
                                <p className="mt-1 text-xl font-bold text-green-600">
                                  {formatCurrency(order.currency, order.total_price)}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {totalProductQuantity} item dalam pesanan ini
                                </p>
                                {order.status === 'pending' ? (
                                  <div className="mt-3 flex gap-2">
                                    <button
                                      onClick={() => openCancelModal(order.id)}
                                      className="cursor-pointer px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                    >
                                      Batalkan
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal(order.id)}
                                      className="cursor-pointer px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mt-3 flex gap-2">
                                    <button
                                      onClick={() => openDeleteModal(order.id)}
                                      className="cursor-pointer px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

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
                                    <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase">
                                      {product.category}
                                    </p>
                                    <h3 className="text-base font-semibold text-gray-900">
                                      {product.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                      <span>Varian {product.variant}</span>
                                      <span>Qty {product.quantity}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2 md:text-right">
                                    <p className="text-sm text-gray-500">Harga produk</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                      {formatCurrency(product.price.currency, product.price)}
                                    </p>
                                    <Link
                                      href={`/product/${product.product_id}/${createSlug(product.product_title)}`}
                                      className="inline-flex text-sm font-medium text-green-600 transition-colors hover:text-green-700"
                                    >
                                      Lihat produk
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid gap-4 border-t border-gray-100 pt-5 md:grid-cols-3">
                            <div className="rounded-2xl bg-gray-50 p-4">
                              <p className="text-sm text-gray-500">Alamat pengiriman</p>
                              <p className="mt-2 text-sm leading-6 text-gray-800">{order.shipping_address}</p>
                            </div>
                            <div className="rounded-2xl bg-gray-50 p-4">
                              <p className="text-sm text-gray-500">Pembayaran & pengiriman</p>
                              <p className="mt-2 text-sm font-medium text-gray-800">
                                {formatPaymentMethod(order.paymentMethod)}
                              </p>
                              <p className="mt-1 text-sm text-gray-600">
                                {formatDeliveryMethod(order.deliveryMethod)}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-gray-50 p-4">
                              <p className="text-sm text-gray-500">Catatan pembeli</p>
                              <p className="mt-2 text-sm leading-6 text-gray-800">
                                {order.notes?.trim() || 'Tidak ada catatan tambahan untuk pesanan ini.'}
                              </p>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Select All */}
                {orders.length > 0 && (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === orders.length && orders.length > 0}
                      onChange={() => {
                        if (selectedOrders.size === orders.length) {
                          deselectAllOrders()
                        } else {
                          selectAllOrders()
                        }
                      }}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Pilih Semua ({orders.length})</span>
                  </div>
                )}

                {sortedOrders.map(order => {
                    const orderStatus = statusConfig[order.status as OrderStatus] ?? statusConfig.pending
                    const totalProductQuantity = order?.products?.reduce(
                      (sum:number, product:OrderProduct) => sum + product.quantity,
                      0
                    )

                    return (
                      <article
                        key={order.id}
                        className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm md:p-6"
                      >
                        {/* Order Header with Checkbox */}
                        <div className="flex items-start gap-3 mb-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-4 h-4 mt-1 text-green-600 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
                                    orderStatus.className
                                  )}
                                >
                                  {orderStatus.label}
                                </span>
                                <span className="text-sm text-gray-500">
                                  #{String(order.id).slice(-8)}
                                </span>
                              </div>
                              <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                  Pesanan dibuat pada {formatDate(order?.created_at)}
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">{orderStatus.description}</p>
                              </div>
                            </div>

                            <div className="rounded-2xl bg-gray-50 px-4 py-3 md:min-w-56">
                              <p className="text-sm text-gray-500">Total pembayaran</p>
                              <p className="mt-1 text-xl font-bold text-green-600">
                                {formatCurrency(order.currency, order.total_price)}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {totalProductQuantity} item dalam pesanan ini
                              </p>
                              {order.status === 'pending' ? (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={() => openCancelModal(order.id)}
                                    className="cursor-pointer px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                  >
                                    Batalkan
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(order.id)}
                                    className="cursor-pointer px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              ) : (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={() => openDeleteModal(order.id)}
                                    className="cursor-pointer px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </div>
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
                                  <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase">
                                    {product.category}
                                  </p>
                                  <h3 className="text-base font-semibold text-gray-900">
                                    {product.title}
                                  </h3>
                                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                    <span>Varian {product.variant}</span>
                                    <span>Qty {product.quantity}</span>
                                  </div>
                                </div>

                                <div className="space-y-2 md:text-right">
                                  <p className="text-sm text-gray-500">Harga produk</p>
                                  <p className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(product.price.currency, product.price)}
                                  </p>
                                  <Link
                                    href={`/product/${product.product_id}/${createSlug(product.product_title)}`}
                                    className="inline-flex text-sm font-medium text-green-600 transition-colors hover:text-green-700"
                                  >
                                    Lihat produk
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-4 border-t border-gray-100 pt-5 md:grid-cols-3">
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">Alamat pengiriman</p>
                            <p className="mt-2 text-sm leading-6 text-gray-800">{order.shipping_address}</p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">Pembayaran & pengiriman</p>
                            <p className="mt-2 text-sm font-medium text-gray-800">
                              {formatPaymentMethod(order.paymentMethod)}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {formatDeliveryMethod(order.deliveryMethod)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">Catatan pembeli</p>
                            <p className="mt-2 text-sm leading-6 text-gray-800">
                              {order.notes?.trim() || 'Tidak ada catatan tambahan untuk pesanan ini.'}
                            </p>
                          </div>
                        </div>
                      </article>
                    )
                  })}
              </div>
            )}

            <aside className="h-fit rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm xl:sticky xl:top-28">
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Informasi Order</h2>

                <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pesanan terbaru</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(sortedOrders[0]?.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status dominan</span>
                    <span className="font-medium text-amber-600">
                      {statusConfig[dominantStatus as OrderStatus].label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Metode favorit</span>
                    <span className="font-medium text-gray-900">
                      {formatPaymentMethod(favoritePaymentMethod)}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                  <h3 className="font-semibold text-green-800">Butuh checkout lagi?</h3>
                  <p className="mt-2 text-sm leading-6 text-green-700">
                    Kamu bisa kembali ke cart untuk melanjutkan proses order atau cari produk baru
                    untuk ditambahkan ke belanjaanmu.
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      onClick={proceedToPayment}
                      disabled={selectedOrders.size === 0}
                      className={cn(
                        "cursor-pointer inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700",
                        selectedOrders.size === 0 && "cursor-not-allowed bg-green-300 hover:bg-green-300"
                      )}
                    >
                      Lanjut Pembayaran ({selectedOrders.size})
                    </button>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center rounded-lg border border-green-500 px-4 py-2 font-medium text-green-700 transition-colors hover:bg-green-100"
                    >
                      Cari Produk Lain
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </ContentContainer>

      {/* Confirmation Modals */}
      <CancelOrderModal
        isOpen={modalType === 'cancel'}
        onClose={closeModal}
        onConfirm={executeBulkCancel}
        isProcessing={isProcessing}
        isBulk={false}
      />
      <CancelOrderModal
        isOpen={modalType === 'bulk-cancel'}
        onClose={closeModal}
        onConfirm={executeBulkCancel}
        isProcessing={isProcessing}
        isBulk={true}
        selectedCount={selectedOrders.size}
      />
      <DeleteOrderModal
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        onConfirm={executeBulkDelete}
        isProcessing={isProcessing}
        isBulk={false}
      />
      <DeleteOrderModal
        isOpen={modalType === 'bulk-delete'}
        onClose={closeModal}
        onConfirm={executeBulkDelete}
        isProcessing={isProcessing}
        isBulk={true}
        selectedCount={selectedOrders.size}
      />
    </main>
  )
}

export default OrderPage
