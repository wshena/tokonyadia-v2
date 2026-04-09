import { CategoryIcon } from '@/components/icon';
import { createSlug } from '@/lib/utils';
import Link from 'next/link'
import React from 'react'

const CategoryCard = ({category}:{category: any}) => {
  const id = category.category_id;
  const slug = createSlug(category.title);

  return (
    <Link href={`/categories/${id}/${slug}`} className='w-full inline-flex p-3 rounded-lg bg-white text-black border border-gray-300 hover:shadow-md transition-shadow'>
      <div className="flex items-center gap-2">
        <CategoryIcon size={20} color='black'  />
        <span className='capitalize'>{category.title}</span>
      </div>
    </Link>
  )
}

export default CategoryCard