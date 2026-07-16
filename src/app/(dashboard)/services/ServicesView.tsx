"use client"
import { useState } from "react"
import { Wrench, MapPin, Search } from "lucide-react"
import { NewServiceModal } from "@/components/NewServiceModal"

export function ServicesView({ services }: { services: any[] }) {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")

  const filteredServices = services.filter(s => 
    s.type.toLowerCase().includes(search.toLowerCase()) || 
    s.provider?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services & Projects</h1>
          <p className="text-muted-foreground mt-1">Research costs and locate nearby service providers.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
           <div className="flex items-center gap-2 mb-4">
             <Wrench className="text-primary" size={20} />
             <h2 className="text-lg font-semibold">Service Cost Estimator</h2>
           </div>
           <p className="text-sm text-muted-foreground mb-4">Calculate average costs based on market data for specific projects.</p>
           <div className="flex items-center justify-center h-48 border border-dashed border-border rounded-lg text-muted-foreground">
             Cost Estimator Tool
           </div>
        </div>
        
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
           <div className="flex items-center gap-2 mb-4">
             <MapPin className="text-primary" size={20} />
             <h2 className="text-lg font-semibold">Nearby Providers</h2>
           </div>
           <p className="text-sm text-muted-foreground mb-4">Searching providers within 50 miles of your Settings location.</p>
           <div className="flex flex-col gap-3">
             <div className="p-3 border border-border rounded-lg flex justify-between items-center hover:border-primary/50 cursor-pointer">
               <div>
                 <div className="font-semibold">Apex Industrial Repairs</div>
                 <div className="text-xs text-muted-foreground">12.4 miles away</div>
               </div>
               <button className="text-primary text-sm font-medium hover:underline">Contact</button>
             </div>
             <div className="p-3 border border-border rounded-lg flex justify-between items-center hover:border-primary/50 cursor-pointer">
               <div>
                 <div className="font-semibold">National Gearbox Services</div>
                 <div className="text-xs text-muted-foreground">28.1 miles away</div>
               </div>
               <button className="text-primary text-sm font-medium hover:underline">Contact</button>
             </div>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold tracking-tight">Active Services Log</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Search services log..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-primary"
          />
        </div>
      </div>
      
      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="font-medium px-4 py-3">Service Type</th>
              <th className="font-medium px-4 py-3">Provider</th>
              <th className="font-medium px-4 py-3">Date Added</th>
              <th className="font-medium px-4 py-3 text-right">Estimated Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredServices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No services found.
                </td>
              </tr>
            )}
            {filteredServices.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{s.type}</td>
                <td className="px-4 py-3">{s.provider}</td>
                <td className="px-4 py-3">
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  ${Number(s.estimated_cost).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <NewServiceModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
