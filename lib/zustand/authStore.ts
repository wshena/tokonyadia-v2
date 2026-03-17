import { create } from 'zustand'

interface AuthState {
  user: any
  session: any

  // Actions
  getUser: (user: any) => void
  getSession: (session: any) => void
  logoutUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: {},
  session: {},

  // Actions
  getUser:    (user)    => set({ user }),
  getSession: (session) => set({ session }),
  logoutUser: ()        => set({ user: null, session: null }),
}))