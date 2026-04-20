'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ContentContainer from '@/components/ui/layouts/ContentContainer'
import PaymentConfirmationModal from '@/components/ui/modals/PaymentConfirmationModal'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import { useAuthStore } from '@/lib/zustand/authStore'

type DigitalPaymentPayload = {
  serviceId: string
  category: 'topup' | 'tagihan'
  serviceLabel: string
  actionLabel: 'Beli' | 'Bayar'
  description: string
  summaryLabel: string
  price: number
  nominalLabel: string
  fieldValues: Record<string, string>
}

const paymentMethods = [
  { value: 'brivia', label: 'BRI Virtual Account', description: 'Verifikasi otomatis dalam beberapa menit.' },
  { value: 'bcava', label: 'BCA Virtual Account', description: 'Cocok untuk pembayaran via mobile banking BCA.' },
  { value: 'mandiriva', label: 'Mandiri Virtual Account', description: 'Pembayaran aman dengan nomor VA unik.' },
  { value: 'bni', label: 'BNI Virtual Account', description: 'Praktis untuk pengguna BNI Mobile Banking.' },
  { value: 'qris', label: 'QRIS', description: 'Bayar cepat via aplikasi e-wallet atau mobile banking.' },
  { value: 'gopay', label: 'GoPay', description: 'Pembayaran instan langsung dari saldo GoPay.' },
  { value: 'shopeepay', label: 'ShopeePay', description: 'Mudah untuk pengguna ShopeePay aktif.' },
  { value: 'bank_transfer', label: 'Transfer Bank', description: 'Gunakan transfer manual ke rekening tujuan.' },
]

const formatCurrency = (currency: string, amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const DigitalPaymentPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAlert = useUtilityStore((state) => state.setAlert)
  const user = useAuthStore((state) => state.user)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('qris')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const payload = useMemo<DigitalPaymentPayload | null>(() => {
    const rawData = searchParams.get('data')
    if (!rawData) return null

    try {
      return JSON.parse(rawData) as DigitalPaymentPayload
    } catch {
      return null
    }
  }, [searchParams])

  const selectedMethod = paymentMethods.find((method) => method.value === selectedPaymentMethod)
  const customerIdentifier = payload
    ? Object.values(payload.fieldValues)[Object.values(payload.fieldValues).length - 1] ?? '-'
    : '-'

  const confirmPayment = async () => {
    if (!payload) return

    setIsProcessing(true)
    setShowPaymentModal(false)

    try {
      // Simulate payment processing
      await new Promise((resolve) => window.setTimeout(resolve, 1200))

      // Save transaction to Supabase only if user is authenticated
      if (user?.id) {
        try {
          const response = await fetch('/api/digital-transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              serviceId: payload.serviceId,
              category: payload.category,
              serviceLabel: payload.serviceLabel,
              price: payload.price,
              nominalLabel: payload.nominalLabel,
              paymentMethod: selectedPaymentMethod,
              fieldValues: payload.fieldValues,
              status: 'completed',
            }),
          })

          if (!response.ok) {
            console.warn('Failed to save transaction to database')
          }
        } catch (error) {
          console.warn('Error saving transaction:', error)
          // Don't block user experience if database save fails
        }
      }

      setAlert({
        label: `${payload.serviceLabel} berhasil diproses dengan metode ${selectedMethod?.label ?? 'pembayaran terpilih'}.`,
        type: 'success',
      })
      router.push('/')
    } catch (error: any) {
      setAlert({
        label: error?.message ?? 'Terjadi kesalahan saat memproses pembayaran',
        type: 'error',
      })
      setIsProcessing(false)
    }
  }

  if (!payload) {
    return (
      <main className="w-full pt-10 md:pt-20">
        <ContentContainer>
          <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Data pembayaran digital tidak ditemukan</h1>
            <p className="mt-3 text-gray-600">Silakan pilih layanan top up atau tagihan terlebih dahulu dari halaman utama.</p>
            <Link href="/" className="mt-6 inline-flex rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700">
              Kembali ke Beranda
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
            <h1 className="text-3xl font-bold text-gray-900">Konfirmasi Pembayaran Digital</h1>
            <p className="mt-2 text-gray-600">Pastikan detail transaksi sudah benar sebelum melanjutkan ke pembayaran.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-6">
              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Detail Transaksi</h2>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                    {payload.category === 'topup' ? 'Top Up' : 'Tagihan'}
                  </span>
                </div>

                <div className="rounded-2xl border border-gray-100 p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Layanan</p>
                      <h3 className="text-xl font-semibold text-gray-900">{payload.serviceLabel}</h3>
                      <p className="mt-1 text-sm text-gray-600">{payload.description}</p>
                    </div>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency('IDR', payload.price)}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {Object.entries(payload.fieldValues).map(([key, value]) => (
                      <div key={key} className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-sm capitalize text-gray-500">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="mt-1 font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Nominal</p>
                      <p className="mt-1 font-semibold text-gray-900">{payload.nominalLabel}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Pilih Metode Pembayaran</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
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
                        onChange={(event) => setSelectedPaymentMethod(event.target.value)}
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
                  <span>Jenis layanan</span>
                  <span>{payload.serviceLabel}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm text-gray-600">
                  <span>{payload.summaryLabel}</span>
                  <span className="text-right">{customerIdentifier}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Metode terpilih</span>
                  <span className="text-right">{selectedMethod?.label}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                    <span>Total bayar</span>
                    <span className="text-green-600">{formatCurrency('IDR', payload.price)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
                Setelah konfirmasi, transaksi digital ini akan diproses secara simulasi dan pengguna diarahkan kembali ke beranda.
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isProcessing}
                  className="flex-1 rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Kembali
                </button>
                <button
                  type="button"
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
        orders={[payload]}
        totalAmount={payload.price}
        currency="IDR"
        formatCurrency={formatCurrency}
        selectedPaymentLabel={selectedMethod?.label ?? '-'}
        itemLabel="transaksi"
        agreementText={`Dengan melanjutkan, Anda menyetujui ${payload.actionLabel.toLowerCase()} ${payload.serviceLabel} untuk tujuan ${customerIdentifier} menggunakan metode pembayaran yang telah dipilih.`}
      />
    </main>
  )
}

export default DigitalPaymentPage
