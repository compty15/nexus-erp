import { BarChart3, Package, Users, Truck, Wrench, TrendingUp, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getUserTeamId } from "@/utils/supabase/server";
import Link from "next/link";
import type { InventoryItem, Customer } from "@/types/db";

export default async function Home() {
  const supabase = await createClient();
  const teamId = await getUserTeamId();

  if (!teamId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center max-w-md mx-auto animate-fade-in">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center border border-purple-500/20 bg-purple-500/10 shadow-2xl shadow-purple-500/10">
          <Package size={36} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase text-glow-uv">
            Welcome to Nexx-Top
          </h1>
          <p className="text-titanium-400 text-sm mt-3 leading-relaxed max-w-xs mx-auto">
            Create a workspace to start managing your inventory, services, logistics, and customers.
          </p>
        </div>
        <a
          href="/settings?tab=workspaces"
          className="btn-primary text-sm px-8 py-3 shadow-lg shadow-purple-500/20"
        >
          Create Your First Workspace
          <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  // Safe count fetcher — never throws, returns 0 on error
  const fetchCount = async (table: string, filterCol = "team_id") => {
    try {
      const { count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq(filterCol, teamId);
      return count ?? 0;
    } catch {
      return 0;
    }
  };

  // Safe recent fetcher — never throws, returns [] on error
  const fetchRecent = async <T,>(
    table: string,
    limit = 5,
    filterCol = "team_id"
  ): Promise<T[]> => {
    try {
      const { data } = await supabase
        .from(table)
        .select("*")
        .eq(filterCol, filterCol === "user_id" ? (await supabase.auth.getUser()).data.user?.id ?? teamId : teamId)
        .order("created_at", { ascending: false })
        .limit(limit);
      return (data as T[]) ?? [];
    } catch {
      return [];
    }
  };

  const [
    itemsCount,
    servicesCount,
    customersCount,
    logisticsCount,
    recentItems,
    recentCustomers,
  ] = await Promise.all([
    fetchCount("inventory", "user_id"),
    fetchCount("services"),
    fetchCount("customers"),
    fetchCount("logistics"),
    fetchRecent<InventoryItem>("inventory", 5, "user_id"),
    fetchRecent<Customer>("customers", 5),
  ]);

  const stats = [
    {
      title: "Inventory Items",
      value: itemsCount,
      sub: "In stock",
      icon: Package,
      color: "text-blue-400",
      glow: "shadow-blue-500/10",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      href: "/items",
    },
    {
      title: "Services Offered",
      value: servicesCount,
      sub: "Active listings",
      icon: Wrench,
      color: "text-emerald-400",
      glow: "shadow-emerald-500/10",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      href: "/services",
    },
    {
      title: "Active Shipments",
      value: logisticsCount,
      sub: "In logistics",
      icon: Truck,
      color: "text-amber-400",
      glow: "shadow-amber-500/10",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      href: "/logistics",
    },
    {
      title: "CRM Contacts",
      value: customersCount,
      sub: "Total customers",
      icon: Users,
      color: "text-purple-400",
      glow: "shadow-purple-500/10",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      href: "/customers",
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-titanium-500 mb-1">Overview</p>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          <TrendingUp size={12} />
          <span>Live Data</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ title, value, sub, icon: Icon, color, glow, bg, border, href }) => (
          <Link
            key={title}
            href={href}
            className={`group border ${border} ${bg} rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.02] transition-all duration-200 shadow-xl ${glow} backdrop-blur-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-titanium-400">
                {title}
              </span>
              <Icon size={18} className={color} />
            </div>
            <div className="text-4xl font-black tracking-tight text-white">{value}</div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-titanium-500">{sub}</span>
              <ArrowRight size={12} className="text-titanium-600 group-hover:text-titanium-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent items */}
        <div className="lg:col-span-2 border border-white/5 bg-black/40 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Recently Added Items</h2>
            <Link href="/items" className="text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          {recentItems.length > 0 ? (
            <div className="flex flex-col divide-y divide-white/5">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Package size={14} className="text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">{item.name}</span>
                      <span className="text-[10px] text-titanium-500 uppercase tracking-wide">
                        {item.category ?? "Uncategorized"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/5 text-titanium-300 px-2 py-1 rounded-lg">
                    {item.quantity ?? 0} in stock
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-white/5 rounded-xl text-titanium-600 text-xs font-bold uppercase tracking-widest gap-3">
              <Package size={24} className="opacity-30" />
              No items yet — add your first item
            </div>
          )}
        </div>

        {/* Recent customers */}
        <div className="border border-white/5 bg-black/40 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Newest Customers</h2>
            <Link href="/customers" className="text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          {recentCustomers.length > 0 ? (
            <div className="flex flex-col divide-y divide-white/5">
              {recentCustomers.map((c) => {
                const parts = (c.name ?? "?").split(" ");
                const initials = parts.length >= 2
                  ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                  : (c.name ?? "?").substring(0, 2).toUpperCase();
                return (
                  <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-[11px] font-black text-purple-400">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-white block truncate">{c.name}</span>
                      <span className="text-[10px] text-titanium-500 font-mono truncate block">
                        {c.email ?? c.phone ?? "No contact"}
                      </span>
                    </div>
                    <span className={`ml-auto badge ${c.type === "b2b" ? "badge-blue" : "badge-purple"} flex-shrink-0`}>
                      {c.type?.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-white/5 rounded-xl text-titanium-600 text-xs font-bold uppercase tracking-widest gap-3">
              <Users size={24} className="opacity-30" />
              No customers yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
