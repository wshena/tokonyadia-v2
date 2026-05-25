'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { cn } from '@/lib/utils'
import { useUtilityStore } from '@/lib/zustand/utilityStore'

type OrderItem = {
  id: string
  product_title: string
  quantity: number
}

type Order = {
  id: string
  status: 'paid' | 'shipped' | 'delivered' | 'cancelled'
  total_price: number
  currency: string
  shipping_address: string
  payment_method: string
  delivery_method: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

const SHIPPING_TOTAL_MS = 5 * 60 * 1000
const SHIPPED_THRESHOLD_MS = 2 * 60 * 1000

const formatCurrency = (currency: string, amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency || 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))

const formatDuration = (durationMs: number) => {
  const minutes = Math.max(0, Math.floor(durationMs / 60000))
  const seconds = Math.max(0, Math.floor((durationMs % 60000) / 1000))
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const getHashSeed = (value: string) =>
  value.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0)

const TrackingMap = ({ address, progress }: { address: string; progress: number }) => {
  const seed = getHashSeed(address)
  const destinationX = 70 + (seed % 16)
  const destinationY = 24 + (seed % 30)
  const courierX = 18 + (destinationX - 18) * progress
  const courierY = 72 + (destinationY - 72) * progress

  return (
    <div className="relative h-52 overflow-hidden rounded-3xl border border-green-100 bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_45%,#f8fafc_100%)]">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,#16a34a_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="absolute left-[18%] top-[72%] rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
        Gudang
      </div>
      <div className="absolute h-1 rounded-full bg-green-300" style={{ left: '22%', top: '74%', width: `${Math.max(18, destinationX - 18)}%` }} />
      <div
        className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-green-600 text-lg shadow-lg transition-all duration-1000"
        style={{ left: `${courierX}%`, top: `${courierY}%` }}
      >
        🚚
      </div>
      <div
        className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-lg shadow-lg"
        style={{ left: `${destinationX}%`, top: `${destinationY}%` }}
      >
        📍
      </div>
      <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-3 text-sm text-gray-700 backdrop-blur-sm">
        <p className="font-semibold text-gray-900">Tujuan pengiriman</p>
        <p className="line-clamp-2">{address}</p>
      </div>
    </div>
  )
}

const ShippingPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAlert = useUtilityStore(state => state.setAlert)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(Date.now())
  const pendingUpdateRef = useRef<Set<string>>(new Set())
  const orderIds = useMemo(
    () => searchParams.get('orders')?.split(',').map(id => id.trim()).filter(Boolean) ?? [],
    [searchParams]
  )

  useEffect(() => {
    const fetchOrders = async () => {
      if (orderIds.length === 0) {
        router.replace('/order')
        return
      }

      try {
        const response = await fetch(
          `/api/orders?ids=${encodeURIComponent(orderIds.join(','))}&statuses=paid,shipped,delivered`,
          { cache: 'no-store' }
        )
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload?.message ?? 'Gagal memuat status pengiriman')
        }

        setOrders(payload.data ?? [])
      } catch (error: unknown) {
        setAlert({ label: error instanceof Error ? error.message : 'Gagal memuat status pengiriman', type: 'error' })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
    const poll = setInterval(fetchOrders, 15000)

    return () => clearInterval(poll)
  }, [orderIds, router, setAlert])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const maybePromoteOrders = async () => {
      for (const order of orders) {
        const baseTime = new Date(order.updated_at || order.created_at).getTime()
        const elapsed = now - baseTime

        let nextStatus: Order['status'] | null = null
        if (order.status === 'paid' && elapsed >= SHIPPED_THRESHOLD_MS) {
          nextStatus = 'shipped'
        }
        if ((order.status === 'paid' || order.status === 'shipped') && elapsed >= SHIPPING_TOTAL_MS) {
          nextStatus = 'delivered'
        }

        if (!nextStatus || pendingUpdateRef.current.has(order.id)) continue

        pendingUpdateRef.current.add(order.id)

        try {
          const response = await fetch(`/api/orders/${order.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: nextStatus }),
          })

          if (!response.ok) {
            const payload = await response.json().catch(() => null)
            throw new Error(payload?.message ?? `Gagal memperbarui order ${order.id}`)
          }

          setOrders(current =>
            current.map(item => (
              item.id === order.id
                ? { ...item, status: nextStatus as Order['status'], updated_at: new Date().toISOString() }
                : item
            ))
          )

          setAlert({
            label: nextStatus === 'shipped'
              ? `Order #${String(order.id).slice(-8)} sekarang sedang dikirim.`
              : `Order #${String(order.id).slice(-8)} telah sampai di alamat tujuan.`,
            type: 'success',
          })
        } catch (error: unknown) {
          setAlert({ label: error instanceof Error ? error.message : 'Gagal memperbarui status pengiriman', type: 'error' })
        } finally {
          pendingUpdateRef.current.delete(order.id)
        }
      }
    }

    if (orders.length > 0) {
      maybePromoteOrders()
    }
  }, [now, orders, setAlert])

  const enrichedOrders = useMemo(() => {
    return orders.map(order => {
      const baseTime = new Date(order.updated_at || order.created_at).getTime()
      const elapsed = Math.max(0, now - baseTime)
      const progress = order.status === 'delivered' ? 1 : Math.min(elapsed / SHIPPING_TOTAL_MS, 1)
      const shippedAt = new Date(baseTime + SHIPPED_THRESHOLD_MS).toISOString()
      const deliveredAt = new Date(baseTime + SHIPPING_TOTAL_MS).toISOString()

      return {
        ...order,
        progress,
        remainingMs: Math.max(0, SHIPPING_TOTAL_MS - elapsed),
        shippedAt,
        deliveredAt,
      }
    })
  }, [now, orders])

  if (loading) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
              <p className="mt-4 text-gray-600">Memuat simulasi pengiriman...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Tidak ada order yang sedang dikirim</h1>
            <p className="mt-3 text-gray-600">Lakukan pembayaran lebih dulu agar status pengiriman bisa ditampilkan.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Status Pengiriman</h1>
            <p className="mt-2 text-gray-600">
              Terima kasih telah berbelanja bersama kami. Kami tahu Anda sudah tidak sabar menunggu pesanan tiba. Silakan gunakan fitur pelacak di bawah ini untuk melihat status perjalanan paket Anda mulai dari gudang kami hingga ke tangan Anda.
            </p>
          </div>

          <div className="space-y-6">
            {enrichedOrders.map(order => {
              const steps = [
                { key: 'paid', label: 'Pembayaran terverifikasi', reached: true },
                { key: 'shipped', label: 'Kurir berangkat', reached: ['shipped', 'delivered'].includes(order.status) },
                { key: 'delivered', label: 'Sampai di alamat', reached: order.status === 'delivered' },
              ]

              return (
                <article key={order.id} className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Order #{String(order.id).slice(-8)}</h2>
                      <p className="mt-1 text-sm text-gray-500">Terakhir diperbarui {formatDateTime(order.updated_at || order.created_at)}</p>
                    </div>

                    <div className={cn(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
                      order.status === 'delivered' ? 'bg-green-50 text-green-700' :
                      order.status === 'shipped' ? 'bg-sky-50 text-sky-700' :
                      'bg-blue-50 text-blue-700'
                    )}>
                      <span>{order.status === 'delivered' ? '✅' : order.status === 'shipped' ? '🚚' : '📦'}</span>
                      <span>
                        {order.status === 'delivered'
                          ? 'Pesanan sudah diterima'
                          : order.status === 'shipped'
                            ? 'Pesanan sedang dikirim'
                            : 'Pesanan sedang disiapkan'}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-5">
                      <TrackingMap address={order.shipping_address} progress={order.progress} />

                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="font-semibold text-gray-900">Progres pengiriman</p>
                          <p className="text-sm text-gray-500">{Math.round(order.progress * 100)}%</p>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-linear-to-r from-green-500 to-emerald-400 transition-all duration-1000" style={{ width: `${Math.max(8, order.progress * 100)}%` }} />
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          {steps.map(step => (
                            <div key={step.key} className={cn(
                              'rounded-2xl border p-3 text-sm',
                              step.reached ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 bg-white text-gray-500'
                            )}>
                              <p className="font-semibold">{step.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-gray-100 p-4">
                          <p className="text-sm font-medium text-gray-500">Alamat tujuan</p>
                          <p className="mt-2 text-sm leading-6 text-gray-800">{order.shipping_address}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 p-4">
                          <p className="text-sm font-medium text-gray-500">Estimasi simulasi</p>
                          {order.status === 'delivered' ? (
                            <p className="mt-2 text-sm font-semibold text-green-700">Pesanan telah sampai di alamat tujuan.</p>
                          ) : (
                            <div className="mt-2 space-y-1 text-sm text-gray-700">
                              <p>Kurir berangkat: {formatDateTime(order.shippedAt)}</p>
                              <p>Paket sampai: {formatDateTime(order.deliveredAt)}</p>
                              <p className="font-semibold text-green-700">Sisa waktu: {formatDuration(order.remainingMs)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <aside className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Ringkasan order</p>
                        <p className="mt-2 text-lg font-bold text-gray-900">{formatCurrency(order.currency, order.total_price)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Metode pengiriman</p>
                        <p className="mt-1 text-sm text-gray-800">{order.delivery_method}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Metode pembayaran</p>
                        <p className="mt-1 text-sm text-gray-800">{order.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Produk</p>
                        <div className="mt-2 space-y-2">
                          {(order.order_items ?? []).map(item => (
                            <div key={item.id} className="rounded-xl border border-white bg-white p-3 text-sm text-gray-700">
                              <p className="font-semibold text-gray-900">{item.product_title}</p>
                              <p>Qty {item.quantity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </aside>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="text-center">
            <Link href="/order" className="inline-flex rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700">
              Kembali ke Daftar Order
            </Link>
          </div>
        </div>
      </ContentContainer>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShippingPage />
    </Suspense>
  )
}
