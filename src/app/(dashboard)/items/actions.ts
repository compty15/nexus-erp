'use server'

import { createClient } from '@/utils/supabase/server'
import { getUserTeamId } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItem(title: string, description: string, priceStr: string, imageUrl: string, listings: any = null) {
  const supabase = await createClient()
  const teamId = await getUserTeamId()
  
  if (!teamId) {
    throw new Error("No active team session found.")
  }

  const price = priceStr ? parseFloat(priceStr.replace(/[^0-9.]/g, '')) : 0

  const { error } = await supabase.from('items').insert({
    team_id: teamId,
    title,
    description,
    price,
    image_url: imageUrl || null,
    listings: listings
  })

  if (error) {
    console.error("Error creating item:", error)
    throw new Error(error.message)
  }

  revalidatePath('/items')
  revalidatePath('/')
}
