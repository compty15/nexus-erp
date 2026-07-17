"use server";

import { createClient, getUserTeamId } from "@/utils/supabase/server";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getUserWorkspaces() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: memberships } = await supabase
      .from("team_members")
      .select("team_id, teams ( id, name )")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Supabase returns joined relations as arrays; flatten and cast
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return memberships?.flatMap((m: any) => (Array.isArray(m.teams) ? m.teams : [m.teams])).filter(Boolean) ?? [];
  } catch {
    return [];
  }
}

export async function switchWorkspace(teamId: string) {
  const cookieStore = await cookies();
  cookieStore.set("active_team_id", teamId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getWorkspaceName() {
  try {
    const supabase = await createClient();
    const teamId = await getUserTeamId();
    if (!teamId) return "";
    const { data } = await supabase
      .from("teams")
      .select("name")
      .eq("id", teamId)
      .single();
    return data?.name ?? "";
  } catch {
    return "";
  }
}

export async function inviteUserByEmail(email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const teamId = await getUserTeamId();

  if (!user || !teamId) throw new Error("Unauthorized or no active workspace.");

  const token = crypto.randomUUID();

  // expires_at is required by the invites table constraint
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7-day TTL

  const { error } = await supabase.from("invites").insert({
    team_id:    teamId,
    created_by: user.id,           // correct column name
    email:      email,             // correct column name
    token,
    status:     "pending",
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error("[inviteUserByEmail]", error);
    throw new Error("Failed to create invite: " + error.message);
  }

  const headersList = await headers();
  const host     = headersList.get("host") ?? "nexx-top.vercel.app";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const joinLink = `${protocol}://${host}/join?token=${token}`;

  return { success: true, link: joinLink };
}

export async function renameWorkspace(newName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const teamId = await getUserTeamId();

  if (!user || !teamId) throw new Error("Unauthorized or no active workspace.");

  const { data: member } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!member || member.role !== "owner") {
    throw new Error("Only the workspace owner can rename it.");
  }

  const { error } = await supabase
    .from("teams")
    .update({ name: newName.trim() })
    .eq("id", teamId);

  if (error) {
    console.error("[renameWorkspace]", error);
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function createNewWorkspace(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized.");

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ name: name.trim(), owner_id: user.id })
    .select()
    .single();

  if (teamError || !team) {
    console.error("[createNewWorkspace] team insert:", teamError);
    throw new Error(teamError?.message ?? "Failed to create workspace.");
  }

  const { error: memberError } = await supabase
    .from("team_members")
    .insert({ team_id: team.id, user_id: user.id, role: "owner" });

  if (memberError) {
    console.error("[createNewWorkspace] member insert:", memberError);
    throw new Error(memberError.message ?? "Failed to join workspace.");
  }

  const cookieStore = await cookies();
  cookieStore.set("active_team_id", team.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/", "layout");
  return { success: true, teamId: team.id };
}
