'use server'

import { createClient, getUserTeamId } from "@/utils/supabase/server"
import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getUserWorkspaces() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: memberships } = await supabase
    .from('team_members')
    .select(`
      team_id,
      teams (
        id,
        name
      )
    `)
    .eq('user_id', user.id)

  return memberships?.map((m: any) => m.teams) || []
}

export async function switchWorkspace(teamId: string) {
  const cookieStore = await cookies()
  cookieStore.set('active_team_id', teamId, { path: '/' })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function getWorkspaceName() {
  const supabase = await createClient()
  const teamId = await getUserTeamId()
  
  if (!teamId) return ""

  const { data } = await supabase
    .from('teams')
    .select('name')
    .eq('id', teamId)
    .single()
    
  return data?.name || ""
}

export async function inviteUserByEmail(email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const teamId = await getUserTeamId()
  
  if (!user || !teamId) {
    throw new Error("Unauthorized or no active team.")
  }
  
  // Generate a random token
  const token = crypto.randomUUID()
  
  // Insert into invites table
  const { error } = await supabase
    .from('invites')
    .insert({
      team_id: teamId,
      inviter_id: user.id,
      invitee_email: email,
      token: token
    })
    
  if (error) {
    console.error("Invite error:", error)
    throw new Error("Failed to create invite.")
  }
  
  const headersList = await headers()
  const host = headersList.get("host") || "nexx-top.vercel.app"
  const protocol = host.startsWith("localhost") ? "http" : "https"
  const joinLink = `${protocol}://${host}/join?token=${token}`
  console.log(`Generated invite link: ${joinLink}`)
  
  // Return the join link so the UI can display it for the user to copy
  return { success: true, link: joinLink }
}

export async function renameWorkspace(newName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const teamId = await getUserTeamId()
  
  if (!user || !teamId) {
    throw new Error("Unauthorized or no active team.")
  }

  // Check if they are the owner
  const { data: member } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'owner') {
    throw new Error("Only the owner can rename the workspace.")
  }

  const { error } = await supabase
    .from('teams')
    .update({ name: newName })
    .eq('id', teamId)

  if (error) {
    console.error("Rename error:", error)
    throw new Error("Failed to rename workspace.")
  }

  return { success: true }
}
