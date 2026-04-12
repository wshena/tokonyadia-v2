'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { useAuthStore } from '@/lib/zustand/authStore'

const formatDate = (date: string | undefined) => {
  if (!date) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

const UserSettingsPage = () => {
  const user = useAuthStore(state => state.user)

  const profile = useMemo(() => {
    const metadata = user?.user_metadata ?? {}
    const fullName = [metadata.first_name, metadata.last_name].filter(Boolean).join(' ')

    return {
      fullName: fullName || metadata.username || 'Pengguna Tokonyadia',
      username: metadata.username || '-',
      firstName: metadata.first_name || '-',
      lastName: metadata.last_name || '-',
      gender: metadata.sex || '-',
      phoneNumber: metadata.phone_number || '-',
      address: metadata.address || 'Belum menambahkan alamat utama.',
      birthDate: metadata.birth_date || '',
      email: user?.email || '-',
      createdAt: user?.created_at || '',
    }
  }, [user])

  return (
    <main className="w-full pt-10 md:pt-20">
      <ContentContainer>
        <div className="space-y-8">
          <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
            <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-700 px-6 py-8 text-white md:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                Account Center
              </p>
              <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h1 className="text-3xl font-bold md:text-4xl">Pengaturan akun belanja kamu</h1>
                  <p className="mt-3 text-sm leading-6 text-slate-200 md:text-base">
                    Kelola data profil, kontak utama, dan informasi penting lainnya agar proses
                    checkout, pengiriman, dan layanan purna jual berjalan lebih lancar.
                  </p>
                </div>

                <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                  <p className="text-sm text-slate-200">Akun aktif</p>
                  <p className="mt-1 text-xl font-semibold">{profile.fullName}</p>
                  <p className="mt-1 text-sm text-emerald-100">{profile.email}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Email login</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{profile.email}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">No. handphone</p>
                <p className="mt-2 text-base font-semibold text-gray-900">{profile.phoneNumber}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Tanggal bergabung</p>
                <p className="mt-2 text-base font-semibold text-gray-900">
                  {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <article className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Profil utama</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Informasi ini membantu toko mengenali akunmu saat checkout dan pengiriman.
                    </p>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    Data akun
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Nama lengkap</p>
                    <p className="mt-2 font-semibold text-gray-900">{profile.fullName}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="mt-2 font-semibold text-gray-900">{profile.username}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Nama depan</p>
                    <p className="mt-2 font-semibold text-gray-900">{profile.firstName}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Nama belakang</p>
                    <p className="mt-2 font-semibold text-gray-900">{profile.lastName}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Jenis kelamin</p>
                    <p className="mt-2 font-semibold capitalize text-gray-900">{profile.gender}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Tanggal lahir</p>
                    <p className="mt-2 font-semibold text-gray-900">
                      {formatDate(profile.birthDate)}
                    </p>
                  </div>
                </div>

                <div className="w-full flex items-center justify-end pt-6">
                  <button className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 transition-colors hover:bg-red-100">
                    Ubah
                  </button>
                </div>
              </article>

              <article className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-gray-900">Kontak & alamat</h2>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Gunakan data yang akurat agar kurir dan tim support lebih mudah membantu.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="mt-2 font-semibold text-gray-900">{profile.email}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Nomor handphone</p>
                    <p className="mt-2 font-semibold text-gray-900">{profile.phoneNumber}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Alamat utama</p>
                    <p className="mt-2 leading-7 text-gray-900">{profile.address}</p>
                  </div>
                </div>
              </article>

              <article className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-gray-900">Preferensi belanja</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-700">Notifikasi pesanan</p>
                    <p className="mt-2 font-semibold text-emerald-900">Aktif melalui email akun</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Metode kontak utama</p>
                    <p className="mt-2 font-semibold text-slate-900">Email dan nomor handphone</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-sm text-amber-700">Status akun</p>
                    <p className="mt-2 font-semibold text-amber-900">Siap digunakan untuk checkout</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Keamanan akun</p>
                    <p className="mt-2 font-semibold text-gray-900">Dilindungi autentikasi</p>
                  </div>
                </div>
              </article>
            </div>

            <aside className="h-fit rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm xl:sticky xl:top-28">
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Aksi cepat</h2>

                <div className="space-y-3">
                  <Link
                    href="/order"
                    className="block rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 transition-colors hover:border-green-200 hover:bg-green-50"
                  >
                    <p className="font-semibold text-gray-900">Lihat pesanan saya</p>
                    <p className="mt-1 text-sm text-gray-500">Pantau status order dan riwayat transaksi.</p>
                  </Link>

                  <Link
                    href="/cart"
                    className="block rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 transition-colors hover:border-green-200 hover:bg-green-50"
                  >
                    <p className="font-semibold text-gray-900">Kembali ke cart</p>
                    <p className="mt-1 text-sm text-gray-500">Lanjutkan checkout dari produk yang tersimpan.</p>
                  </Link>

                  <Link
                    href="/product/all"
                    className="block rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 transition-colors hover:border-green-200 hover:bg-green-50"
                  >
                    <p className="font-semibold text-gray-900">Cari produk lain</p>
                    <p className="mt-1 text-sm text-gray-500">Temukan produk baru untuk belanja berikutnya.</p>
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </ContentContainer>
    </main>
  )
}

export default UserSettingsPage
