"use client";

import { X, Package, Tag, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ListingChannels } from "./ListingChannels";
import type { InventoryItem } from "@/types/db";

interface ItemDetailsModalProps {
  item: InventoryItem;
  onClose: () => void;
}

export function ItemDetailsModal({ item, onClose }: ItemDetailsModalProps) {
  const images = item.image_refs ?? [];
  const [imgIndex, setImgIndex] = useState(0);

  const listings = item.metadata?.listings;
  const scientific = listings?.scientific as Record<string, string> | undefined;

  const price = item.price_range?.min ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl mx-4 bg-[#0a0a0f] border border-white/8 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-in">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-titanium-500">Item Details</p>
            <h2 className="text-base font-black text-white truncate">{item.name ?? "Untitled Item"}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-titanium-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[80vh] no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Image carousel */}
            <div className="flex flex-col gap-2">
              <div className="w-full aspect-square border border-white/5 rounded-xl overflow-hidden bg-white/2 relative">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[imgIndex]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
                        >
                          <ChevronRight size={14} />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setImgIndex(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? "bg-white" : "bg-white/30"}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-titanium-700 gap-2">
                    <Package size={40} className="opacity-30" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <p className="text-center text-[10px] text-titanium-600 font-mono">
                  {imgIndex + 1} / {images.length}
                </p>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-titanium-500 block mb-1">Name</span>
                <h1 className="text-xl font-black text-white">{item.name ?? "—"}</h1>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-titanium-500 block mb-1">Price</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    ${price.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white/3 border border-white/5 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-titanium-500 block mb-1">Qty</span>
                  <span className="text-lg font-black text-white font-mono">{item.quantity ?? 0}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {item.category && (
                  <div className="flex items-center gap-2 text-xs text-titanium-400">
                    <Tag size={12} className="text-titanium-600" />
                    <span>{item.category}</span>
                  </div>
                )}
                {item.brand && (
                  <div className="flex items-center gap-2 text-xs text-titanium-400">
                    <Layers size={12} className="text-titanium-600" />
                    <span>{item.brand}</span>
                  </div>
                )}
              </div>

              {item.description && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-titanium-500 block mb-1">Description</span>
                  <p className="text-xs text-titanium-300 leading-relaxed">{item.description}</p>
                </div>
              )}

              {/* Technical specs from AI analysis */}
              {scientific && (
                <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-titanium-400 mb-3">
                    Technical Specs
                  </h4>
                  <ul className="flex flex-col gap-1.5 text-xs text-titanium-300">
                    {scientific.year     && <li><strong className="text-white">Year:</strong> {scientific.year}</li>}
                    {scientific.material && <li><strong className="text-white">Material:</strong> {scientific.material}</li>}
                    {scientific.specs    && <li><strong className="text-white">Specs:</strong> {scientific.specs}</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Listing channels */}
          {listings && (
            <div className="border-t border-white/5 pt-5">
              <ListingChannels listings={listings as Record<string, Record<string, string>>} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex justify-end bg-black/20">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
