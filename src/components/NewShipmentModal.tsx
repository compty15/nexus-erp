"use client";

import { useState } from "react";
import { X, Loader2, Truck } from "lucide-react";
import { createShipment } from "@/app/(dashboard)/logistics/actions";

export const CARRIERS = [
  "USPS", "UPS", "FedEx", "DHL", "Amazon Logistics",
  "OnTrac", "LaserShip", "XPO Logistics", "Estes", "Old Dominion",
];

export function NewShipmentModal({ onClose }: { onClose: () => void }) {
  const [carrier, setCarrier] = useState(CARRIERS[0]);
  const [trackingId, setTrackingId] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [eta, setEta] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) { setError("Destination is required."); return; }
    setIsSaving(true);
    setError("");
    try {
      await createShipment(trackingId.trim(), carrier, origin.trim(), destination.trim(), eta, notes.trim());
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save shipment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md mx-4 bg-[#0a0a0f] border border-white/8 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-in">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Truck size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-titanium-500">Logistics</p>
              <h2 className="text-sm font-black text-white">Track New Shipment</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-titanium-400" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">

          {/* Carrier */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Carrier</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="input-dark"
            >
              {CARRIERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tracking number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">
              Tracking Number / PRO
            </label>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. 1Z9999999999999999"
              className="input-dark font-mono"
            />
          </div>

          {/* Origin + Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Origin</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Chicago, IL"
                className="input-dark"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">
                Destination <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Dallas, TX"
                className="input-dark"
              />
            </div>
          </div>

          {/* ETA */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">ETA (Estimated Arrival)</label>
            <input
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="input-dark"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Fragile, signature required, etc."
              className="input-dark"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-semibold">{error}</p>
          )}

          <div className="pt-2 flex justify-end gap-3 border-t border-white/5">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              type="submit"
              disabled={isSaving || !destination.trim()}
              className="btn-primary"
            >
              {isSaving && <Loader2 size={15} className="animate-spin" />}
              Track Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
