'use client'

import { useState } from 'react'
import { StartIcon } from '@/components/icon'
import ModalContainer from '@/components/ui/modals/ModalContainer'
import { cn } from '@/lib/utils'

interface ReviewComposerModalProps {
  isOpen: boolean
  productTitle: string
  initialRate?: number
  initialComment?: string
  onClose: () => void
  onSubmit: (payload: { rate: number; comment: string }) => Promise<void> | void
}

const ReviewComposerModal = ({
  isOpen,
  productTitle,
  initialRate = 0,
  initialComment = '',
  onClose,
  onSubmit,
}: ReviewComposerModalProps) => {
  const [rate, setRate] = useState(initialRate)
  const [comment, setComment] = useState(initialComment)

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} contentClassName="w-full max-w-2xl">
      <div className="overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-green-700 px-6 py-5 text-white">
          <h2 className="text-xl font-bold">Tulis Review</h2>
          <p className="mt-1 text-sm text-slate-200">{productTitle}</p>
        </div>

        <form
          onSubmit={async event => {
            event.preventDefault()
            await onSubmit({ rate, comment })
          }}
          className="space-y-6 px-6 py-6"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">Rating</p>
            <div className="mt-3 flex items-center gap-2">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1
                const active = value <= rate

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRate(value)}
                    className={cn(
                      'rounded-full border p-2 transition-colors',
                      active
                        ? 'border-amber-300 bg-amber-50 text-amber-500'
                        : 'border-gray-200 bg-white text-gray-300 hover:border-amber-200 hover:text-amber-400'
                    )}
                  >
                    <StartIcon size={20} className={active ? 'text-amber-500' : 'text-current'} />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">Komentar</label>
            <textarea
              value={comment}
              onChange={event => setComment(event.target.value)}
              rows={5}
              className="mt-3 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-green-500"
              placeholder="Ceritakan kualitas produk, pengalaman pemakaian, atau hal yang paling kamu suka."
            />
            <p className="mt-2 text-xs text-gray-500">
              Minimal 10 karakter. Review hanya tersedia setelah pesanan berstatus selesai.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={rate < 1 || comment.trim().length < 10}
              className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Simpan Review
            </button>
          </div>
        </form>
      </div>
    </ModalContainer>
  )
}

export default ReviewComposerModal
