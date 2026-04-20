'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import type { DigitalTransaction } from '@/lib/db/digitalTransactions'

type FilterCategory = 'all' | 'topup' | 'tagihan'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))

const getCategoryBadgeColor = (category: 'topup' | 'tagihan') => {
  if (category === 'topup') {
    return 'bg-blue-50 text-blue-700'
  }
  return 'bg-purple-50 text-purple-700'
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-50 text-green-700'
    case 'pending':
      return 'bg-yellow-50 text-yellow-700'
    case 'failed':
      return 'bg-red-50 text-red-700'
    case 'cancelled':
      return 'bg-gray-50 text-gray-700'
    default:
      return 'bg-gray-50 text-gray-700'
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    completed: 'Berhasil',
    pending: 'Menunggu',
    failed: 'Gagal',
    cancelled: 'Dibatalkan',
  }
  return labels[status] || status
}

const DigitalTransactionHistory = () => {
  const user = useAuthStore((state) => state.user)
  const setAlert = useUtilityStore((state) => state.setAlert)
  
  const [transactions, setTransactions] = useState<DigitalTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')
  const [stats, setStats] = useState({
    totalSpent: 0,
    topupCount: 0,
    tagihanCount: 0,
  })

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!user?.id) {
          setTransactions([])
          setLoading(false)
          return
        }

        const params = new URLSearchParams()
        if (activeFilter !== 'all') {
          params.append('category', activeFilter)
        }

        const response = await fetch(
          `/api/digital-transactions?${params.toString()}`,
          { cache: 'no-store' }
        )

        if (!response.ok) {
          throw new Error('Gagal memuat history transaksi')
        }

        const payload = await response.json()
        const data = payload.data ?? []

        setTransactions(data)

        // Calculate stats
        const totalSpent = data.reduce((sum: number, tx: DigitalTransaction) => sum + tx.price, 0)
        const topupCount = data.filter((tx: DigitalTransaction) => tx.category === 'topup').length
        const tagihanCount = data.filter((tx: DigitalTransaction) => tx.category === 'tagihan').length

        setStats({
          totalSpent,
          topupCount,
          tagihanCount,
        })
      } catch (error: any) {
        setAlert({
          label: error?.message || 'Gagal memuat history transaksi',
          type: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [user?.id, activeFilter, setAlert])

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions
    return transactions.filter((tx) => tx.category === activeFilter)
  }, [transactions, activeFilter])

  if (!user) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Silakan login terlebih dahulu</h1>
            <p className="mt-3 text-gray-600">Anda perlu login untuk melihat history transaksi digital services.</p>
            <Link href="/auth/login" className="mt-6 inline-flex rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700">
              Masuk ke Akun
            </Link>
          </div>
        </ContentContainer>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
              <p className="mt-4 text-gray-600">Memuat history transaksi...</p>
            </div>
          </div>
        </ContentContainer>
      </main>
    )
  }

  return (
    <main className="w-full pt-10 md:pt-20 pb-20">
      <ContentContainer>
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">History Pembayaran Digital</h1>
                <p className="mt-2 text-gray-600">Riwayat lengkap semua transaksi top up dan tagihan Anda</p>
              </div>
              <Link
                href="/"
                className="inline-flex rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700"
              >
                Lanjut Top Up / Bayar Tagihan
              </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-4">
                <p className="text-sm font-semibold text-green-700">Total Pengeluaran</p>
                <p className="mt-2 text-2xl font-bold text-green-900">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                <p className="text-sm font-semibold text-blue-700">Total Top Up</p>
                <p className="mt-2 text-2xl font-bold text-blue-900">{stats.topupCount}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                <p className="text-sm font-semibold text-purple-700">Total Pembayaran Tagihan</p>
                <p className="mt-2 text-2xl font-bold text-purple-900">{stats.tagihanCount}</p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-3 rounded-2xl bg-gray-100 p-2">
            {(['all', 'topup', 'tagihan'] as const).map((category) => {
              const labels: Record<FilterCategory, string> = {
                all: 'Semua',
                topup: 'Top Up',
                tagihan: 'Tagihan',
              }

              const isActive = activeFilter === category

              return (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`flex-1 rounded-2xl px-4 py-2 font-semibold transition-colors ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {labels[category]}
                </button>
              )
            })}
          </div>

          {/* Transactions List */}
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Left Content */}
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {transaction.service_label}
                            </h3>
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getCategoryBadgeColor(
                                transaction.category
                              )}`}
                            >
                              {transaction.category === 'topup' ? 'Top Up' : 'Tagihan'}
                            </span>
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(
                                transaction.status
                              )}`}
                            >
                              {getStatusLabel(transaction.status)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(transaction.price)}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-auto">
                        {Object.entries(transaction.field_values).map(([key, value]) => (
                          <div key={key} className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-gray-500">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">{value}</p>
                          </div>
                        ))}
                        {transaction.nominal_label && (
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-gray-500">
                              Nominal
                            </p>
                            <p className="mt-1 font-semibold text-gray-900">
                              {transaction.nominal_label}
                            </p>
                          </div>
                        )}
                        {transaction.payment_method && (
                          <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-gray-500">
                              Metode Pembayaran
                            </p>
                            <p className="mt-1 font-semibold text-gray-900 capitalize">
                              {transaction.payment_method}
                            </p>
                          </div>
                        )}
                      </div>

                      {transaction.transaction_notes && (
                        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                          <p className="text-sm text-yellow-800">{transaction.transaction_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-lg text-gray-600">
                {activeFilter === 'all'
                  ? 'Belum ada history transaksi. Mulai dengan melakukan top up atau pembayaran tagihan sekarang!'
                  : `Belum ada transaksi ${activeFilter === 'topup' ? 'top up' : 'pembayaran tagihan'}.`}
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700"
              >
                Mulai Top Up / Bayar Tagihan
              </Link>
            </div>
          )}
        </div>
      </ContentContainer>
    </main>
  )
}

export default DigitalTransactionHistory
