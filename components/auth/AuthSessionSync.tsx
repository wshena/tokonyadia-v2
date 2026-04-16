'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/zustand/authStore'
import { useWishlistStore } from '@/lib/zustand/wishlistStore'
import { createClient } from '@/utils/supabase/client'

const AuthSessionSync = () => {
  const getUser = useAuthStore(state => state.getUser)
  const getSession = useAuthStore(state => state.getSession)
  const logoutUser = useAuthStore(state => state.logoutUser)
  const initWishlist = useWishlistStore(state => state.initWishlist)
  const fetchWishlist = useWishlistStore(state => state.fetchWishlist)
  const clearWishlistState = useWishlistStore(state => state.clearWishlistState)

  useEffect(() => {
    const supabase = createClient()

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        logoutUser()
        clearWishlistState()
        return
      }

      getSession(session)
      getUser(session.user)
      initWishlist(session.user.id)
      await fetchWishlist(session.user.id).catch(() => null)
    }

    syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        logoutUser()
        clearWishlistState()
        return
      }

      getSession(session)
      getUser(session.user)
      initWishlist(session.user.id)
      fetchWishlist(session.user.id).catch(() => null)
    })

    return () => subscription.unsubscribe()
  }, [clearWishlistState, fetchWishlist, getSession, getUser, initWishlist, logoutUser])

  return null
}

export default AuthSessionSync
