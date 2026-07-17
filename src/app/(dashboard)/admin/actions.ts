'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

async function verifyGlobalAdmin(supabase: any, userId: string) {
  const { data: adminCheck } = await supabase
    .from('global_admins')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (!adminCheck) throw new Error("Unauthorized: Global Admin required")
}

export async function addContractor(name: string, specialty: string, hourlyRate: number, phone: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
    
  await verifyGlobalAdmin(supabase, user.id)
  
  const { error } = await supabase.from('global_contractors').insert({
    name, specialty, hourly_rate: hourlyRate, phone
  })
  
  if (error) throw new Error("Failed to add contractor")
    
  revalidatePath('/admin')
}

export async function deleteContractor(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
    
  await verifyGlobalAdmin(supabase, user.id)
  
  const { error } = await supabase.from('global_contractors').delete().eq('id', id)
  
  if (error) throw new Error("Failed to delete contractor")
    
  revalidatePath('/admin')
}

export async function addCommission(tierName: string, percentage: number, description: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
    
  await verifyGlobalAdmin(supabase, user.id)
  
  const { error } = await supabase.from('global_commissions').insert({
    tier_name: tierName, percentage, description
  })
  
  if (error) throw new Error("Failed to add commission")
    
  revalidatePath('/admin')
}

export async function deleteCommission(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
    
  await verifyGlobalAdmin(supabase, user.id)
  
  const { error } = await supabase.from('global_commissions').delete().eq('id', id)
  
  if (error) throw new Error("Failed to delete commission")
    
  revalidatePath('/admin')
}
