'use server'

import { createClient, getUserTeamId } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createShipment(trackingId: string, carrier: string, destination: string, etaStr: string) {
  const supabase = await createClient()
  const teamId = await getUserTeamId()

  if (!teamId) throw new Error("No active team found")

  const { error } = await supabase
    .from('logistics')
    .insert({
      team_id: teamId,
      tracking_id: trackingId,
      carrier,
      status: 'In Transit', // default status
      destination,
      eta: etaStr ? new Date(etaStr).toISOString() : null
    })

  if (error) {
    console.error("Error creating shipment:", error)
    throw new Error("Failed to create shipment")
  }

  revalidatePath('/logistics')
  revalidatePath('/')
  return { success: true }
}

export async function updateShipmentStatus(shipmentId: string, status: string) {
  const supabase = await createClient()
  const teamId = await getUserTeamId()

  if (!teamId) throw new Error("No active team found")

  const { error } = await supabase
    .from('logistics')
    .update({ status })
    .eq('id', shipmentId)
    .eq('team_id', teamId)

  if (error) {
    console.error("Error updating shipment:", error)
    throw new Error("Failed to update shipment status")
  }

  revalidatePath('/logistics')
  revalidatePath('/')
  return { success: true }
}
