"use client"
import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { createService } from "@/app/(dashboard)/services/actions"

export function NewServiceModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("")
  const [provider, setProvider] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await createService(type, provider, parseFloat(estimatedCost) || 0)
      onClose()
    } catch (error) {
      console.error(error)
      alert("Failed to save service")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Add Service / Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Service Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="" disabled>Select a category...</option>
              <option value="Handyman Services">Handyman Services</option>
              <option value="Contractor Services">Contractor Services</option>
              <option value="Commission Services">Commission Services</option>
              <option value="Logistics & Delivery">Logistics & Delivery</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Consulting">Consulting</option>
              <option value="Custom Project">Custom Project</option>
              <option value="Other">Other...</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Provider / Vendor Name</label>
            <input 
              required
              type="text" 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. Apex Industrial Repairs"
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Estimated Cost ($)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={estimatedCost} 
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="0.00"
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving || !type || !provider} 
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Save Service
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
