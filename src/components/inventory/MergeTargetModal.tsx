import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, ArrowRight } from 'lucide-react';
import { useInventory } from '@/features/inventory/useInventory';

interface MergeTargetModalProps {
  onClose: () => void;
  onSelect: (item: any) => void;
  excludeId?: string;
}

export default function MergeTargetModal({ onClose, onSelect, excludeId }: MergeTargetModalProps) {
  const { data: items = [], isLoading } = useInventory();
  const [search, setSearch] = useState('');

  const filteredItems = items
    .filter(i => i.id !== excludeId && i.status !== 'deleted')
    .filter(i => 
      i.name?.toLowerCase().includes(search.toLowerCase()) || 
      i.brand?.toLowerCase().includes(search.toLowerCase()) ||
      i.metadata?.item_code?.includes(search)
    )
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-[2rem] border border-[#333] bg-[#0d0d0d] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-[#222] bg-[#111] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white">Select Target Item</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Photos will be moved to this item</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 border-b border-[#222]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              autoFocus
              placeholder="Search by name, brand or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-[#222] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-10" />
              <p className="text-sm font-bold">No items found</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full text-left p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#222] overflow-hidden border border-white/5">
                    {item.image_refs?.[0] ? (
                      <img src={item.image_refs[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-600 font-bold">NO IMG</div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight truncate max-w-[200px]">{item.name || 'Unnamed Item'}</h4>
                    <p className="text-[10px] text-gray-500 font-bold">{item.metadata?.item_code || '#0000'} • {item.brand || 'No Brand'}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-700 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
