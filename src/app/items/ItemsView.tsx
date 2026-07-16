'use client'
import { useState } from "react"
import { LayoutGrid, List, Maximize, Search, Plus } from "lucide-react"
import { NewItemModal } from "@/components/NewItemModal"

export default function ItemsView({ initialItems }: { initialItems: any[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "large">("grid")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredItems = initialItems.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    (item.id && item.id.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6">
      {isModalOpen && <NewItemModal onClose={() => setIsModalOpen(false)} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items & Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage catalog, track inventory, and generate AI descriptions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          <span>New Item</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        
        {/* Layout Toggle */}
        <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
          <button 
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="List View"
          >
            <List size={18} />
          </button>
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode("large")}
            className={`p-2 rounded-md transition-colors ${viewMode === "large" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="Large Grid View"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* Items Display */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
          <p>No items found.</p>
        </div>
      ) : (
        <div className={
          viewMode === "list" ? "flex flex-col gap-4" : 
          viewMode === "large" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : 
          "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
        }>
          {filteredItems.map(item => (
            <ItemCard 
              key={item.id} 
              viewMode={viewMode} 
              title={item.title} 
              id={item.id.substring(0, 8).toUpperCase()} 
              price={`$${item.price?.toFixed(2) || '0.00'}`} 
              stock={10} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemCard({ viewMode, title, id, price, stock }: { viewMode: string, title: string, id: string, price: string, stock: number }) {
  if (viewMode === "list") {
    return (
      <div className="flex items-center justify-between border border-border bg-card p-4 rounded-xl shadow-sm hover:border-primary/50 transition-all cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground">IMG</div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <span className="text-xs text-muted-foreground">#{id}</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="font-medium">{price}</div>
            <div className={`text-xs ${stock > 0 ? "text-green-500" : "text-destructive"}`}>
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </div>
          </div>
          <button className="text-primary text-sm font-medium hover:underline">Edit</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-border bg-card rounded-xl shadow-sm overflow-hidden flex flex-col hover:border-primary/50 transition-all cursor-pointer ${viewMode === "large" ? "h-96" : "h-72"}`}>
      <div className="flex-1 bg-secondary flex items-center justify-center text-muted-foreground">
        Image Placeholder
      </div>
      <div className="p-4 flex flex-col gap-1 border-t border-border">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-foreground truncate pr-2">{title}</h3>
          <span className="font-medium text-primary">{price}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">#{id}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${stock > 0 ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </span>
        </div>
      </div>
    </div>
  )
}
