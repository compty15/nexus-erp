import { createClient } from "@/utils/supabase/server"
import { ShieldAlert, Users, Package, MapPin, Wrench, Building2, ClipboardCopy } from "lucide-react"
import { AdminClientView } from "./AdminClientView"

const ADMIN_SQL_SCRIPT = `-- 1. Insert yourself into global_admins
INSERT INTO public.global_admins (id) 
VALUES (auth.uid()) -- Note: if you are running this in the Supabase SQL editor, replace auth.uid() with your actual user UUID from auth.users!
ON CONFLICT (id) DO NOTHING;

-- 2. Create Global Admin RLS overrides
CREATE POLICY "Admins can view all teams" ON public.teams FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.global_admins WHERE global_admins.id = auth.uid())
);

CREATE POLICY "Admins can view all team members" ON public.team_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.global_admins WHERE global_admins.id = auth.uid())
);

CREATE POLICY "Admins can view all items" ON public.items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.global_admins WHERE global_admins.id = auth.uid())
);

CREATE POLICY "Admins can view all logistics" ON public.logistics FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.global_admins WHERE global_admins.id = auth.uid())
);

CREATE POLICY "Admins can view all services" ON public.services FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.global_admins WHERE global_admins.id = auth.uid())
);

CREATE POLICY "Admins can view all customers" ON public.customers FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.global_admins WHERE global_admins.id = auth.uid())
);
`

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center p-12 text-center">
        <ShieldAlert className="text-destructive mb-4" size={48} />
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground max-w-md">You must be logged in to access the Admin Portal.</p>
      </div>
    )
  }

  // Check if they are a global admin
  const { data: adminCheck, error: adminError } = await supabase
    .from('global_admins')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log("Admin Check:", { adminCheck, adminError, userId: user.id })

  const isAdmin = !!adminCheck

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-destructive" size={32} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-destructive">Admin Portal Locked</h1>
            <p className="text-muted-foreground mt-1">You do not have global administrative privileges.</p>
            <p className="text-muted-foreground mt-1 text-xs">Debug: adminCheck: {JSON.stringify(adminCheck)}, error: {JSON.stringify(adminError)}</p>
          </div>
        </div>

        <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-6 mt-4">
          <h2 className="text-xl font-bold text-destructive mb-4">How to promote yourself:</h2>
          <p className="text-sm mb-4">
            Since you are the owner of this application, you must manually grant yourself the Global Admin role inside your Supabase Database to bypass the strict Row Level Security (RLS) protections.
          </p>
          <div className="bg-background border border-border rounded-lg p-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap relative">
            <span className="text-muted-foreground">-- Step 1: Replace auth.uid() below with your actual UUID from the auth.users table.</span><br/>
            <span className="text-muted-foreground">-- Step 2: Run this script in the Supabase SQL Editor.</span><br/><br/>
            {ADMIN_SQL_SCRIPT}
          </div>
        </div>
      </div>
    )
  }

  // If we got here, they are an admin! 
  // Fetch global telemetry metrics
  const [{ count: totalTeams }, { count: totalItems }, { count: totalShipments }, { count: totalServices }, { count: totalCustomers }, { data: contractors }, { data: commissions }] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('items').select('*', { count: 'exact', head: true }),
    supabase.from('logistics').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('global_contractors').select('*').order('created_at', { ascending: false }),
    supabase.from('global_commissions').select('*').order('created_at', { ascending: false })
  ])

  const stats = { totalTeams, totalItems, totalShipments, totalServices, totalCustomers }

  return <AdminClientView stats={stats} contractors={contractors || []} commissions={commissions || []} />
}
