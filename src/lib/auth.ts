import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user
}

export async function getStaffWithOrg() {
  const user = await getAuthUser()
  const supabase = await createClient()

  const { data: staff } = await supabase
    .from('staff')
    .select('*, organizations(*)')
    .eq('user_id', user.id)
    .single()

  if (!staff) {
    // Auto-create org and staff for new users
    const { data: org } = await supabase
      .from('organizations')
      .insert({ name: 'マイクリニック', email: user.email! })
      .select()
      .single()

    if (!org) redirect('/login')

    const { data: newStaff } = await supabase
      .from('staff')
      .insert({
        user_id: user.id,
        organization_id: org.id,
        name: user.email!.split('@')[0],
        role: 'admin',
      })
      .select('*, organizations(*)')
      .single()

    return newStaff!
  }

  return staff
}
