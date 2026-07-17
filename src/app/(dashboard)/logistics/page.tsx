import { createClient, getUserTeamId } from "@/utils/supabase/server";
import { LogisticsView } from "./LogisticsView";
import type { Shipment } from "@/types/db";

export default async function LogisticsPage() {
  const supabase = await createClient();
  const teamId = await getUserTeamId();

  if (!teamId) {
    return <LogisticsView shipments={[]} />;
  }

  let shipments: Shipment[] = [];
  try {
    const { data } = await supabase
      .from("logistics")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });
    shipments = (data as Shipment[]) ?? [];
  } catch (err) {
    console.error("[LogisticsPage]", err);
  }

  return <LogisticsView shipments={shipments} />;
}
