import ItemsView from "./ItemsView"
import { createClient } from "@/utils/supabase/server"
import { getUserTeamId } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function ItemsPage() {
  const supabase = await createClient()
  const teamId = await getUserTeamId()

  if (!teamId) {
    redirect('/onboarding')
  }

  // Fetch items for this team
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching items:", error)
  }

  return <ItemsView initialItems={items || []} />
}
