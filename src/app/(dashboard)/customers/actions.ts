"use server";

import { createClient, getUserTeamId } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCustomer(
  type: "b2b" | "b2c",
  name: string,
  email?: string,
  phone?: string,
  address?: string,
  notes?: string,
  totalVolume = 0
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const teamId = await getUserTeamId();
  if (!teamId) throw new Error("No active workspace found");

  const { error } = await supabase.from("customers").insert({
    team_id: teamId,
    type,                              // 'b2b' | 'b2c' (lowercase — matches DB enum)
    name,
    email:        email     || null,
    phone:        phone     || null,
    address:      address   || null,
    notes:        notes     || null,
    status:       "active",
    total_volume: totalVolume,
  });

  if (error) {
    console.error("[createCustomer]", error);
    throw new Error(error.message);
  }

  revalidatePath("/customers");
  revalidatePath("/");
  return { success: true };
}

export async function updateCustomer(
  customerId: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    status?: "active" | "inactive" | "archived";
    total_volume?: number;
  }
) {
  const supabase = await createClient();
  const teamId = await getUserTeamId();
  if (!teamId) throw new Error("No active workspace");

  const { error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", customerId)
    .eq("team_id", teamId);

  if (error) {
    console.error("[updateCustomer]", error);
    throw new Error(error.message);
  }

  revalidatePath("/customers");
  return { success: true };
}

export async function deleteCustomer(customerId: string) {
  const supabase = await createClient();
  const teamId = await getUserTeamId();
  if (!teamId) throw new Error("No active workspace");

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId)
    .eq("team_id", teamId);

  if (error) {
    console.error("[deleteCustomer]", error);
    throw new Error(error.message);
  }

  revalidatePath("/customers");
  return { success: true };
}
