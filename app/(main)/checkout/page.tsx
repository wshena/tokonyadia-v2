import { createClient } from '@/utils/supabase/server'
import { getUserById } from '@/lib/db/user'
import { redirect } from 'next/navigation'
import CheckoutClient from '@/components/checkout/CheckoutClient'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect ke login jika belum login
  if (!user) redirect('/auth/login')

  const profile = await getUserById(user.id).catch(() => null)

  return <CheckoutClient user={user} profile={profile} />
}