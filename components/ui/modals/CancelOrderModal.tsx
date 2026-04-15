'use client'

import React from 'react'
import ModalContainer from './ModalContainer'

interface CancelOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isProcessing: boolean
  isBulk?: boolean
  selectedCount?: number
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  isBulk = false,
  selectedCount = 0,
}) => {
  const title = isBulk ? `Batalkan ${selectedCount} Pesanan?` : 'Batalkan Pesanan?'
  const message = isBulk
    ? 'Semua pesanan yang dipilih akan dibatalkan dan tidak bisa diproses lagi.'
    : 'Pesanan yang dibatalkan akan berubah status menjadi "Dibatalkan" dan tidak bisa diproses lagi.'
  const confirmText = isBulk ? 'Batalkan Semua' : 'Batalkan'

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
              confirmText
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  )
}

export default CancelOrderModal