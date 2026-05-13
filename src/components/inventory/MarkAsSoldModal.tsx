'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Clock, 
  Store, 
  Check, 
  X, 
  Calculator,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MarkAsSoldModalProps {
  item: any;
  defaultFeePercent: number;
  onConfirm: (data: any) => void;
  onCancel: () => void;
}

export default function MarkAsSoldModal({ 
  item, 
  defaultFeePercent, 
  onConfirm, 
  onCancel 
}: MarkAsSoldModalProps) {
  const [soldPrice, setSoldPrice] = useState(item.price_range?.max || 0);
  const [marketplace, setMarketplace] = useState('ebay');
  const [feePercent, setFeePercent] = useState(defaultFeePercent);
  
  // Calculate proceeds: price * (1 - fee/100)
  const proceeds = soldPrice * (1 - (feePercent / 100));

  // Time on market calculation
  const createdDate = new Date(item.created_at);
  const today = new Date();
  const timeOnMarket = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  const platforms = [
    { id: 'ebay', label: 'eBay', color: 'bg-blue-500' },
    { id: 'fb', label: 'Facebook', color: 'bg-blue-600' },
    { id: 'etsy', label: 'Etsy', color: 'bg-orange-500' },
    { id: 'shopify', label: 'Shopify', color: 'bg-green-600' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-[32px] border border-[#222] bg-[#111] shadow-2xl"
      >
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Mark as Sold</h2>
            <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1">
              <Clock className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                {timeOnMarket} Days on Market
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Price Input */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Final Sale Price</label>
              <div className="relative">
                <input
                  type="number"
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(parseFloat(e.target.value))}
                  className="w-full rounded-2xl border border-[#222] bg-[#0a0a0a] py-4 pl-12 pr-4 text-2xl font-bold text-white focus:border-blue-500 focus:outline-none"
                />
                <DollarSign className="absolute left-4 top-4.5 h-6 w-6 text-gray-600" />
              </div>
            </div>

            {/* Platform Selector */}
            <div>
              <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Select Marketplace</label>
              <div className="grid grid-cols-4 gap-3">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setMarketplace(p.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${
                      marketplace === p.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-[#222] bg-[#0a0a0a] hover:border-[#333]'
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${p.color}`} />
                    <span className={`text-[10px] font-bold uppercase ${marketplace === p.id ? 'text-white' : 'text-gray-500'}`}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Proceeds Display */}
            <div className="rounded-3xl bg-[#0a0a0a] p-6 border border-[#222]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Estimated Proceeds</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-600">Fee:</span>
                  <input 
                    type="number"
                    value={feePercent}
                    onChange={(e) => setFeePercent(parseFloat(e.target.value))}
                    className="w-10 bg-transparent text-[10px] font-bold text-blue-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-blue-400">%</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">
                  ${proceeds.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-500 uppercase">
                  Net Profit
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-[#222] py-4 text-sm font-bold text-gray-500 hover:bg-[#222] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm({
                sold_price: soldPrice,
                sold_proceeds: proceeds,
                marketplace_source: marketplace,
                sold_at: new Date().toISOString(),
                status: 'sold'
              })}
              className="flex-1 rounded-2xl bg-white py-4 text-sm font-black text-black shadow-xl hover:bg-gray-200 transition-all active:scale-95"
            >
              Confirm Sale
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
