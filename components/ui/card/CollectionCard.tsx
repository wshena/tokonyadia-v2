import { createSlug } from '@/lib/utils';
import type { Collection } from '@/lib/db/collections';
import Link from 'next/link';
import React from 'react'

const CollectionCard = ({collection}:{collection: Collection}) => {
  const id = collection.collection_id;
  const slug = createSlug(collection.title);

  return (
    <Link href={`/collections/${id}/${slug}`} className='w-fit'>
      <div className="p-3 rounded-lg bg-white text-black border border-gray-300 hover:shadow-md transition-shadow flex flex-col items-start gap-2 w-fit">
        <div className="bg-gray-200 rounded-xl w-50 h-50" />
        <div className="flex flex-col gap-1">
          <span className='capitalize font-bold'>{collection.title}</span>
          <span className='text-sm text-gray-500'>{collection.description}</span>
        </div>
      </div>
    
    </Link>
  )
}

export default CollectionCard
