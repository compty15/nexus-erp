"use server";

import { createClient, getUserTeamId } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createService(
  name: string,
  description: string,
  price: number,
  duration: string,
  category?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const teamId = await getUserTeamId();
  if (!teamId) throw new Error("No active workspace found");

  const { error } = await supabase.from("services").insert({
    team_id: teamId,
    name,
    description: description || null,
    price,
    duration: duration || null,
    status: "active",
    ...(category ? { category } : {}),
  });

  if (error) {
    console.error("[createService]", error);
    throw new Error(error.message);
  }

  revalidatePath("/services");
  revalidatePath("/");
  return { success: true };
}

export async function updateService(
  serviceId: string,
  updates: { name?: string; description?: string; price?: number; status?: string; duration?: string }
) {
  const supabase = await createClient();
  const teamId = await getUserTeamId();
  if (!teamId) throw new Error("No active workspace");

  const { error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", serviceId)
    .eq("team_id", teamId);

  if (error) {
    console.error("[updateService]", error);
    throw new Error(error.message);
  }

  revalidatePath("/services");
  return { success: true };
}

export async function deleteService(serviceId: string) {
  const supabase = await createClient();
  const teamId = await getUserTeamId();
  if (!teamId) throw new Error("No active workspace");

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("team_id", teamId);

  if (error) {
    console.error("[deleteService]", error);
    throw new Error(error.message);
  }

  revalidatePath("/services");
  return { success: true };
}
