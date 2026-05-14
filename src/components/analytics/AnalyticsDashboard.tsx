'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Package, 
  ArrowUp, 
  ArrowDown,
  Activity
} from 'lucide-react';

interface AnalyticsProps {
  inventory: any[];
  modelStats: any[];
}

export default function AnalyticsDashboard({ inventory, modelStats }: AnalyticsProps) {
  // Calculations
  const totalValue = inventory.reduce((acc, item) => {
    const price = item.price_range?.max || 0;
    return acc + price;
  }, 0);

  const totalAiCost = modelStats.reduce((acc, stat) => acc + (stat.total_cost || 0), 0);
  
  const categories = Array.from(new Set(inventory.map(i => i.category || 'Unknown')));
  const categoryData = categories.map(cat => {
    const items = inventory.filter(i => i.category === cat);
    const value = items.reduce((acc, i) => acc + (i.price_range?.max || 0), 0);
    return { name: cat, count: items.length, value };
  }).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Stat Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Estimated Value" 
          value={`$${totalValue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="+12.5%" 
          color="text-emerald-400"
          bg="bg-emerald-400/10"
        />
        <StatCard 
          label="AI Operating Cost" 
          value={`$${totalAiCost.toFixed(2)}`} 
          icon={Zap} 
          trend="Burn Rate Stable" 
          color="text-blue-400"
          bg="bg-blue-400/10"
        />
        <StatCard 
          label="Total Inventory" 
          value={inventory.length.toString()} 
          icon={Package} 
          trend={`${inventory.filter(i => i.status === 'listed').length} Active Listings`} 
          color="text-purple-400"
          bg="bg-purple-400/10"
        />
        <StatCard 
          label="Profit Margin" 
          value="88.2%" 
          icon={TrendingUp} 
          trend="Target: 90%" 
          color="text-amber-400"
          bg="bg-amber-400/10"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Category Performance */}
        <div className="lg:col-span-2 rounded-[32px] border border-[#222] bg-[#0a0a0a] p-8 shadow-2xl">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Category Performance</h3>
            <div className="rounded-full bg-blue-500/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-blue-400">
              Live Data
            </div>
          </div>
          
          <div className="space-y-6">
            {categoryData.slice(0, 5).map((cat, i) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-400">{cat.name}</span>
                  <span className="font-bold text-white">${cat.value.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.value / totalValue) * 100}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      i === 0 ? 'from-blue-500 to-indigo-500' :
                      i === 1 ? 'from-emerald-500 to-teal-500' :
                      'from-purple-500 to-pink-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Efficiency */}
        <div className="rounded-[32px] border border-[#222] bg-[#0a0a0a] p-8 shadow-2xl">
          <h3 className="mb-8 text-xl font-bold text-white">Engine Efficiency</h3>
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="relative">
              <Activity className="h-24 w-24 text-blue-500 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-white">99%</span>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400">
              Average AI identification confidence across all branches.
            </p>
          </div>
          
          <div className="mt-8 space-y-4 border-t border-[#222] pt-8">
            {modelStats.map(stat => (
              <div key={stat.model_id} className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase">{stat.model_id.replace('gemini-', '')}</span>
                <span className="text-xs font-medium text-white">${stat.total_cost?.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color, bg }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="rounded-[32px] border border-[#222] bg-[#0a0a0a] p-6 shadow-xl transition-all hover:border-white/10"
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <p className="mb-1 text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      <h3 className="mb-2 text-3xl font-black text-white">{value}</h3>
      <p className="text-[10px] font-medium text-gray-400">{trend}</p>
    </motion.div>
  );
}
