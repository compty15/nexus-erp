'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItem(title: string, description: string, priceStr: string, imageUrl: string, listings: any = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  const price = priceStr ? parseFloat(priceStr.replace(/[^0-9.]/g, '')) : 0

  const { error } = await supabase.from('inventory').insert({
    user_id: user.id,
    name: title,
    quantity: 1,
    status: 'identified',
    price_range: { min: price, max: price, currency: 'USD' },
    image_refs: imageUrl ? [imageUrl] : [],
    metadata: { 
      description,
      listings 
    }
  })

  if (error) {
    console.error("Error creating inventory item:", error)
    throw new Error(error.message)
  }

  revalidatePath('/items')
  revalidatePath('/')
}
