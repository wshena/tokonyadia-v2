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

  useEffect(() => {
    const supabase = createClient()

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        logoutUser()
        return
      }

      getSession(session)
      getUser(session.user)
      initWishlist(session.user.id)
    }

    syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        logoutUser()
        return
      }

      getSession(session)
      getUser(session.user)
      initWishlist(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [getSession, getUser, initWishlist, logoutUser])

  return null
}

export default AuthSessionSync
