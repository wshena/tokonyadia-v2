import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  session: Session | null

  // Actions
  getUser: (user: User | null) => void
  getSession: (session: Session | null) => void
  logoutUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  session: null,

  // Actions
  getUser:    (user)    => set({ user }),
  getSession: (session) => set({ session }),
  logoutUser: ()        => set({ user: null, session: null }),
}))
