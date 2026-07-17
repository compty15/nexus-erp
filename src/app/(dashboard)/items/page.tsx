import ItemsView from "./ItemsView"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function ItemsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch items for this user from the inventory table
  const { data: items, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching inventory:", error)
  }

  return <ItemsView initialItems={items || []} />
}
