import { create } from 'zustand'

type AlertType = 'success' | 'error' | 'warning' | 'info'

interface UtilityStateProps {
  isMenuOpen: boolean
  isModalOpen: boolean
  alert: {
    label: string
    type: AlertType
  }
  toggleMenu: () => void
  closeMenu: () => void
  toggleModal: () => void
  closeModal: () => void

  setAlert: (alert: { label: string; type: AlertType }) => void
}

export const useUtilityStore = create<UtilityStateProps>((set) => ({
  isMenuOpen: false,
  isModalOpen: false,
  alert: {
    label: '',
    type: 'info',
  },
  
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
  
  toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),
  closeModal: () => set({ isModalOpen: false }),

  setAlert: (alert) => set({ alert }),
}))