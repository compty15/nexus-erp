'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createService(type: string, provider: string, estimatedCost: number) {
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
    .from('services')
    .insert({
      team_id: activeTeamMember.team_id,
      type,
      provider,
      estimated_cost: estimatedCost
    })

  if (error) {
    console.error("Error creating service:", error)
    throw new Error("Failed to create service")
  }

  revalidatePath('/services')
  return { success: true }
}
