"use client";

import { useState } from "react";
import { X, Loader2, Wrench } from "lucide-react";
import { createService } from "@/app/(dashboard)/services/actions";

const SERVICE_CATEGORIES = [
  "Handyman Services",
  "Contractor Services",
  "Commission Sales",
  "Logistics & Delivery",
  "Technical Support",
  "Consulting",
  "Photography / Media",
  "Cleaning & Maintenance",
  "Custom Project",
  "Other",
];

export function NewServiceModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Service name is required."); return; }
    setIsSaving(true);
    setError("");
    try {
      await createService(name.trim(), description.trim(), parseFloat(price) || 0, duration.trim(), category);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save service. Please try again.");
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
              <Wrench size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-titanium-500">New Entry</p>
              <h2 className="text-sm font-black text-white">Add Service</h2>
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
          {/* Service name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">
              Service Name <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AC Repair, Resume Writing, Photography"
              className="input-dark"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-dark"
            >
              <option value="">Select a category…</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this service include?"
              rows={2}
              className="input-dark resize-none"
            />
          </div>

          {/* Price + Duration row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="input-dark"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-titanium-400">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2hrs, 1 week"
                className="input-dark"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-semibold">{error}</p>
          )}

          <div className="pt-2 flex justify-end gap-3 border-t border-white/5">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim() || !price}
              className="btn-primary"
            >
              {isSaving && <Loader2 size={15} className="animate-spin" />}
              Save Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
