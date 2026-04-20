'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Button from './Button'
import { useUtilityStore } from '@/lib/zustand/utilityStore'
import CategoryModal from '../modals/CategoryModal'

interface CategoryButtonProps {
  withBackground?: boolean
}

const CategoryButton = ({ withBackground = true }: CategoryButtonProps) => {
  const categoryButtonHover    = useUtilityStore(state => state.categoryButtonHover)
  const setCategoryButtonHover = useUtilityStore(state => state.setCategoryButtonHover)
  const setModalBackground = useUtilityStore(state => state.setModalBackground)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchQueryString = searchParams.toString()

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)  // ← delay close
  const closeCategoryHover = () => {
    setCategoryButtonHover(false)
    if (withBackground) setModalBackground(false)
  }

  const handleMouseEnter = () => {
    // Cancel close jika sedang pending
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setCategoryButtonHover(true)
    if (withBackground) setModalBackground(true)
  }

  const handleMouseLeave = () => {
    // Delay close — beri waktu mouse pindah ke CartModal
    timeoutRef.current = setTimeout(() => {
      closeCategoryHover()
    }, 100)
  }

  useEffect(() => {
    setCategoryButtonHover(false)
    if (withBackground) setModalBackground(false)
  }, [pathname, searchQueryString, setCategoryButtonHover, setModalBackground, withBackground])

  return (
    <>
      {/* Background overlay — diklik untuk tutup */}
      {categoryButtonHover && withBackground && (
        <div
          className="fixed top-20 left-0 w-full h-screen bg-black/50 z-40"
          onMouseEnter={handleMouseLeave}  // ← mouse masuk overlay = tutup
          onClick={closeCategoryHover}
        />
      )}

      <div
        className="relative hidden md:block z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Category Button */}
        <Button label='Kategori' variant='ghost' className='hidden md:block text-gray-600 font-medium text-md hover:bg-gray-200' />

        {/* Category Modal */}
        {categoryButtonHover && (
          <div
            className="absolute top-10 md:-left-25 lg:-left-40 xl:left-0 z-50"
            onMouseEnter={handleMouseEnter}  // ← mouse masuk modal = batalkan close
            onMouseLeave={handleMouseLeave}  // ← mouse keluar modal = tutup
          >
            {/* Category Modal */}
            <CategoryModal />
          </div>
        )}
      </div>
    </>
  )
}

export default CategoryButton
