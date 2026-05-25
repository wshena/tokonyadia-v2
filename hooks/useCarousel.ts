import {
  CarouselStore,
  createCarouselStore,
} from "@/lib/zustand/CarouselStore";
import { useState } from "react";

export const useCarousel = (initialState?: {
  itemsPerView?: number;
  scrollBy?: number;
  infinite?: boolean;
}) => {
  const [store] = useState<CarouselStore>(() =>
    createCarouselStore({
      itemsPerView: initialState?.itemsPerView || 4,
      scrollBy: initialState?.scrollBy || 1,
      infinite: initialState?.infinite ?? true,
    })
  );

  return store;
};
