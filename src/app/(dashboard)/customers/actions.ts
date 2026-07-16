'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCustomer(type: 'B2B' | 'B2C', name: string, email: string, phone: string, totalVolume: number = 0.00) {
  const supabase = await createClient()
  
  // Get active team
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: activeTeamMember } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .single()

  if (!activeTeamMember) throw new Error("No active team found")

  const { error } = await supabase
    .from('customers')
    .insert({
      team_id: activeTeamMember.team_id,
      type,
      name,
      email,
      phone,
      total_volume: totalVolume
    })

  if (error) {
    console.error("Error creating customer:", error)
    throw new Error("Failed to create customer")
  }

  revalidatePath('/customers')
  return { success: true }
}
