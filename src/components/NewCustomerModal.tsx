"use client";

import { useState } from "react";
import { X, Loader2, Users } from "lucide-react";
import { createCustomer } from "@/app/(dashboard)/customers/actions";

export function NewCustomerModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"b2b" | "b2c">("b2c");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Customer name is required."); return; }
    setIsSaving(true);
    setError("");
    try {
      await createCustomer(type, name.trim(), email.trim(), phone.trim(), address.trim(), notes.trim());
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save customer. Please try again.");
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
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Users size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-titanium-500">CRM</p>
              <h2 className="text-sm font-black text-white">Add Customer</h2>
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

          {/* Type toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Customer Type</label>
            <div className="flex items-center gap-1 border border-white/5 rounded-xl bg-black/40 p-1">
              {([["b2c", "B2C — Consumer"], ["b2b", "B2B — Business"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setType(val)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    type === val
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "text-titanium-500 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">
              Name / Company <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "b2b" ? "Acme Corp" : "John Smith"}
              className="input-dark"
            />
          </div>

          {/* Email + Phone row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="input-dark"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="input-dark"
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Dallas, TX"
              className="input-dark"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any relevant notes…"
              rows={2}
              className="input-dark resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-semibold">{error}</p>
          )}

          <div className="pt-2 flex justify-end gap-3 border-t border-white/5">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="btn-primary"
            >
              {isSaving && <Loader2 size={15} className="animate-spin" />}
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
