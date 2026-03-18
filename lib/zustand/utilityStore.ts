import { create } from 'zustand'

type AlertType = 'success' | 'error' | 'warning' | 'info'

interface UtilityStateProps {
  isMenuOpen: boolean
  isModalOpen: boolean
  alert: {
    label: string
    type: AlertType
  }
  cartButtonHover: boolean,
  categoryButtonHover: boolean,
  modalBackground: boolean,

  toggleMenu: () => void
  closeMenu: () => void
  toggleModal: () => void
  closeModal: () => void

  setAlert: (alert: { label: string; type: AlertType }) => void
  setCartButtonHover: (hover: boolean) => void
  setCategoryButtonHover: (hover: boolean) => void
  setModalBackground: (background: boolean) => void
}

export const useUtilityStore = create<UtilityStateProps>((set) => ({
  isMenuOpen: false,
  isModalOpen: false,
  alert: {
    label: '',
    type: 'info',
  },
  cartButtonHover: false,
  categoryButtonHover: false,
  modalBackground: false,
  
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
  
  toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),
  closeModal: () => set({ isModalOpen: false }),

  setAlert: (alert) => set({ alert }),
  setCartButtonHover: (hover: boolean) => set({ cartButtonHover: hover }),
  setCategoryButtonHover: (hover: boolean) => set({ categoryButtonHover: hover }),
  setModalBackground: (background: boolean) => set({ modalBackground: background }),
}))