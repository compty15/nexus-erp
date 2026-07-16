"use client"

import { useState } from "react"
import { ShieldAlert, Users, Package, MapPin, Wrench, Building2, HardHat, DollarSign, Trash2, Plus } from "lucide-react"
import { addContractor, deleteContractor, addCommission, deleteCommission } from "./actions"

export function AdminClientView({ 
  stats, 
  contractors, 
  commissions 
}: { 
  stats: any, 
  contractors: any[], 
  commissions: any[] 
}) {
  const [activeTab, setActiveTab] = useState<"telemetry" | "contractors" | "commissions">("telemetry")
  const [isAdding, setIsAdding] = useState(false)

  const handleAddContractor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAdding(true)
    const formData = new FormData(e.currentTarget)
    try {
      await addContractor(
        formData.get("name") as string,
        formData.get("specialty") as string,
        Number(formData.get("hourly_rate")),
        formData.get("phone") as string
      )
      e.currentTarget.reset()
    } catch(err) {
      alert("Failed to add contractor")
    }
    setIsAdding(false)
  }

  const handleAddCommission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAdding(true)
    const formData = new FormData(e.currentTarget)
    try {
      await addCommission(
        formData.get("tier_name") as string,
        Number(formData.get("percentage")),
        formData.get("description") as string
      )
      e.currentTarget.reset()
    } catch(err) {
      alert("Failed to add commission")
    }
    setIsAdding(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-primary" size={32} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
            <p className="text-muted-foreground mt-1">Global management and configuration.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button 
          onClick={() => setActiveTab("telemetry")}
          className={`pb-2 px-1 font-medium transition-colors ${activeTab === "telemetry" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Telemetry
        </button>
        <button 
          onClick={() => setActiveTab("contractors")}
          className={`pb-2 px-1 font-medium transition-colors ${activeTab === "contractors" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Contractors & Handymen
        </button>
        <button 
          onClick={() => setActiveTab("commissions")}
          className={`pb-2 px-1 font-medium transition-colors ${activeTab === "commissions" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Commission Tiers
        </button>
      </div>

      {activeTab === "telemetry" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-in fade-in">
          <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Total Workspaces</h2>
              <Users className="text-primary" size={18} />
            </div>
            <div className="text-3xl font-bold">{stats.totalTeams || 0}</div>
          </div>
          
          <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Global Inventory</h2>
              <Package className="text-primary" size={18} />
            </div>
            <div className="text-3xl font-bold">{stats.totalItems || 0}</div>
          </div>

          <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Active Shipments</h2>
              <MapPin className="text-primary" size={18} />
            </div>
            <div className="text-3xl font-bold">{stats.totalShipments || 0}</div>
          </div>

          <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Total Services</h2>
              <Wrench className="text-primary" size={18} />
            </div>
            <div className="text-3xl font-bold">{stats.totalServices || 0}</div>
          </div>

          <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Total Customers</h2>
              <Building2 className="text-primary" size={18} />
            </div>
            <div className="text-3xl font-bold">{stats.totalCustomers || 0}</div>
          </div>
        </div>
      )}

      {activeTab === "contractors" && (
        <div className="flex flex-col gap-6 animate-in fade-in">
          <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HardHat className="text-primary" size={20} /> Add Global Contractor
            </h2>
            <form onSubmit={handleAddContractor} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold">Name / Company</label>
                <input required name="name" type="text" className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="Apex Repairs" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold">Specialty</label>
                <input required name="specialty" type="text" className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="HVAC / Plumbing" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold">Hourly Rate ($)</label>
                <input required name="hourly_rate" type="number" step="0.01" className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="85.00" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold">Phone</label>
                <input required name="phone" type="text" className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="555-0192" />
              </div>
              <button disabled={isAdding} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 h-9">
                <Plus size={16} /> Add
              </button>
            </form>
          </div>

          <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="font-medium px-4 py-3">Contractor</th>
                  <th className="font-medium px-4 py-3">Specialty</th>
                  <th className="font-medium px-4 py-3">Hourly Rate</th>
                  <th className="font-medium px-4 py-3">Phone</th>
                  <th className="font-medium px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contractors.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No contractors added yet.</td></tr>
                )}
                {contractors.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.specialty}</td>
                    <td className="px-4 py-3">${Number(c.hourly_rate).toFixed(2)}/hr</td>
                    <td className="px-4 py-3">{c.phone}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteContractor(c.id)} className="text-destructive hover:text-destructive/80 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "commissions" && (
        <div className="flex flex-col gap-6 animate-in fade-in">
          <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="text-primary" size={20} /> Add Commission Tier
            </h2>
            <form onSubmit={handleAddCommission} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold">Tier Name</label>
                <input required name="tier_name" type="text" className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="Standard Referral" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold">Percentage (%)</label>
                <input required name="percentage" type="number" step="0.1" className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="15.0" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold">Description</label>
                <input required name="description" type="text" className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="Base tier for new leads" />
              </div>
              <button disabled={isAdding} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 h-9">
                <Plus size={16} /> Add Tier
              </button>
            </form>
          </div>

          <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="font-medium px-4 py-3">Tier Name</th>
                  <th className="font-medium px-4 py-3">Percentage</th>
                  <th className="font-medium px-4 py-3">Description</th>
                  <th className="font-medium px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commissions.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No commission tiers added yet.</td></tr>
                )}
                {commissions.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.tier_name}</td>
                    <td className="px-4 py-3 font-bold text-primary">{Number(c.percentage).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.description}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteCommission(c.id)} className="text-destructive hover:text-destructive/80 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
