import { createClient, getUserTeamId } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { CustomersView } from "./CustomersView"

export default async function CustomersPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const teamId = await getUserTeamId()

  if (!teamId) {
    redirect('/onboarding')
  }

  // Fetch customers belonging to this team
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  return <CustomersView customers={customers || []} />
}
