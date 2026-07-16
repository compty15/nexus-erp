import { createClient, getUserTeamId } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { LogisticsView } from "./LogisticsView"

export default async function LogisticsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const teamId = await getUserTeamId()

  if (!teamId) {
    redirect('/onboarding')
  }

  // Fetch shipments belonging to this team
  const { data: shipments } = await supabase
    .from('logistics')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  return <LogisticsView shipments={shipments || []} />
}
