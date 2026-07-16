"use client"
import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { createCustomer } from "@/app/(dashboard)/customers/actions"

export function NewCustomerModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'B2B' | 'B2C'>('B2B')
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await createCustomer(type, name, email, phone)
      onClose()
    } catch (error) {
      console.error(error)
      alert("Failed to save customer")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Add Customer</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Customer Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as 'B2B' | 'B2C')}
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="B2B">B2B (Business)</option>
              <option value="B2C">B2C (Consumer)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Name / Company</label>
            <input 
              required
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Phone</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              className="bg-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 mt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSaving || !name} 
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
