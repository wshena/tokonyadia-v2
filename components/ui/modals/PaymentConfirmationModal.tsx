'use client'

import React from 'react'
import ModalContainer from './ModalContainer'

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isProcessing: boolean
  orders: unknown[]
  totalAmount: number
  currency: string
  formatCurrency: (currency: string, amount: number) => string
  selectedPaymentLabel: string
  itemLabel?: string
  agreementText?: string
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  orders,
  totalAmount,
  currency,
  formatCurrency,
  selectedPaymentLabel,
  itemLabel = 'pesanan',
  agreementText = 'Dengan melanjutkan, Anda menyetujui pembayaran untuk pesanan yang dipilih menggunakan metode pembayaran yang telah dipilih.',
}) => {
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Pembayaran</h3>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Jumlah Pesanan</p>
            <p className="font-semibold">{orders.length} {itemLabel}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Metode Pembayaran</p>
            <p className="font-medium text-gray-900">{selectedPaymentLabel}</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Pembayaran</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(currency, totalAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-6">{agreementText}</div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="cursor-pointer flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="cursor-pointer flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Memproses...
              </>
            ) : (
              'Konfirmasi Pembayaran'
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  )
}

export default PaymentConfirmationModal
