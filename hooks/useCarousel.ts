import { useRef } from 'react';
import { createCarouselStore, CarouselStore } from '@/lib/zustand/store';

export const useCarousel = (initialState?: {
  itemsPerView?: number;
  scrollBy?: number;
  infinite?: boolean;
}) => {
  const storeRef = useRef<CarouselStore | null>(null);
  
  if (!storeRef.current) {
    storeRef.current = createCarouselStore({
      itemsPerView: initialState?.itemsPerView || 4,
      scrollBy: initialState?.scrollBy || 1,
      infinite: initialState?.infinite ?? true,
    });
  }
  
  return storeRef.current;
};