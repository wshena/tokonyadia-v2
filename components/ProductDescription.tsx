'use client'

import React, { useEffect, useState } from 'react'
import { StarIcon } from './icon'
import { useProductStore } from '@/lib/zustand/productStore'

const ProductDescription = ({ product }: { product: any }) => {
  const { setStock, addToProductHistory } = useProductStore()

  const [index, setIndex] = useState(0)
  const [productStock, setProductStock] = useState<any | null>(() => {
    if (product?.stock && product.stock.length > 0) {
      return {
        type: product.stock[0].type,
        quantity: product.stock[0].quantity
      }
    }
    return null
  })

  const handleIndex = (idx: number) => setIndex(idx)

  useEffect(() => {
    if (product?.stock && product.stock.length > 0) {
      setProductStock({
        type: product.stock[index]?.type,
        quantity: product.stock[index]?.quantity
      })
    }
  }, [index, product])

  useEffect(() => {
    setStock(productStock)
  }, [productStock])

  useEffect(() => {
    addToProductHistory(product)
  }, [])

  return (
    <div className="flex flex-col gap-3 items-start w-full lg:w-[30%] order-2 md:order-3 lg:order-2 mt-0 md:mt-10 lg:mt-0">
      {/* Title & Rating */}
      <div className="w-fit">
        <h1 className="font-bold text-[1.5rem] md:text-[2rem] mb-2.5">
          {product?.title}
        </h1>
        <div className="flex items-center text-[.9rem] md:text-[1rem] flex-nowrap lg:flex-wrap xl:flex-nowrap gap-2.5">
          <span>Terjual {product?.performance?.sales}+ produk</span>
          <span className="block w-1.25 h-1.25 rounded-full bg-gray-400" />
          <div className="flex items-center gap-0.75">
            <StarIcon size={20} color="black" />
            <span>{Math.ceil(product?.performance?.ratingAverage)}</span>
            <span>({product?.performance?.ratingCount} rating)</span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center gap-2.5 text-[1rem] md:text-[1.5rem] w-fit">
        <h2 className="font-bold line-through">
          {product?.price?.currency}{product?.price?.withoutDiscount}
        </h2>
        <h2 className="font-bold">
          {product?.price?.currency}{product?.price?.withDiscount}
        </h2>
        <span className="text-red-500">{product?.price?.discountPercentage}%</span>
      </div>

      {/* Variant Selector */}
      <div className="flex flex-col items-start gap-2">
        <h3 className="font-bold text-[1rem]">Pilih variant: <span className='font-light text-gray-500'>{productStock?.type}</span> </h3>
        <div className="flex items-center flex-wrap gap-2.5">
          {product?.stock?.map((item: any, idx: number) => (
            <button
              key={idx}
              onClick={() => handleIndex(idx)}
              className={`py-1 px-3 rounded-xl border border-green-300 ${idx === index && 'text-white bg-green-500 border-none'} cursor-pointer`}
            >
              {item?.type}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="text-[.9rem] text-justify">{product?.description}</p>
    </div>
  )
}

export default ProductDescription