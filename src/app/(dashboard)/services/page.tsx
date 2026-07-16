import { createClient, getUserTeamId } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ServicesView } from "./ServicesView"

export default async function ServicesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const teamId = await getUserTeamId()

  if (!teamId) {
    redirect('/onboarding')
  }

  // Fetch services belonging to this team
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  return <ServicesView services={services || []} />
}
