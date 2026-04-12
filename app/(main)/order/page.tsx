import Image from 'next/image'
import Link from 'next/link'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import ordersData from '@/lib/data/orders.json'
import { cn, createSlug } from '@/lib/utils'

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
  createdAt: string
  totalAmount: number
  currency: string
  address: string
  paymentMethod: string
  deliveryMethod: string
  notes: string
}

const orders = ordersData as Order[]

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

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
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

const totalOrders = orders.length
const totalItems = orders.reduce((sum, order) => {
  return sum + order.products.reduce((itemSum, product) => itemSum + product.quantity, 0)
}, 0)
const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0)
const pendingOrders = orders.filter(order => order.status === 'pending').length
const sortedOrders = orders
  .slice()
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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
            <div className="space-y-5">
              {sortedOrders.map(order => {
                  const orderStatus = statusConfig[order.status] ?? statusConfig.pending
                  const totalProductQuantity = order.products.reduce(
                    (sum, product) => sum + product.quantity,
                    0
                  )

                  return (
                    <article
                      key={order.id}
                      className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm md:p-6"
                    >
                      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-start md:justify-between">
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
                              Pesanan dibuat pada {formatDate(order.createdAt)}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">{orderStatus.description}</p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-gray-50 px-4 py-3 md:min-w-56">
                          <p className="text-sm text-gray-500">Total pembayaran</p>
                          <p className="mt-1 text-xl font-bold text-green-600">
                            {formatCurrency(order.currency, order.totalAmount)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {totalProductQuantity} item dalam pesanan ini
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 py-5">
                        {order.products.map(product => (
                          <div
                            key={`${order.id}-${product.productData.product_id}-${product.variant}`}
                            className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 md:flex-row"
                          >
                            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gray-100 md:w-28">
                              <Image
                                src={product.productData.images['800x900']?.[0]}
                                alt={product.productData.title}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-1">
                                <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase">
                                  {product.productData.category}
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">
                                  {product.productData.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                  <span>Varian {product.variant}</span>
                                  <span>Qty {product.quantity}</span>
                                </div>
                              </div>

                              <div className="space-y-2 md:text-right">
                                <p className="text-sm text-gray-500">Harga produk</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(product.productData.price.currency, product.price)}
                                </p>
                                <Link
                                  href={`/product/${product.productData.product_id}/${createSlug(product.productData.title)}`}
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
                          <p className="mt-2 text-sm leading-6 text-gray-800">{order.address}</p>
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

            <aside className="h-fit rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm xl:sticky xl:top-28">
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Informasi Order</h2>

                <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pesanan terbaru</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(sortedOrders[0].createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status dominan</span>
                    <span className="font-medium text-amber-600">
                      {statusConfig[dominantStatus].label}
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
                    <Link
                      href="/cart"
                      className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
                    >
                      Lanjut Checkout
                    </Link>
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
    </main>
  )
}

export default OrderPage
