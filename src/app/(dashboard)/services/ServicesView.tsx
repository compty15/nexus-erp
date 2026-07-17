"use client";

import { useState } from "react";
import { Wrench, Search, Plus, Clock, DollarSign } from "lucide-react";
import { NewServiceModal } from "@/components/NewServiceModal";
import { useRouter } from "next/navigation";
import type { Service } from "@/types/db";

const STATUS_BADGE: Record<Service["status"], string> = {
  active:   "badge badge-green",
  inactive: "badge badge-amber",
  archived: "badge badge-gray",
};

export function ServicesView({ services = [] }: { services?: Service[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Service["status"]>("all");

  const filtered = services.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      (s.name ?? "").toLowerCase().includes(q) ||
      (s.description ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {showModal && (
        <NewServiceModal onClose={() => { setShowModal(false); router.refresh(); }} />
      )}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-titanium-500 mb-1">Catalogue</p>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Services</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-titanium-500" />
          <input
            type="text"
            placeholder="Search services by name or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-11"
          />
        </div>
        <div className="flex items-center gap-1 border border-white/5 rounded-xl bg-black/40 p-1">
          {(["all", "active", "inactive", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all capitalize ${
                statusFilter === f
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-titanium-500 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Services grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-2xl text-titanium-600 gap-3">
          <Wrench size={32} className="opacity-30" />
          <span className="text-xs font-bold uppercase tracking-widest">
            {search || statusFilter !== "all" ? "No services match your filters" : "No services yet — add your first"}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="border border-white/5 bg-black/40 rounded-2xl p-5 hover:border-purple-500/20 hover:bg-black/50 transition-all backdrop-blur-xl group flex flex-col gap-4"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Wrench size={16} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-white group-hover:text-purple-200 transition-colors">
                      {s.name}
                    </h2>
                    <span className={`${STATUS_BADGE[s.status] ?? STATUS_BADGE.active} mt-1 inline-flex`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {s.description && (
                <p className="text-titanium-400 text-xs leading-relaxed line-clamp-2">{s.description}</p>
              )}

              {/* Footer */}
              <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <DollarSign size={13} className="text-emerald-400" />
                  <span className="text-sm font-black text-white font-mono">
                    {Number(s.price).toFixed(2)}
                  </span>
                </div>
                {s.duration && (
                  <div className="flex items-center gap-1.5 text-titanium-500 text-[10px] font-bold uppercase tracking-widest">
                    <Clock size={11} className="text-purple-400" />
                    <span>{s.duration}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
