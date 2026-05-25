import { CarouselStore, createCarouselStore } from '@/lib/zustand/CarouselStore';
import { useCallback, useState } from 'react';

// Map untuk menyimpan store instances berdasarkan ID
const storeInstances = new Map<string, CarouselStore>();

export const useCarouselStoreInstance = (storeId?: string, initialConfig?: {
  itemsPerView?: number;
  scrollBy?: number;
  infinite?: boolean;
}) => {
  const [instanceId] = useState(() => storeId || `carousel-${Math.random().toString(36).slice(2, 11)}`);
  
  const [store] = useState(() => {
    const existingStore = storeInstances.get(instanceId)
    if (existingStore) return existingStore

    const nextStore = createCarouselStore({
      itemsPerView: initialConfig?.itemsPerView || 4,
      scrollBy: initialConfig?.scrollBy || 1,
      infinite: initialConfig?.infinite ?? true,
    })
    storeInstances.set(instanceId, nextStore)
    return nextStore
  });

  const cleanup = useCallback(() => {
    storeInstances.delete(instanceId);
  }, [instanceId])
  
  return {
    store,
    storeId: instanceId,
    // Helper untuk menghapus store jika tidak digunakan lagi
    cleanup,
  };
};
