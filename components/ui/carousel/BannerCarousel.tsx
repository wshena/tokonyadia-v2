'use client'

import Image from 'next/image';
import Carousel from './Carousel';
import CarouselItem from './CarouselItem';
import React, { useMemo, useState, useRef, useEffect } from 'react' // ← tambah useRef, useEffect
import { useCarouselStoreInstance } from '@/hooks/useCarouselStoreInstance';
import Link from 'next/link';
import CarouselButton from './CarouselButton';
import { AngleLeftIcon, AngleRightIcon } from '../../icon';
import { cn } from '@/lib/utils';
import CarouselDots from './CarouselDots';

const BannerImages = [
  '/homeCarousel/item.jpg.webp',
  '/homeCarousel/item1.jpg',
  '/homeCarousel/item2.jpg',
  '/homeCarousel/item3.jpg',
]

const Banner = ({ image }: { image: string }) => {
  return (
    <div className='w-full h-full rounded-[10px] md:rounded-[20px]'>
      <Image src={image} alt="Banner Image" fill className='rounded-[10px] md:rounded-[20px]' />
    </div>
  )
}

const BannerCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [slideWidth, setSlideWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setSlideWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()

    const resizeObserver = new ResizeObserver(updateWidth)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  const [config] = useState<CarouselConfig>({
    itemsPerView: 1,
    scrollBy: 1,
    slideWidth: 400,
    infinite: true,
    autoPlay: true,
    showDots: false,
  });

  const { store: carouselStore } = useCarouselStoreInstance(
    'banner-carousel',
    {
      itemsPerView: config.itemsPerView,
      scrollBy: config.scrollBy,
      infinite: config.infinite,
    }
  );

  const carouselItems = useMemo(() => (
    BannerImages.map((item, idx) => (
      <CarouselItem key={`${item} + ${idx}`} onClick={() => {}} className='rounded-[10px] md:rounded-[20px]'>
        <Link href={'#'} className='rounded-md'>
          <div className='relative w-full aspect-1280/600 md:aspect-1208/300'>
            <Banner image={item} />
          </div>
        </Link>
      </CarouselItem>
    ))
  ), []);
  
  if (slideWidth === 0) return <div ref={containerRef} className='w-full aspect-1280/600 md:aspect-1208/300 rounded-[10px] md:rounded-[20px] bg-gray-100 animate-pulse' />

  return (
    <div ref={containerRef} className='group relative w-full rounded-[10px] md:rounded-[20px]'>
      <Carousel
        store={carouselStore}
        itemsPerView={config.itemsPerView}
        scrollBy={config.scrollBy}
        slideWidth={slideWidth}
        infinite={config.infinite}
        autoPlay={config.autoPlay}
        autoPlayInterval={5000}
        gap={0}
      >
        {carouselItems}
      </Carousel>

      {/* prev button */}
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        'absolute top-0 left-0 h-full',
        'flex items-center justify-center',
        'opacity-0',
        'group-hover:opacity-100 group-hover:-translate-x-5'
      )}>
        <CarouselButton
          direction="prev"
          store={carouselStore}
          className="p-2 rounded-full cursor-pointer bg-white"
        >
          <AngleLeftIcon size={30} color='black' />
        </CarouselButton>
      </div>

      {/* next button */}
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        'absolute top-0 right-0 h-full',
        'flex items-center justify-center',
        'opacity-0',
        'group-hover:opacity-100 group-hover:translate-x-5'
      )}>
        <CarouselButton
          direction="next"
          store={carouselStore}
          className="p-2 rounded-full cursor-pointer bg-white"
        >
          <AngleRightIcon size={30} color='black' />
        </CarouselButton>
      </div>

      {/* carousel dots */}
      <div className="absolute bottom-0 w-full h-10 flex items-center justify-center">
        <CarouselDots
          store={carouselStore}
          className="space-x-4"
          dotClassName="w-3 h-3 bg-white/70 rounded-full cursor-pointer"
          activeDotClassName="w-3 h-3 bg-white rounded-full cursor-pointer"
          customCount={BannerImages?.length}
        />
      </div>
    </div>
  )
}

export default BannerCarousel