import {
  CarouselStore,
  createCarouselStore,
} from "@/lib/zustand/CarouselStore";
import { useRef } from "react";

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
