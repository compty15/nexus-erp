'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ArrowLeft, PackageCheck, Box } from 'lucide-react';
import { useInventory } from '@/features/inventory/useInventory';
import Link from 'next/link';

export default function ShippingPage() {
  const { data: items = [], isLoading } = useInventory();
  
  // For a basic manual dashboard, we look at sold items.
  const soldItems = items.filter(i => i.status === 'sold');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/" className="rounded-full bg-[#111] p-3 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="rounded-2xl bg-blue-500/10 p-3">
          <Truck className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Fulfillment & Shipping</h1>
          <p className="text-gray-500">Manage packages and print labels for sold inventory.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
          <div className="flex items-center gap-3 mb-2">
            <Box className="h-5 w-5 text-yellow-500" />
            <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Awaiting Shipment</h3>
          </div>
          <p className="text-3xl font-black text-white">{soldItems.length}</p>
        </div>
        <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
          <div className="flex items-center gap-3 mb-2">
            <PackageCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Shipped Today</h3>
          </div>
          <p className="text-3xl font-black text-white">0</p>
        </div>
        <div className="rounded-2xl border border-[#222] bg-[#111] p-6 flex flex-col justify-center">
          <button className="rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all active:scale-95">
            Connect Carrier API
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      ) : soldItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#333] rounded-3xl">
          <Truck className="h-12 w-12 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-400">No items to ship</h2>
          <p className="text-gray-500">Items you sell will appear here for fulfillment.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#222] bg-[#0a0a0a] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden sm:block">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#111] text-xs font-bold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Marketplace</th>
                  <th className="px-6 py-4">Weight / Dims</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {soldItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#222] hover:bg-[#111]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_refs?.[0] && (
                          <img src={item.image_refs[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-gray-500">{item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-emerald-400 font-medium">
                      {item.marketplace_source || 'Direct'}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {item.weight_raw || 0} lbs <br/>
                      <span className="text-[10px] text-gray-500">{item.length_in || 0}x{item.width_in || 0}x{item.height_in || 0}"</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg bg-[#222] px-4 py-2 text-xs font-bold text-white hover:bg-[#333] transition-colors">
                        Mark Shipped
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block sm:hidden divide-y divide-[#222]">
            {soldItems.map((item) => (
              <div key={item.id} className="p-4 space-y-4">
                <div className="flex gap-4">
                  {item.image_refs?.[0] && (
                    <img src={item.image_refs[0]} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white leading-tight">{item.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{item.brand}</p>
                    <span className="mt-2 inline-block rounded-full bg-emerald-600/10 px-2 py-0.5 text-[8px] font-bold uppercase text-emerald-400">
                      {item.marketplace_source || 'Direct'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between rounded-xl bg-[#111] p-3">
                  <div className="flex items-center gap-2">
                    <Box className="h-3 w-3 text-gray-500" />
                    <span className="text-[10px] font-mono text-gray-300">
                      {item.weight_raw || 0} lbs | {item.length_in || 0}x{item.width_in || 0}x{item.height_in || 0}"
                    </span>
                  </div>
                  <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-blue-900/20">
                    Ship Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
