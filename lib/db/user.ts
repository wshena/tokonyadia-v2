import { createClient } from '@/utils/supabase/client'

export interface UserProfile {
  username: string
  firstName: string
  lastName: string
  sex: string
  phoneNumber: string
  address: string
  date: string
  profilePicture?: string
}

const supabase = createClient()

export const createUser = async (userId: string, formData: UserProfile) => {
  const payload = {
    id: userId,
    username: formData.username,
    first_name: formData.firstName,
    last_name: formData.lastName,
    sex: formData.sex,
    phone_number: formData.phoneNumber,
    address: formData.address,
    date_of_birth: formData.date,
    profile_picture: formData.profilePicture ?? '',
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error.message)
    throw new Error(error.message)
  }

  return data
}

export const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updateUser = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      username:        updates.username,
      first_name:      updates.firstName,
      last_name:       updates.lastName,
      sex:             updates.sex,
      phone_number:    updates.phoneNumber,
      address:         updates.address,
      date_of_birth:   updates.date,
      profile_picture: updates.profilePicture,
    })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  return data
}
