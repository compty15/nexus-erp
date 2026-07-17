"use client"

import { useState } from "react"
import { 
  ShieldAlert, Users, Package, MapPin, Wrench, Building2, HardHat, 
  DollarSign, Trash2, Plus, Coins, Brain, ShieldCheck, Search, Check, AlertTriangle 
} from "lucide-react"
import { 
  addContractor, deleteContractor, addCommission, deleteCommission, 
  updateBillingConfig, updateSystemConfig 
} from "./actions"
import FinanceGauge from "@/components/FinanceGauge"
import BudgetTicker from "@/components/BudgetTicker"
import StatusBanner from "@/components/StatusBanner"

export function AdminClientView({ 
  stats, 
  contractors, 
  commissions,
  telemetry
}: { 
  stats: any, 
  contractors: any[], 
  commissions: any[],
  telemetry: {
    users: any[],
    billing: {
      total_budget: number,
      remaining_balance: number,
      total_spent: number,
      last_usage: string
    },
    system: {
      state: "Active" | "Locked",
      reason?: string,
      last_updated: string
    }
  }
}) {
  const [activeTab, setActiveTab] = useState<
    "telemetry" | "finance" | "aiscanner" | "users" | "contractors" | "commissions"
  >("telemetry")
  const [isAdding, setIsAdding] = useState(false)

  // Finance edit states
  const [editBudget, setEditBudget] = useState(telemetry.billing.total_budget)
  const [editRemaining, setEditRemaining] = useState(telemetry.billing.remaining_balance)
  const [editSpent, setEditSpent] = useState(telemetry.billing.total_spent)
  const [billingStatus, setBillingStatus] = useState<"idle" | "loading" | "success">("idle")

  // System status edit states
  const [sysState, setSysState] = useState(telemetry.system.state)
  const [sysReason, setSysReason] = useState(telemetry.system.reason || "")
  const [sysStatus, setSysStatus] = useState<"idle" | "loading" | "success">("idle")

  // User list search state
  const [userSearch, setUserSearch] = useState("")

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

  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault()
    setBillingStatus("loading")
    try {
      await updateBillingConfig(editBudget, editRemaining, editSpent)
      setBillingStatus("success")
      setTimeout(() => setBillingStatus("idle"), 2500)
    } catch (err) {
      alert("Failed to update billing configurations")
      setBillingStatus("idle")
    }
  }

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSysStatus("loading")
    try {
      await updateSystemConfig(sysState as "Active" | "Locked", sysReason)
      setSysStatus("success")
      setTimeout(() => setSysStatus("idle"), 2500)
    } catch (err) {
      alert("Failed to update system status")
      setSysStatus("idle")
    }
  }

  // Filter users based on search
  const filteredUsers = telemetry.users.filter(u => 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <StatusBanner 
        status={telemetry.system.state} 
        reason={telemetry.system.reason} 
      />

      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-primary" size={32} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
            <p className="text-muted-foreground mt-1">Global management, system configuration, and user auditing.</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-4 border-b border-border overflow-x-auto pb-1 scrollbar-thin">
        <button 
          onClick={() => setActiveTab("telemetry")}
          className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${activeTab === "telemetry" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab("finance")}
          className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${activeTab === "finance" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Finance Hub
        </button>
        <button 
          onClick={() => setActiveTab("aiscanner")}
          className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${activeTab === "aiscanner" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          AI Scanner Console
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${activeTab === "users" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Users & Access ({telemetry.users.length})
        </button>
        <button 
          onClick={() => setActiveTab("contractors")}
          className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${activeTab === "contractors" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Contractors & Handymen
        </button>
        <button 
          onClick={() => setActiveTab("commissions")}
          className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${activeTab === "commissions" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Commissions
        </button>
      </div>

      {/* Tab 1: Telemetry Overview */}
      {activeTab === "telemetry" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-in fade-in">
          <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Total Workspaces</h2>
              <Building2 className="text-primary" size={18} />
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
              <Users className="text-primary" size={18} />
            </div>
            <div className="text-3xl font-bold">{stats.totalCustomers || 0}</div>
          </div>
        </div>
      )}

      {/* Tab 2: Finance Hub */}
      {activeTab === "finance" && (
        <div className="flex flex-col gap-6 animate-in fade-in">
          <BudgetTicker balance={telemetry.billing.remaining_balance} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinanceGauge 
              title="Operational Wallet" 
              type="funds" 
              current={telemetry.billing.remaining_balance} 
              total={telemetry.billing.total_budget} 
              subtext={`Total allocated: $${telemetry.billing.total_budget}`}
              project="Metrology Budget Config"
            />
            <FinanceGauge 
              title="Scanner Cost Accrual" 
              type="cost" 
              current={telemetry.billing.total_spent} 
              subtext={`Last usage tracked: ${telemetry.billing.last_usage}`}
              project="Google Gemini API Services"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {/* Configure Budget */}
            <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Coins className="text-primary" size={20} /> Configure Telemetry Budget
              </h2>
              <form onSubmit={handleSaveBilling} className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Total Budget ($)</label>
                    <input 
                      type="number"
                      value={editBudget}
                      onChange={(e) => setEditBudget(Number(e.target.value))}
                      className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Remaining ($)</label>
                    <input 
                      type="number"
                      value={editRemaining}
                      onChange={(e) => setEditRemaining(Number(e.target.value))}
                      className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Spent ($)</label>
                    <input 
                      type="number"
                      value={editSpent}
                      onChange={(e) => setEditSpent(Number(e.target.value))}
                      className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={billingStatus === "loading"}
                  className="bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {billingStatus === "loading" ? "Saving..." : billingStatus === "success" ? "Saved!" : "Save Budget Config"}
                </button>
              </form>
            </div>

            {/* Configure System Lock */}
            <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} /> System Access Configuration
              </h2>
              <form onSubmit={handleSaveSystem} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Engine Status</label>
                  <select 
                    value={sysState}
                    onChange={(e) => setSysState(e.target.value as "Active" | "Locked")}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="Active">Active (Unlocked)</option>
                    <option value="Locked">Locked (Emergency Stop)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Lock Reason</label>
                  <input 
                    type="text"
                    value={sysReason}
                    placeholder="e.g. Budget Cap Reached"
                    onChange={(e) => setSysReason(e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={sysStatus === "loading"}
                  className="bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sysStatus === "loading" ? "Saving..." : sysStatus === "success" ? "Saved!" : "Save Access Config"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Scanner Console */}
      {activeTab === "aiscanner" && (
        <div className="flex flex-col gap-6 animate-in fade-in">
          <div className="border border-border bg-card p-6 rounded-xl shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="text-primary" size={20} /> Gemini Metrology Settings
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure parameters of your integrated object recognition and AI description scanning engine.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 border border-border rounded-lg bg-background flex flex-col gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Default Core Model</span>
                <span className="text-lg font-black text-white italic">Gemini 1.5 Pro (Active)</span>
                <span className="text-[10px] text-muted-foreground mt-1">Deep context reasoning with extreme forensic precision for specs & prices.</span>
              </div>
              <div className="p-4 border border-border rounded-lg bg-background flex flex-col gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fast Scan Model</span>
                <span className="text-lg font-black text-white italic">Gemini 1.5 Flash (Active)</span>
                <span className="text-[10px] text-muted-foreground mt-1">Optimized for swift classifications and local SEO title summaries.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Users and Access */}
      {activeTab === "users" && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="flex items-center justify-between bg-card border border-border p-3 rounded-xl shadow-sm gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search users by email or role..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="font-medium px-4 py-3">User ID</th>
                  <th className="font-medium px-4 py-3">Email Address</th>
                  <th className="font-medium px-4 py-3">Role</th>
                  <th className="font-medium px-4 py-3">Workspaces</th>
                  <th className="font-medium px-4 py-3 text-right">Items Tracked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users found matching query.</td></tr>
                )}
                {filteredUsers.map(u => {
                  const totalItemsCount = u.workspaces.reduce((acc: number, ws: any) => acc + ws.itemsCount, 0)
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-[10px] text-zinc-500">{u.id}</td>
                      <td className="px-4 py-3 font-medium">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                          u.role === 'admin' 
                            ? 'bg-primary/10 border-primary/20 text-primary' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {u.workspaces.length === 0 ? (
                          <span className="text-zinc-600 italic">No workspaces</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {u.workspaces.map((ws: any) => (
                              <span key={ws.id} className="bg-zinc-950 border border-border px-1.5 py-0.5 rounded text-[10px]">
                                {ws.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">{totalItemsCount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Contractors */}
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

      {/* Tab 6: Commissions */}
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
