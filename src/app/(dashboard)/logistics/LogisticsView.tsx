"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Truck, Package, Clock, CheckCircle, ExternalLink, Search, Plus, AlertTriangle } from "lucide-react";
import { NewShipmentModal } from "@/components/NewShipmentModal";
import { updateShipmentStatus } from "./actions";
import { useRouter } from "next/navigation";
import type { Shipment } from "@/types/db";

// Carrier tracking URL builder
const getTrackingUrl = (carrier: string, trackingId: string | null) => {
  if (!trackingId) return null;
  const tn = encodeURIComponent(trackingId.trim());
  switch (carrier) {
    case "USPS":            return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tn}`;
    case "UPS":             return `https://www.ups.com/track?tracknum=${tn}`;
    case "FedEx":           return `https://www.fedex.com/fedextrack/?trknbr=${tn}`;
    case "DHL":             return `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${tn}`;
    case "Amazon Logistics":return `https://track.amazon.com/tracking/${tn}`;
    case "OnTrac":          return `https://www.ontrac.com/tracking/?number=${tn}`;
    case "XPO Logistics":   return `https://track.xpo.com/search?p=${tn}`;
    case "Estes":           return `https://www.estes-express.com/tracking/volume/${tn}`;
    case "Old Dominion":    return `https://www.odfl.com/Trace/Trace.jsp?action=trace&type=PRO&pro=${tn}`;
    default:                return `https://www.google.com/search?q=track+${tn}`;
  }
};

const STATUS_CONFIG: Record<Shipment["status"], { label: string; badge: string; dot: string }> = {
  pending:    { label: "Pending",    badge: "badge badge-amber",  dot: "bg-amber-400" },
  in_transit: { label: "In Transit", badge: "badge badge-blue",   dot: "bg-blue-400" },
  delayed:    { label: "Delayed",    badge: "badge badge-red",    dot: "bg-red-400" },
  delivered:  { label: "Delivered",  badge: "badge badge-green",  dot: "bg-emerald-400" },
};

export function LogisticsView({ shipments: initialShipments }: { shipments: Shipment[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [optimisticShipments, updateOptimistic] = useOptimistic(
    initialShipments,
    (state, { id, status }: { id: string; status: Shipment["status"] }) =>
      state.map((s) => (s.id === id ? { ...s, status } : s))
  );

  const filtered = optimisticShipments.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.tracking_id ?? "").toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q) ||
      s.carrier.toLowerCase().includes(q)
    );
  });

  const counts = {
    in_transit: filtered.filter((s) => s.status === "in_transit").length,
    pending:    filtered.filter((s) => s.status === "pending").length,
    delayed:    filtered.filter((s) => s.status === "delayed").length,
    delivered:  filtered.filter((s) => s.status === "delivered").length,
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const status = newStatus as Shipment["status"];
    startTransition(async () => {
      updateOptimistic({ id, status });
      try {
        await updateShipmentStatus(id, status);
        router.refresh();
      } catch {
        // Revert on failure handled by React's optimistic reset
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-titanium-500 mb-1">Operations</p>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Logistics Hub</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          New Shipment
        </button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: "in_transit", label: "In Transit",  icon: Truck,         color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
          { key: "pending",    label: "Pending",      icon: Package,       color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
          { key: "delayed",    label: "Delayed",      icon: AlertTriangle, color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
          { key: "delivered",  label: "Delivered",    icon: CheckCircle,   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        ].map(({ key, label, icon: Icon, color, bg, border }) => (
          <div key={key} className={`${bg} ${border} border rounded-2xl p-4 flex flex-col items-center gap-2 text-center`}>
            <Icon size={22} className={color} />
            <div className="text-2xl font-black text-white">{counts[key as keyof typeof counts]}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-titanium-500" />
        <input
          type="text"
          placeholder="Search by tracking ID, carrier, or destination…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-dark pl-11"
        />
      </div>

      {/* Shipments table */}
      <div className="border border-white/5 bg-black/40 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-titanium-500">Tracking ID</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-titanium-500">Carrier</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-titanium-500">Destination</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-titanium-500">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-titanium-500 text-right">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-titanium-600 text-xs font-bold uppercase tracking-widest">
                    <Truck size={24} className="mx-auto mb-3 opacity-30" />
                    No shipments found
                  </td>
                </tr>
              )}
              {filtered.map((s) => {
                const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.pending;
                const trackingUrl = getTrackingUrl(s.carrier, s.tracking_id ?? null);
                return (
                  <tr key={s.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      {trackingUrl && s.tracking_id ? (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-400 hover:text-purple-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
                        >
                          {s.tracking_id}
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-titanium-500 font-mono text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-titanium-300">{s.carrier}</td>
                    <td className="px-5 py-4 text-xs text-titanium-300">{s.destination}</td>
                    <td className="px-5 py-4">
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusChange(s.id, e.target.value)}
                        disabled={isPending}
                        className="bg-black/60 border border-white/10 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500/50 cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delayed">Delayed</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-titanium-400 font-mono">
                      {s.eta ? new Date(s.eta).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <NewShipmentModal onClose={() => { setShowModal(false); router.refresh(); }} />
      )}
    </div>
  );
}
