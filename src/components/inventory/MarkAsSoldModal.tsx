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
        className="w-full max-w-md overflow-hidden rounded-[32px] glass-panel shadow-2xl"
      >
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Capture Transaction</h2>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/5">
              <Clock className="h-3 w-3 text-titanium-400" />
              <span className="text-[9px] font-black text-titanium-400 uppercase tracking-widest">
                {timeOnMarket} Days In-System
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Price Input */}
            <div>
              <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-titanium-500">Final Settlement Price</label>
              <div className="relative titanium-panel rounded-2xl">
                <input
                  type="number"
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(parseFloat(e.target.value))}
                  className="w-full bg-transparent py-5 pl-14 pr-4 text-3xl font-black text-white focus:outline-none tracking-tighter"
                />
                <DollarSign className="absolute left-5 top-5.5 h-6 w-6 text-titanium-600" />
              </div>
            </div>

            {/* Platform Selector */}
            <div>
              <label className="mb-3 block text-[9px] font-black uppercase tracking-[0.2em] text-titanium-500 text-center">Marketplace Node</label>
              <div className="grid grid-cols-4 gap-3">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setMarketplace(p.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                      marketplace === p.id 
                        ? 'border-white/20 bg-white/10' 
                        : 'border-white/5 bg-black/40 hover:border-white/10'
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${marketplace === p.id ? 'bg-white shadow-[0_0_10px_white]' : 'bg-titanium-700'}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${marketplace === p.id ? 'text-white' : 'text-titanium-600'}`}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Proceeds Display */}
            <div className="rounded-3xl bg-black/60 p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-titanium-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-titanium-500">Node Yield Estimate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase text-titanium-600">Tax:</span>
                  <input 
                    type="number"
                    value={feePercent}
                    onChange={(e) => setFeePercent(parseFloat(e.target.value))}
                    className="w-10 bg-transparent text-[9px] font-black text-white focus:outline-none"
                  />
                  <span className="text-[9px] font-black text-white">%</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-black text-white tracking-tighter">
                  ${proceeds.toFixed(2)}
                </span>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                  Net Asset Recovery
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-titanium-600 hover:bg-white/5 hover:text-white transition-all"
            >
              Abort
            </button>
            <button
              onClick={() => onConfirm({
                sold_price: soldPrice,
                sold_proceeds: proceeds,
                marketplace_source: marketplace,
                sold_at: new Date().toISOString(),
                status: 'sold'
              })}
              className="flex-1 rounded-2xl bg-white py-4 text-[10px] font-black uppercase tracking-widest text-black shadow-2xl hover:bg-titanium-200 transition-all active:scale-95"
            >
              Execute Sale
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
