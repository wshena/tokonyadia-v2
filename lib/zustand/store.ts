import { create } from 'zustand'

// utility
export const useUtilityStore = create((set) => ({
  isMenuOpen: false,
  isModalOpen: false,
  
  toggleMenu: () => set((state:any) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
  
  toggleModal: () => set((state:any) => ({ isModalOpen: !state.isModalOpen })),
  closeModal: () => set({ isModalOpen: false }),
}))

// carousel state
export interface CarouselState {
  // State
  currentIndex: number;
  totalItems: number;
  itemsPerView: number;
  scrollBy: number;
  infinite: boolean;
  isTransitioning: boolean;
  childrenLength: number;
  
  // Actions
  goToSlide: (index: number) => void;
  goToPrev: () => void;
  goToNext: () => void;
  setIsTransitioning: (transitioning: boolean) => void;
  
  // Setters
  setTotalItems: (total: number) => void;
  setChildrenLength: (length: number) => void;
  setItemsPerView: (items: number) => void;
  setScrollBy: (scroll: number) => void;
  setInfinite: (infinite: boolean) => void;
}

// Factory function untuk membuat store instance
export const createCarouselStore = (initialState?: Partial<CarouselState>) => {
  return create<CarouselState>((set, get) => ({
    // Default state
    currentIndex: 0,
    totalItems: 0,
    itemsPerView: 4,
    scrollBy: 1,
    infinite: true,
    isTransitioning: false,
    childrenLength: 0,
    
    // Actions
    goToSlide: (index: number) => {
      const state = get();
      if (state.isTransitioning) return;
      
      set({ isTransitioning: true });
      
      if (!state.infinite) {
        let adjustedIndex = index;
        if (adjustedIndex < 0) adjustedIndex = 0;
        if (adjustedIndex > state.childrenLength - state.itemsPerView) {
          adjustedIndex = state.childrenLength - state.itemsPerView;
        }
        set({ currentIndex: adjustedIndex });
      } else {
        set({ currentIndex: index + state.itemsPerView });
      }
    },
    
    goToPrev: () => {
      const state = get();
      if (state.isTransitioning) return;
      
      set({ isTransitioning: true });
      const newIndex = state.currentIndex - state.scrollBy;
      
      if (!state.infinite && newIndex < 0) {
        set({ currentIndex: 0, isTransitioning: false });
        return;
      }
      
      set({ currentIndex: newIndex });
    },
    
    goToNext: () => {
      const state = get();
      if (state.isTransitioning) return;
      
      set({ isTransitioning: true });
      const newIndex = state.currentIndex + state.scrollBy;
      
      if (!state.infinite && newIndex > state.childrenLength - state.itemsPerView) {
        set({ 
          currentIndex: state.childrenLength - state.itemsPerView, 
          isTransitioning: false 
        });
        return;
      }
      
      set({ currentIndex: newIndex });
    },
    
    setIsTransitioning: (transitioning: boolean) => {
      set({ isTransitioning: transitioning });
    },
    
    // Setters
    setTotalItems: (total: number) => set({ totalItems: total }),
    setChildrenLength: (length: number) => set({ childrenLength: length }),
    setItemsPerView: (items: number) => set({ itemsPerView: items }),
    setScrollBy: (scroll: number) => set({ scrollBy: scroll }),
    setInfinite: (infinite: boolean) => set({ infinite }),
    
    // Override dengan initialState jika ada
    ...initialState,
  }));
};

// Type untuk store instance
export type CarouselStore = ReturnType<typeof createCarouselStore>;