'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FullHeartIcon, TrashIcon } from '@/components/icon'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { useWishlistStore } from '@/lib/zustand/wishlistStore'
import { createSlug } from '@/lib/utils'

const WishlistPage = () => {
  const user = useAuthStore(state => state.user)
  const setAlert = useUtilityStore(state => state.setAlert)
  const wishlist = useWishlistStore(state => state.wishlist)
  const products = user?.id
    ? wishlist.filter(item => item.userId === user.id)
    : []
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist)
  const clearAllWishlist = useWishlistStore(state => state.clearAllWishlist)
  const isHydrating = useWishlistStore(state => state.isHydrating)

  const handleRemove = async (productId: string) => {
    if (!user?.id) return

    try {
      await removeFromWishlist({ userId: user.id, productId })
      setAlert({ label: 'Produk dihapus dari wishlist.', type: 'success' })
    } catch (error: unknown) {
      setAlert({ label: error instanceof Error ? error.message : 'Gagal menghapus wishlist.', type: 'error' })
    }
  }

  const handleClear = async () => {
    if (!user?.id) return

    try {
      await clearAllWishlist(user.id)
      setAlert({ label: 'Wishlist berhasil dikosongkan.', type: 'success' })
    } catch (error: unknown) {
      setAlert({ label: error instanceof Error ? error.message : 'Gagal mengosongkan wishlist.', type: 'error' })
    }
  }

  if (!user?.id) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Wishlist membutuhkan login</h1>
            <p className="mt-3 text-gray-600">Masuk dulu agar produk favoritmu bisa disimpan di wishlist.</p>
            <Link href="/auth/login" className="mt-6 inline-flex rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700">
              Masuk Sekarang
            </Link>
          </div>
        </ContentContainer>
      </main>
    )
  }

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="space-y-8">
          <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
            <div className="relative overflow-hidden bg-linear-to-r from-rose-500 via-orange-400 to-amber-300 px-6 py-8 text-white md:px-8">
              <div className="absolute inset-y-0 right-0 w-1/3 opacity-20">
                <Image src="/image/wishlist-bg.png" alt="Wishlist background" fill sizes="33vw" className="object-cover" />
              </div>
              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                    Wishlist Pengguna
                  </span>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold md:text-4xl">Simpan produk favoritmu di satu tempat</h1>
                    <p className="max-w-2xl text-sm leading-6 text-white/90 md:text-base">
                      Barang impian jangan sampai hilang. Kumpulkan semua yang kamu suka di sini dan bawa pulang saat waktunya tepat!
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/product/all" className="inline-flex rounded-lg bg-white px-4 py-2 font-medium text-orange-700 transition-colors hover:bg-orange-50">
                    Jelajahi Produk
                  </Link>
                  {products.length > 0 && (
                    <button onClick={handleClear} className="rounded-lg border border-white/40 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10">
                      Kosongkan Wishlist
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {isHydrating ? (
            <section className="rounded-[28px] border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-rose-500" />
              <p className="mt-5 text-gray-600">Menyinkronkan wishlist dari Supabase...</p>
            </section>
          ) : products.length === 0 ? (
            <section className="rounded-[28px] border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <FullHeartIcon size={28} color="#f43f5e" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-gray-900">Wishlist masih kosong</h2>
              <p className="mx-auto mt-3 max-w-xl text-gray-600">
                Tambahkan produk dari halaman katalog atau detail produk, lalu semua favoritmu akan muncul di sini.
              </p>
              <Link href="/product/all" className="mt-6 inline-flex rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700">
                Cari Produk
              </Link>
            </section>
          ) : (
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.flatMap(product => {
                return product?.products?.map(item => {
                  const price = item?.price?.withDiscount && item.price.withDiscount > 0
                  ? item.price.withDiscount
                  : item?.price?.withoutDiscount

                  return (
                    <article key={item.product_id} className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="relative mb-5 h-60 overflow-hidden rounded-2xl bg-gray-100">
                        <Image
                          src={item?.images?.['800x900']?.[0] ?? '/image/1-emptystate.png'}
                          alt={item.title}
                          fill
                          sizes="(max-width: 1280px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">{item.category ?? 'Produk Favorit'}</p>
                          <h2 className="mt-1 line-clamp-2 text-xl font-bold text-gray-900">{item.title}</h2>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-green-700">
                            {item?.price?.currency}{price}
                          </p>
                          <p className="text-sm text-gray-500">{item?.performance?.sales ?? 0} terjual</p>
                        </div>
                        <div className="flex gap-3">
                          <Link
                            href={`/product/${item.product_id}/${createSlug(item.title)}`}
                            className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-green-700"
                          >
                            Lihat Produk
                          </Link>
                          <button
                            onClick={() => handleRemove(item.product_id)}
                            className="flex items-center justify-center rounded-lg border border-gray-200 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            aria-label={`Hapus ${item.title} dari wishlist`}
                          >
                            <TrashIcon size={16} color="#374151" />
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })
              })}
            </section>
          )}
        </div>
      </ContentContainer>
    </main>
  )
}

export default WishlistPage
