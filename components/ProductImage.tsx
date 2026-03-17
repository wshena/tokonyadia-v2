'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const SmallImage = ({ imageArray, index, handleClick }: { imageArray: any, index: number, handleClick: any }) => {
  return (
    <div className="flex items-center justify-between flex-wrap w-full">
      {imageArray.map((item: any, idx: number) => (
        <button key={idx} onClick={() => handleClick(idx)}>
          <div className={`relative w-15 h-15 rounded-[5px] ${idx === index && 'border border-mainGreen'}`}>
            <Image src={item} alt='product-image' fill className='rounded-[5px] object-cover' />
          </div>
        </button>
      ))}
    </div>
  )
}

const ProductImage = ({ imageArray }: { imageArray: any }) => {
  const [index, setIndex] = useState(0)
  const [src, setSrc] = useState(imageArray[index])

  const handleImageClick = (index: number) => setIndex(index)

  useEffect(() => {
    setSrc(imageArray[index])
  }, [index])

  return (
    <div className="flex items-center justify-center w-full md:w-fit">
      <div className="w-67 lg:w-60 xl:w-87">
        <div className="relative w-full h-67 lg:h-60 xl:h-87 rounded-[10px] mb-5">
          <Image src={src} alt='product-image' fill className='rounded-[10px] object-cover' />
        </div>
        <SmallImage imageArray={imageArray} index={index} handleClick={handleImageClick} />
      </div>
    </div>
  )
}

export default ProductImage