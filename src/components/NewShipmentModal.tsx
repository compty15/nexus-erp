"use client"
import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { createShipment } from "@/app/(dashboard)/logistics/actions"

export const CARRIERS = [
  "USPS",
  "UPS",
  "FedEx",
  "DHL",
  "Amazon Logistics",
  "OnTrac",
  "LaserShip",
  "XPO Logistics",
  "Estes",
  "Old Dominion",
]

export function NewShipmentModal({ onClose }: { onClose: () => void }) {
  const [carrier, setCarrier] = useState(CARRIERS[0])
  const [trackingId, setTrackingId] = useState("")
  const [destination, setDestination] = useState("")
  const [eta, setEta] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await createShipment(trackingId, carrier, destination, eta)
      onClose()
    } catch (error) {
      console.error(error)
      alert("Failed to save shipment")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">New Shipment</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Carrier (Top 10 US)</label>
            <select 
              value={carrier} 
              onChange={(e) => setCarrier(e.target.value)}
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            >
              {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Tracking Number / PRO</label>
            <input 
              required
              type="text" 
              value={trackingId} 
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. 1Z9999999999999999"
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Destination</label>
            <input 
              type="text" 
              required
              value={destination} 
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Dallas, TX"
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Estimated Arrival (ETA)</label>
            <input 
              type="date" 
              value={eta} 
              onChange={(e) => setEta(e.target.value)}
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving || !trackingId || !destination} 
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Track Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
