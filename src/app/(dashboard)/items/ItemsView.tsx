"use client"
import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { NewItemModal } from "@/components/NewItemModal"
import { ItemDetailsModal } from "@/components/ItemDetailsModal"
import ItemCard from "@/components/ui/ItemCard"

export default function ItemsView({ initialItems }: { initialItems: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [search, setSearch] = useState("")

  const filteredItems = initialItems.filter(item => 
    (item.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (item.id && item.id.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6">
      {isModalOpen && <NewItemModal onClose={() => setIsModalOpen(false)} />}
      {selectedItem && (
        <ItemDetailsModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase text-glow-uv">Items & Inventory</h1>
          <p className="text-titanium-400 text-xs font-bold uppercase tracking-wider mt-1">Manage catalog, track inventory, and generate AI descriptions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus size={14} />
          <span>New Item</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-titanium-400" size={16} />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d0d0d]/80 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-titanium-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* Items Display */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-titanium-400 border border-dashed border-white/5 rounded-2xl bg-black/20">
          <p className="text-xs font-bold uppercase tracking-widest">No items found in active inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={{
                id: item.id,
                name: item.name || "Unnamed Item",
                brand: item.brand || "",
                category: item.category || "",
                price: item.price_range?.min?.toString() || "0",
                cost: "0",
                image_refs: item.image_refs || [],
                quantity: item.quantity || 1
              }}
              onDetails={() => setSelectedItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
