'use client'
import Image from 'next/image'
import React, { useState } from 'react'

interface ProductImageProps {
  imageArray: string[]
}

interface SmallImageProps extends ProductImageProps {
  index: number
  handleClick: (index: number) => void
}

const SmallImage = ({ imageArray, index, handleClick }: SmallImageProps) => {
  return (
    <div className="flex items-center justify-between flex-wrap w-full">
      {imageArray.map((item, idx) => (
        <button key={idx} onClick={() => handleClick(idx)}>
          <div className={`cursor-pointer border border-gray-300 relative w-15 h-15 rounded-[5px] ${idx === index && 'border-green-500'}`}>
            <Image src={item} alt='product-image' fill sizes="60px" loading="lazy" className='rounded-[5px] object-cover' />
          </div>
        </button>
      ))}
    </div>
  )
}

const ProductImage = ({ imageArray }: ProductImageProps) => {
  const [index, setIndex] = useState(0)
  const handleImageClick = (index: number) => setIndex(index)
  const src = imageArray[index]

  return (
    <div className="flex items-center justify-center w-full md:w-fit">
      <div className="w-67 lg:w-60 xl:w-87">
        <div className="relative w-full h-67 lg:h-60 xl:h-87 rounded-[10px] mb-5">
          <Image
            src={src}
            alt='product-image'
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 268px, (max-width: 1280px) 240px, 348px"
            className='rounded-[10px] object-cover'
          />
        </div>
        <SmallImage imageArray={imageArray} index={index} handleClick={handleImageClick} />
      </div>
    </div>
  )
}

export default ProductImage
