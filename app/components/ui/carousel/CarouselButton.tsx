'use client';

import React from 'react';
import { CarouselStore } from '@/lib/zustand/store';

interface CarouselButtonProps {
  direction: 'prev' | 'next';
  store: CarouselStore; // Wajib: store instance dari Carousel
  className?: string;
  disabledClassName?: string;
  children?: React.ReactNode;
  showDefaultIcon?: boolean;
  onClick?: () => void; // Optional: untuk override
}

const CarouselButton: React.FC<CarouselButtonProps> = ({
  direction,
  store,
  className = '',
  disabledClassName = 'opacity-50 cursor-not-allowed',
  children,
  showDefaultIcon = true,
  onClick,
}) => {
  // Subscribe ke state yang diperlukan
  const currentIndex = store((state) => state.currentIndex);
  const itemsPerView = store((state) => state.itemsPerView);
  const childrenLength = store((state) => state.childrenLength);
  const infinite = store((state) => state.infinite);
  const isTransitioning = store((state) => state.isTransitioning);
  const goToPrev = store((state) => state.goToPrev);
  const goToNext = store((state) => state.goToNext);

  const isPrevDisabled = !infinite && currentIndex <= 0;
  const isNextDisabled = !infinite && currentIndex >= childrenLength - itemsPerView;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (isTransitioning) return;

    if (direction === 'prev') {
      goToPrev();
    } else {
      goToNext();
    }
  };

  const isDisabled = direction === 'prev' ? isPrevDisabled : isNextDisabled;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${className}
        ${isDisabled ? disabledClassName : ''}
      `}
      aria-label={direction === 'prev' ? 'Previous slide' : 'Next slide'}
    >
      {children}
    </button>
  );
};

export default CarouselButton;