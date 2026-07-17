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

export async function getAdminTelemetry() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  await verifyGlobalAdmin(supabase, user.id)

  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
  if (pError) throw pError

  const { data: memberships, error: mError } = await supabase
    .from('team_members')
    .select('user_id, team_id, teams(name)')
  if (mError) throw mError

  const { data: items, error: iError } = await supabase
    .from('items')
    .select('team_id')
  if (iError) throw iError

  const itemsCountMap: { [key: string]: number } = {}
  items?.forEach((item: any) => {
    itemsCountMap[item.team_id] = (itemsCountMap[item.team_id] || 0) + 1
  })

  const userTeamsMap: { [key: string]: any[] } = {}
  memberships?.forEach((m: any) => {
    if (!userTeamsMap[m.user_id]) userTeamsMap[m.user_id] = []
    userTeamsMap[m.user_id].push({
      id: m.team_id,
      name: m.teams?.name || "Unnamed Team",
      itemsCount: itemsCountMap[m.team_id] || 0
    })
  })

  const formattedUsers = profiles.map((p: any) => ({
    id: p.id,
    email: p.email || "Unknown Email",
    role: p.role || "user",
    workspaces: userTeamsMap[p.id] || []
  }))

  const { data: configs } = await supabase
    .from('app_config')
    .select('*')

  const billingConfig = configs?.find((c: any) => c.id === 'billing_status')?.config_value || {
    total_budget: 500,
    remaining_balance: 500,
    total_spent: 0,
    last_usage: "Never"
  }

  const systemConfig = configs?.find((c: any) => c.id === 'system_status')?.config_value || {
    state: "Active",
    reason: "No policy violations detected",
    last_updated: "2026-07-16"
  }

  return {
    users: formattedUsers,
    billing: billingConfig,
    system: systemConfig
  }
}

export async function updateBillingConfig(totalBudget: number, remainingBalance: number, totalSpent: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  await verifyGlobalAdmin(supabase, user.id)

  const { error } = await supabase
    .from('app_config')
    .update({
      config_value: {
        total_budget: totalBudget,
        remaining_balance: remainingBalance,
        total_spent: totalSpent,
        last_usage: new Date().toISOString().split('T')[0]
      }
    })
    .eq('id', 'billing_status')

  if (error) throw error
  revalidatePath('/admin')
}

export async function updateSystemConfig(state: "Active" | "Locked", reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  await verifyGlobalAdmin(supabase, user.id)

  const { error } = await supabase
    .from('app_config')
    .update({
      config_value: {
        state,
        reason,
        last_updated: new Date().toISOString().split('T')[0]
      }
    })
    .eq('id', 'system_status')

  if (error) throw error
  revalidatePath('/admin')
}
