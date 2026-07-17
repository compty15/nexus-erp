"use client";

import { Home, Package, Truck, Users, Settings, Wrench, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { Workspace } from "@/types/db";

interface SidebarProps {
  workspaces: Workspace[];
  activeTeamId: string;
  activeTeamName: string;
  isAdmin?: boolean;
}

const NAV_ITEMS = [
  { href: "/",          label: "Dashboard", icon: Home },
  { href: "/items",     label: "Inventory",  icon: Package },
  { href: "/services",  label: "Services",   icon: Wrench },
  { href: "/logistics", label: "Logistics",  icon: Truck },
  { href: "/customers", label: "Customers",  icon: Users },
];

export function Sidebar({ workspaces, activeTeamId, activeTeamName, isAdmin }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div
      className="fixed left-0 top-0 z-40 flex flex-col h-screen"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#070710]/90 backdrop-blur-xl border-r border-white/5" />

      {/* Subtle gradient edge */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />

      <div className="relative flex flex-col h-full">
        {/* Workspace switcher */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          <WorkspaceSwitcher
            workspaces={workspaces}
            activeTeamId={activeTeamId}
            activeTeamName={activeTeamName}
          />
        </div>

        {/* Primary nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-1 no-scrollbar">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-titanium-600">
            Navigation
          </p>

          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-xs font-semibold uppercase tracking-widest group",
                  active
                    ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    : "text-titanium-400 hover:bg-white/5 hover:text-white border border-transparent",
                ].join(" ")}
              >
                <Icon
                  size={15}
                  className={active ? "text-purple-400" : "text-titanium-500 group-hover:text-titanium-300"}
                />
                <span>{label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-white/5 flex flex-col gap-1">
          {isAdmin && (
            <Link
              href="/admin"
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold uppercase tracking-widest group border",
                isActive("/admin")
                  ? "bg-red-500/10 text-red-300 border-red-500/20"
                  : "text-red-400/70 hover:bg-red-500/5 hover:text-red-400 border-transparent",
              ].join(" ")}
            >
              <ShieldAlert size={15} />
              <span>Admin Portal</span>
            </Link>
          )}
          <Link
            href="/settings"
            className={[
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold uppercase tracking-widest group border",
              isActive("/settings")
                ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                : "text-titanium-400 hover:bg-white/5 hover:text-white border-transparent",
            ].join(" ")}
          >
            <Settings size={15} className="group-hover:rotate-45 transition-transform duration-300" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
