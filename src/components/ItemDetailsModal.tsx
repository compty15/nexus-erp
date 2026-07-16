"use client"
import { X, Wrench, Package, MapPin } from "lucide-react"
import { ListingChannels } from "./ListingChannels"

interface ItemDetailsModalProps {
  item: any
  onClose: () => void
}

export function ItemDetailsModal({ item, onClose }: ItemDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold truncate">Item Details: {item.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Image Area */}
            <div className="flex flex-col gap-2">
              <div className="w-full aspect-square border border-border rounded-xl overflow-hidden bg-secondary/30 relative">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Package size={48} />
                    <span className="text-xs mt-2">No Image</span>
                  </div>
                )}
              </div>
            </div>

            {/* General Info */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block uppercase">Item Name</span>
                <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground block uppercase">Price / Value</span>
                <span className="text-xl font-bold text-primary">${Number(item.price || 0).toFixed(2)}</span>
              </div>

              {item.listings?.scientific && (
                <div className="bg-secondary/40 p-4 rounded-xl border border-border">
                  <h4 className="font-bold text-xs mb-2 uppercase text-muted-foreground">Technical Specifications</h4>
                  <ul className="list-disc pl-4 text-xs text-foreground space-y-1.5">
                    <li><strong>Year/Era:</strong> {item.listings.scientific.year}</li>
                    <li><strong>Materials:</strong> {item.listings.scientific.material}</li>
                    <li><strong>Specs:</strong> {item.listings.scientific.specs}</li>
                  </ul>
                </div>
              )}
            </div>

          </div>

          {/* Listing Channels */}
          {item.listings && (
            <div className="border-t border-border pt-6 mt-4">
              <ListingChannels listings={item.listings} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end bg-secondary/20">
          <button onClick={onClose} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Close Details
          </button>
        </div>

      </div>
    </div>
  )
}
