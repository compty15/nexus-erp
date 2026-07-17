import { BarChart3, Package, Users, Truck } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getUserTeamId } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient()
  const teamId = await getUserTeamId()

  if (!teamId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center max-w-md mx-auto animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-sm shadow-primary/10">
          <Package size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Nexx-Top</h1>
          <p className="text-muted-foreground mt-2">
            You don't have an active workspace yet. Workspaces let you organize items, services, logistics, and customer lists.
          </p>
        </div>
        <a 
          href="/settings?tab=workspaces" 
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Go to Settings & Create Workspace
        </a>
      </div>
    );
  }

  // Fetch real counts and recent data
  const [
    { count: itemsCount }, 
    { count: servicesCount }, 
    { count: customersCount },
    { count: logisticsCount },
    { data: recentItems },
    { data: recentCustomers }
  ] = await Promise.all([
    supabase.from('items').select('*', { count: 'exact', head: true }).eq('team_id', teamId),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('team_id', teamId),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('team_id', teamId),
    supabase.from('logistics').select('*', { count: 'exact', head: true }).eq('team_id', teamId),
    supabase.from('items').select('*').eq('team_id', teamId).order('created_at', { ascending: false }).limit(5),
    supabase.from('customers').select('*').eq('team_id', teamId).order('created_at', { ascending: false }).limit(5)
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your operations and analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          title="Total Items" 
          value={(itemsCount || 0).toString()} 
          trend="Live Inventory" 
          icon={<Package className="text-primary" size={24} />} 
        />
        <DashboardCard 
          title="Active Services" 
          value={(servicesCount || 0).toString()} 
          trend="Live Services" 
          icon={<BarChart3 className="text-primary" size={24} />} 
        />
        <DashboardCard 
          title="Active Shipments" 
          value={(logisticsCount || 0).toString()} 
          trend="Live Logistics" 
          icon={<Truck className="text-primary" size={24} />} 
        />
        <DashboardCard 
          title="Total Customers" 
          value={(customersCount || 0).toString()} 
          trend="Live CRM" 
          icon={<Users className="text-primary" size={24} />} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 border border-border bg-card rounded-xl p-6 shadow-sm">
           <h2 className="text-lg font-semibold mb-4">Recently Added Items</h2>
           {recentItems && recentItems.length > 0 ? (
             <div className="flex flex-col gap-3">
               {recentItems.map((item) => (
                 <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                   <div className="flex flex-col">
                     <span className="font-medium text-sm">{item.name}</span>
                     <span className="text-xs text-muted-foreground">{item.description || "No description"}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-semibold">{item.quantity} in stock</span>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-lg text-muted-foreground">
               No recent items to display.
             </div>
           )}
        </div>
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
           <h2 className="text-lg font-semibold mb-4">Newest Customers</h2>
           {recentCustomers && recentCustomers.length > 0 ? (
             <div className="flex flex-col gap-3">
               {recentCustomers.map((customer) => (
                 <div key={customer.id} className="flex flex-col border-b border-border pb-3 last:border-0">
                   <span className="font-medium text-sm">{customer.name}</span>
                   <span className="text-xs text-muted-foreground">{customer.email || customer.phone || "No contact info"}</span>
                 </div>
               ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                No active customers.
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col gap-2 transition-all hover:border-primary/50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{trend}</div>
    </div>
  )
}
