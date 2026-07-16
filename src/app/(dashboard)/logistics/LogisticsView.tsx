"use client"
import { useState } from "react"
import { Truck, Package, Clock, ExternalLink, Search } from "lucide-react"
import { NewShipmentModal } from "@/components/NewShipmentModal"
import { updateShipmentStatus } from "./actions"

// Helper to generate the exact public tracking URL for the Top 10 US Carriers
const getTrackingUrl = (carrier: string, trackingNumber: string) => {
  const tn = encodeURIComponent(trackingNumber.trim())
  switch (carrier) {
    case "USPS": return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tn}`
    case "UPS": return `https://www.ups.com/track?tracknum=${tn}`
    case "FedEx": return `https://www.fedex.com/fedextrack/?trknbr=${tn}`
    case "DHL": return `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${tn}`
    case "Amazon Logistics": return `https://track.amazon.com/tracking/${tn}`
    case "OnTrac": return `https://www.ontrac.com/tracking/?number=${tn}`
    case "LaserShip": return `https://www.lasership.com/track/${tn}`
    case "XPO Logistics": return `https://track.xpo.com/search?p=${tn}`
    case "Estes": return `https://www.estes-express.com/tracking/volume/${tn}`
    case "Old Dominion": return `https://www.odfl.com/Trace/Trace.jsp?action=trace&type=PRO&pro=${tn}`
    default: return `https://www.google.com/search?q=track+${tn}`
  }
}

export function LogisticsView({ shipments }: { shipments: any[] }) {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")

  const filteredShipments = shipments.filter(s => 
    s.tracking_id.toLowerCase().includes(search.toLowerCase()) || 
    s.destination?.toLowerCase().includes(search.toLowerCase()) ||
    s.carrier?.toLowerCase().includes(search.toLowerCase())
  )

  const inTransit = filteredShipments.filter(s => s.status === 'In Transit').length
  const pending = filteredShipments.filter(s => s.status === 'pending').length
  const delayed = filteredShipments.filter(s => s.status === 'Delayed').length

  const handleStatusChange = async (shipmentId: string, newStatus: string) => {
    try {
      await updateShipmentStatus(shipmentId, newStatus)
    } catch (e) {
      console.error(e)
      alert("Failed to update status")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logistics Hub</h1>
          <p className="text-muted-foreground mt-1">Track shipments, manage inventory flow, and monitor ETAs.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          New Shipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <Truck className="text-primary mb-2" size={28} />
          <div className="text-2xl font-bold">{inTransit}</div>
          <div className="text-sm text-muted-foreground">In Transit</div>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <Package className="text-primary mb-2" size={28} />
          <div className="text-2xl font-bold">{pending}</div>
          <div className="text-sm text-muted-foreground">Pending Dispatch</div>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <Clock className="text-primary mb-2" size={28} />
          <div className="text-2xl font-bold">{delayed}</div>
          <div className="text-sm text-muted-foreground">Delayed</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search shipments by ID, destination, or carrier..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="font-medium px-4 py-3">Tracking ID</th>
              <th className="font-medium px-4 py-3">Destination</th>
              <th className="font-medium px-4 py-3">Carrier</th>
              <th className="font-medium px-4 py-3">Status</th>
              <th className="font-medium px-4 py-3 text-right">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredShipments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No shipments found.
                </td>
              </tr>
            )}
            {filteredShipments.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <a 
                    href={getTrackingUrl(s.carrier, s.tracking_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {s.tracking_id}
                    <ExternalLink size={12} />
                  </a>
                </td>
                <td className="px-4 py-3">{s.destination}</td>
                <td className="px-4 py-3">{s.carrier}</td>
                <td className="px-4 py-3">
                  <select
                    value={s.status}
                    onChange={(e) => handleStatusChange(s.id, e.target.value)}
                    className={`px-2 py-1 rounded-md text-xs font-semibold focus:outline-none cursor-pointer border border-border bg-background ${
                      s.status === 'In Transit' ? 'text-blue-500' :
                      s.status === 'Delayed' ? 'text-red-500' :
                      'text-amber-500'
                    }`}
                  >
                    <option value="pending" className="text-amber-500 font-medium">Pending</option>
                    <option value="In Transit" className="text-blue-500 font-medium">In Transit</option>
                    <option value="Delayed" className="text-red-500 font-medium">Delayed</option>
                    <option value="Delivered" className="text-green-500 font-medium">Delivered</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  {s.eta ? new Date(s.eta).toLocaleDateString() : 'Unknown'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <NewShipmentModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
