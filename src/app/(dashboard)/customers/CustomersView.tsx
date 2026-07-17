"use client";

import { useState } from "react";
import { Building2, User, Mail, Phone, Search, Plus, Users, MapPin, DollarSign } from "lucide-react";
import { NewCustomerModal } from "@/components/NewCustomerModal";
import { useRouter } from "next/navigation";
import type { Customer } from "@/types/db";

const STATUS_BADGE: Record<Customer["status"], string> = {
  active:   "badge badge-green",
  inactive: "badge badge-amber",
  archived: "badge badge-gray",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function CustomersView({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "b2b" | "b2c">("all");

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      (c.name ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q);
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-titanium-500 mb-1">CRM</p>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Customers</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",    value: customers.length,                              color: "text-white" },
          { label: "B2B",      value: customers.filter(c => c.type === "b2b").length, color: "text-blue-400" },
          { label: "B2C",      value: customers.filter(c => c.type === "b2c").length, color: "text-purple-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border border-white/5 bg-black/40 rounded-xl p-4 text-center backdrop-blur-xl">
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-titanium-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-titanium-500" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-11"
          />
        </div>
        <div className="flex items-center gap-1 border border-white/5 rounded-xl bg-black/40 p-1">
          {(["all", "b2b", "b2c"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                typeFilter === t
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-titanium-500 hover:text-white"
              }`}
            >
              {t === "all" ? "All" : t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Customer cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-white/5 rounded-2xl text-titanium-600 gap-3">
          <Users size={32} className="opacity-30" />
          <span className="text-xs font-bold uppercase tracking-widest">
            {search || typeFilter !== "all" ? "No customers match your filters" : "No customers yet — add your first"}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const initials = getInitials(c.name ?? "?");
            const statusCls = STATUS_BADGE[c.status] ?? STATUS_BADGE.active;
            const isB2B = c.type === "b2b";
            return (
              <div
                key={c.id}
                className="border border-white/5 bg-black/40 rounded-2xl p-5 hover:border-purple-500/20 hover:bg-black/50 transition-all backdrop-blur-xl group flex flex-col gap-4"
              >
                {/* Avatar + name */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      isB2B ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" : "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                    }`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-purple-200 transition-colors">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        {isB2B ? <Building2 size={11} className="text-blue-400" /> : <User size={11} className="text-purple-400" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-titanium-500">
                          {isB2B ? "B2B Partner" : "B2C Customer"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={statusCls}>{c.status}</span>
                </div>

                {/* Contact info */}
                <div className="flex flex-col gap-1.5 text-xs text-titanium-400">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-titanium-600 flex-shrink-0" />
                    <span className="truncate">{c.email ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-titanium-600 flex-shrink-0" />
                    <span>{c.phone ?? "—"}</span>
                  </div>
                  {c.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-titanium-600 flex-shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <DollarSign size={12} className="text-emerald-500" />
                    <span className="font-bold text-white">
                      {Number(c.total_volume).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-titanium-500">volume</span>
                  </div>
                  {c.notes && (
                    <span className="text-[10px] text-titanium-600 italic truncate max-w-[100px]">{c.notes}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <NewCustomerModal onClose={() => { setShowModal(false); router.refresh(); }} />
      )}
    </div>
  );
}
