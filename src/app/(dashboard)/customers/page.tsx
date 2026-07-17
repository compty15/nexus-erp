import { createClient, getUserTeamId } from "@/utils/supabase/server";
import { CustomersView } from "./CustomersView";
import type { Customer } from "@/types/db";

export default async function CustomersPage() {
  const supabase = await createClient();
  const teamId = await getUserTeamId();

  if (!teamId) {
    return <CustomersView customers={[]} />;
  }

  let customers: Customer[] = [];
  try {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });
    customers = (data as Customer[]) ?? [];
  } catch (err) {
    console.error("[CustomersPage]", err);
  }

  return <CustomersView customers={customers} />;
}
