"use server";

import { createClient, getUserTeamId } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createShipment(
  trackingId: string,
  carrier: string,
  origin: string,
  destination: string,
  etaStr?: string,
  notes?: string
) {
  const supabase = await createClient();
  const teamId = await getUserTeamId();
  if (!teamId) throw new Error("No active workspace found");

  const { error } = await supabase.from("logistics").insert({
    team_id:    teamId,
    tracking_id: trackingId  || null,
    carrier,
    origin:      origin      || null,
    destination,
    status:      "pending",                                       // lowercase — matches DB enum
    eta:         etaStr ? new Date(etaStr).toISOString() : null,
    notes:       notes       || null,
  });

  if (error) {
    console.error("[createShipment]", error);
    throw new Error(error.message);
  }

  revalidatePath("/logistics");
  revalidatePath("/");
  return { success: true };
}

export async function updateShipmentStatus(shipmentId: string, status: string) {
  const supabase = await createClient();
  const teamId = await getUserTeamId();
  if (!teamId) throw new Error("No active workspace");

  // Normalize status to lowercase DB enum values
  const normalizedStatus = status.toLowerCase().replace(" ", "_");

  const { error } = await supabase
    .from("logistics")
    .update({ status: normalizedStatus })
    .eq("id", shipmentId)
    .eq("team_id", teamId);

  if (error) {
    console.error("[updateShipmentStatus]", error);
    throw new Error(error.message);
  }

  revalidatePath("/logistics");
  revalidatePath("/");
  return { success: true };
}

export async function deleteShipment(shipmentId: string) {
  const supabase = await createClient();
  const teamId = await getUserTeamId();
  if (!teamId) throw new Error("No active workspace");

  const { error } = await supabase
    .from("logistics")
    .delete()
    .eq("id", shipmentId)
    .eq("team_id", teamId);

  if (error) {
    console.error("[deleteShipment]", error);
    throw new Error(error.message);
  }

  revalidatePath("/logistics");
  return { success: true };
}
