import { createCarouselStore, CarouselStore } from '@/lib/zustand/store';
import { useRef } from 'react';

// Map untuk menyimpan store instances berdasarkan ID
const storeInstances = new Map<string, CarouselStore>();

export const useCarouselStoreInstance = (storeId?: string, initialConfig?: {
  itemsPerView?: number;
  scrollBy?: number;
  infinite?: boolean;
}) => {
  const instanceId = useRef(storeId || `carousel-${Math.random().toString(36).substr(2, 9)}`);
  
  // Get or create store instance
  if (!storeInstances.has(instanceId.current)) {
    storeInstances.set(
      instanceId.current, 
      createCarouselStore({
        itemsPerView: initialConfig?.itemsPerView || 4,
        scrollBy: initialConfig?.scrollBy || 1,
        infinite: initialConfig?.infinite ?? true,
      })
    );
  }
  
  const store = storeInstances.get(instanceId.current)!;
  
  return {
    store,
    storeId: instanceId.current,
    // Helper untuk menghapus store jika tidak digunakan lagi
    cleanup: () => {
      storeInstances.delete(instanceId.current);
    }
  };
};