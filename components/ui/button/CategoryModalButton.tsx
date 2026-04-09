'use client'

import { CategoryIcon } from '@/components/icon'
import CategoryListModal from '../modals/CategoryListModal'
import { useUtilityStore } from '@/lib/zustand/utilityStore'

const CategoryModalButton = () => {
  const openModal = useUtilityStore((state) => state.openModal)

  return (
    <button
      type="button"
      onClick={() => openModal(<CategoryListModal />)}
      className='p-3 rounded-lg bg-white text-black border border-gray-300 hover:shadow-md transition-shadow cursor-pointer'
    >
      <div className="flex items-center gap-2">
        <CategoryIcon size={20} color='black'  />
        <span className='capitalize'>kategori</span>
      </div>
    </button>
  )
}

export default CategoryModalButton
