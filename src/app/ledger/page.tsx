'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Calendar,
  Store,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LedgerPage() {
  const [soldItems, setSoldItems] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProceeds: 0,
    totalProfit: 0,
    avgTimeOnMarket: 0
  });

  useEffect(() => {
    fetchSoldItems();
  }, []);

  async function fetchSoldItems() {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('status', 'sold')
      .order('sold_at', { ascending: false });

    if (data) {
      setSoldItems(data);
      calculateStats(data);
    }
  }

  function calculateStats(items: any[]) {
    const revenue = items.reduce((acc, item) => acc + (item.sold_price || 0), 0);
    const proceeds = items.reduce((acc, item) => acc + (item.sold_proceeds || 0), 0);
    const totalAiCost = items.reduce((acc, item) => acc + (item.cost_metadata?.total_scan_cost || 0), 0);
    
    // Profit = Proceeds - AI Costs (and other expenses later)
    const profit = proceeds - totalAiCost;

    const timesOnMarket = items.map(item => {
      const created = new Date(item.created_at);
      const sold = new Date(item.sold_at);
      return Math.ceil((sold.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    });

    const avgTime = timesOnMarket.length > 0 
      ? timesOnMarket.reduce((a, b) => a + b, 0) / timesOnMarket.length 
      : 0;

    setStats({
      totalRevenue: revenue,
      totalProceeds: proceeds,
      totalProfit: profit,
      avgTimeOnMarket: avgTime
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">NEXUS Ledger</h1>
          <p className="text-gray-500">Internal P&L and sales stream analytics.</p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-2xl border border-[#222] bg-[#111] px-6 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Avg. Time on Market</p>
            <p className="text-xl font-black text-white">{stats.avgTimeOnMarket.toFixed(1)} Days</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        <div className="rounded-[32px] border border-[#222] bg-[#111] p-8 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-emerald-500">+100%</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Revenue</p>
          <h3 className="mt-1 text-3xl font-black text-white">${stats.totalRevenue.toLocaleString()}</h3>
        </div>

        <div className="rounded-[32px] border border-[#222] bg-[#111] p-8 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-gray-500">After Fees</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Proceeds</p>
          <h3 className="mt-1 text-3xl font-black text-white">${stats.totalProceeds.toLocaleString()}</h3>
        </div>

        <div className="rounded-[32px] border border-[#222] bg-emerald-500/10 p-8 shadow-2xl border-emerald-500/20">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-emerald-500">Net</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600/80">Net NEXUS Profit</p>
          <h3 className="mt-1 text-3xl font-black text-white">${stats.totalProfit.toLocaleString()}</h3>
        </div>
      </div>

      {/* Sold History */}
      <div className="rounded-[32px] border border-[#222] bg-[#111] overflow-hidden">
        <div className="border-b border-[#222] p-6 flex items-center justify-between bg-[#1a1a1a]/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Store className="h-5 w-5 text-gray-500" />
            Recent Sales
          </h2>
          <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter By Platform</span>
          </button>
        </div>
        
        <div className="p-4 sm:p-0">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#222] text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Platform</th>
                  <th className="px-6 py-4">Sale Price</th>
                  <th className="px-6 py-4">Proceeds</th>
                  <th className="px-6 py-4">P&L</th>
                  <th className="px-6 py-4">Sold Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {soldItems.map((item) => {
                  const profit = (item.sold_proceeds || 0) - (item.cost_metadata?.total_scan_cost || 0);
                  return (
                    <tr key={item.id} className="hover:bg-[#1a1a1a] transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-gray-500">{item.brand || 'No Brand'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tighter ${
                          item.marketplace_source === 'ebay' ? 'bg-blue-600/10 text-blue-400' :
                          item.marketplace_source === 'etsy' ? 'bg-orange-600/10 text-orange-400' :
                          'bg-emerald-600/10 text-emerald-400'
                        }`}>
                          {item.marketplace_source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-white">${item.sold_price?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400">${item.sold_proceeds?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-bold text-white">
                          {profit >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                          ${profit.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-gray-500">
                        {new Date(item.sold_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid gap-4 sm:hidden">
            {soldItems.map((item) => {
              const profit = (item.sold_proceeds || 0) - (item.cost_metadata?.total_scan_cost || 0);
              return (
                <div key={item.id} className="rounded-2xl border border-[#222] bg-[#0a0a0a] p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{item.name}</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{item.brand || 'No Brand'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-tighter ${
                      item.marketplace_source === 'ebay' ? 'bg-blue-600/10 text-blue-400' :
                      item.marketplace_source === 'etsy' ? 'bg-orange-600/10 text-orange-400' :
                      'bg-emerald-600/10 text-emerald-400'
                    }`}>
                      {item.marketplace_source}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#222]">
                    <div>
                      <p className="text-[7px] font-black uppercase tracking-widest text-gray-600 mb-1">Sale</p>
                      <p className="text-xs font-bold text-white">${item.sold_price?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black uppercase tracking-widest text-gray-600 mb-1">Net</p>
                      <p className="text-xs font-bold text-emerald-400">${item.sold_proceeds?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[7px] font-black uppercase tracking-widest text-gray-600 mb-1">P&L</p>
                      <div className="flex items-center gap-1 text-xs font-bold text-white">
                        {profit >= 0 ? <TrendingUp className="h-2 w-2 text-emerald-500" /> : <TrendingDown className="h-2 w-2 text-red-500" />}
                        ${profit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[8px] text-gray-600 text-right uppercase tracking-widest pt-2 border-t border-[#222]">
                    {new Date(item.sold_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>

          {soldItems.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-sm text-gray-500 italic">No sales recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
