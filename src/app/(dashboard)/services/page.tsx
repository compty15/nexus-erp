import { createClient, getUserTeamId } from "@/utils/supabase/server";
import { ServicesView } from "./ServicesView";
import type { Service } from "@/types/db";

export default async function ServicesPage() {
  const supabase = await createClient();
  const teamId = await getUserTeamId();

  // No workspace → dashboard will handle the CTA to create one
  if (!teamId) {
    return <ServicesView services={[]} />;
  }

  let services: Service[] = [];
  try {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });
    services = (data as Service[]) ?? [];
  } catch (err) {
    console.error("[ServicesPage]", err);
  }

  return <ServicesView services={services} />;
}
