'use client';

import React from 'react';
import { CarouselStore } from '@/lib/zustand/store';

interface CarouselDotsProps {
  store: CarouselStore;
  className?: string;
  dotClassName?: string;
  activeDotClassName?: string;
  maxDots?: number;
  showNumbers?: boolean;
  customCount?: number;
}

const CarouselDots: React.FC<CarouselDotsProps> = ({
  store,
  className = '',
  dotClassName = 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400',
  activeDotClassName = 'bg-blue-600 w-6',
  maxDots,
  showNumbers = false,
  customCount,
}) => {
  // Subscribe ke state yang diperlukan
  const currentIndex = store((state) => state.currentIndex);
  const itemsPerView = store((state) => state.itemsPerView);
  const childrenLength = store((state) => state.childrenLength);
  const infinite = store((state) => state.infinite);
  const scrollBy = store((state) => state.scrollBy);
  const goToSlide = store((state) => state.goToSlide);
  const isTransitioning = store((state) => state.isTransitioning);

  // Hitung jumlah dots
  const calculateDotsCount = () => {
    if (customCount !== undefined) return customCount;
    
    if (childrenLength === 0) return 0;
    
    if (infinite) {
      const maxVisibleSlides = Math.max(0, childrenLength - itemsPerView + 1);
      return Math.ceil(maxVisibleSlides / scrollBy);
    } else {
      return Math.ceil(childrenLength / scrollBy);
    }
  };

  let dotsCount = calculateDotsCount();
  if (maxDots && dotsCount > maxDots) {
    dotsCount = maxDots;
  }

  const handleDotClick = (index: number) => {
    if (isTransitioning) return;
    
    const slideIndex = index * scrollBy;
    goToSlide(slideIndex);
  };

  // Tentukan dot mana yang aktif
  const getActiveDotIndex = () => {
    if (infinite) {
      const adjustedIndex = currentIndex - itemsPerView;
      return Math.floor(adjustedIndex / scrollBy);
    } else {
      return Math.floor(currentIndex / scrollBy);
    }
  };

  const activeDotIndex = getActiveDotIndex();
  
  if (dotsCount <= 0) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {Array.from({ length: dotsCount }).map((_, index) => {
        const isActive = index === activeDotIndex;
        
        return (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            disabled={isTransitioning}
            className={`
              transition-all duration-300
              flex items-center justify-center
              disabled:cursor-not-allowed
              ${isActive ? activeDotClassName : dotClassName}
              ${showNumbers ? '' : ''}
            `}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={isActive ? 'true' : 'false'}
          >
            {showNumbers ? (
              <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {index + 1}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default CarouselDots;