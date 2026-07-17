import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Standard server client — uses the anon key + RLS.
 * Use for all regular user-scoped queries.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — cookie mutations are no-ops (safe to ignore)
          }
        },
      },
    }
  );
}

/**
 * Admin client — uses the service role key, bypasses RLS.
 * Use ONLY in server actions gated behind admin middleware.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // no-op in server components
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Resolves the active team ID for the current user.
 *
 * Priority:
 *   1. `active_team_id` cookie (set when user switches workspace)
 *   2. First team_membership by created_at (most recently created)
 *
 * Returns null if the user has no team memberships.
 */
export async function getUserTeamId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const cookieStore = await cookies();
    const activeTeamId = cookieStore.get("active_team_id")?.value;

    // Validate the cookie team — user must actually be a member
    if (activeTeamId) {
      const { data } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .eq("team_id", activeTeamId)
        .maybeSingle();

      if (data?.team_id) return data.team_id;
    }

    // Fallback: newest team membership
    const { data: membership } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return membership?.team_id ?? null;
  } catch (err) {
    console.error("[getUserTeamId]", err);
    return null;
  }
}
