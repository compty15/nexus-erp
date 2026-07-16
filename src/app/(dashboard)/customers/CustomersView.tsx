"use client"
import { useState } from "react"
import { Building2, Mail, Phone, Search } from "lucide-react"
import { NewCustomerModal } from "@/components/NewCustomerModal"

export function CustomersView({ customers }: { customers: any[] }) {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Relations (CRM)</h1>
          <p className="text-muted-foreground mt-1">Manage B2B and B2C clients, track orders, and handle communications.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Add Client
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search customers by name, email, or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl text-muted-foreground">
          <p>No customers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((c) => (
            <div key={c.id} className="border border-border bg-card rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase shrink-0">
                      {c.name.substring(0, 2)}
                    </div>
                    <div>
                      <h2 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">{c.name}</h2>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {c.type === 'B2B' ? <Building2 size={12} /> : null} {c.type === 'B2B' ? 'B2B Partner' : 'B2C Customer'}
                      </div>
                    </div>
                  </div>
                  <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-xs font-medium shrink-0">Active</span>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2"><Mail size={14} /> {c.email || 'N/A'}</div>
                  <div className="flex items-center gap-2"><Phone size={14} /> {c.phone || 'N/A'}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border flex justify-between items-center text-sm mt-auto">
                <span className="font-medium">Total Volume: <span className="text-foreground">${Number(c.total_volume).toLocaleString()}</span></span>
                <button className="text-primary hover:underline font-medium">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <NewCustomerModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
