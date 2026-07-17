'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ArrowLeft } from 'lucide-react';
import { useInventory } from '@/features/inventory/useInventory';
import ItemCard from '@/components/ui/ItemCard';
import Link from 'next/link';

export default function SoldPage() {
  const { data: items = [], isLoading } = useInventory({ status: 'sold' });
  
  const soldItems = items;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/" className="rounded-full bg-[#111] p-3 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="rounded-2xl bg-emerald-500/10 p-3">
          <DollarSign className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Sold Listings</h1>
          <p className="text-gray-500">{soldItems.length} items successfully sold.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : soldItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#333] rounded-3xl">
          <DollarSign className="h-12 w-12 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-400">No sold items yet</h2>
          <p className="text-gray-500">Items marked as sold will appear here.</p>
        </div>
      ) : (
        <div className="grid responsive-grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {soldItems.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ItemCard 
                item={{
                  ...item,
                  name: item.name ?? 'Unknown Item',
                  brand: item.brand ?? 'Unknown Brand',
                  category: item.category ?? 'Uncategorized',
                  price: item.price_range ? `$${item.price_range.min} - $${item.price_range.max}` : 'Unknown',
                  cost: `$${item.cost_metadata?.last_scan_cost?.toFixed(2) || '0.00'}`,
                  image: item.image_refs?.[0] || null,
                  image_refs: item.image_refs || [],
                  ebay_description: item.metadata?.drafts?.ebay?.description,
                  weight_raw: item.weight_raw,
                  length_in: item.length_in,
                  width_in: item.width_in,
                  height_in: item.height_in
                }} 
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
