'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Package, 
  Activity,
  User as UserIcon,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { useAdminUsage } from '@/features/inventory/useInventory';
import { useToggleModelStatus } from '@/features/analytics/useModelStats';

interface AnalyticsProps {
  inventory: any[];
  modelStats: any[];
  userCredits?: number;
  isAdmin?: boolean;
}

export default function AnalyticsDashboard({ inventory, modelStats, userCredits = 0, isAdmin = false }: AnalyticsProps) {
  const [subTab, setSubTab] = useState<'overview' | 'admin'>('overview');
  const { mutate: toggleModelStatus } = useToggleModelStatus();

  // Load Admin metrics only when the admin tab is open
  const { data: adminUsage = [], isLoading: isAdminLoading } = useAdminUsage(isAdmin && subTab === 'admin');

  // Calculations for current user
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

  // Extract months dynamically from admin usage data
  const allMonths: string[] = Array.from(new Set(
    adminUsage.flatMap((u: any) => Object.keys(u.months || {}))
  )).sort((a: any, b: any) => b.localeCompare(a)) as string[];

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Tab Switcher */}
      {isAdmin && (
        <div className="flex gap-4 border-b border-[#222] pb-4">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              subTab === 'overview' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                : 'bg-[#111] border border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSubTab('admin')}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              subTab === 'admin' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30 animate-pulse-glow' 
                : 'bg-[#111] border border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            Admin Console (Credits)
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {subTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
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
                label="Credits Used (AI)" 
                value={`$${userCredits.toFixed(4)}`} 
                icon={Zap} 
                trend="Personal AI Spend" 
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
                          animate={{ width: `${totalValue > 0 ? (cat.value / totalValue) * 100 : 0}%` }}
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

              {/* AI Efficiency & Global Operating Cost */}
              <div className="rounded-[32px] border border-[#222] bg-[#0a0a0a] p-8 shadow-2xl">
                <h3 className="mb-8 text-xl font-bold text-white">Global AI Metrics</h3>
                <div className="flex flex-col items-center justify-center space-y-4 py-8 border-b border-[#222] pb-8 mb-6">
                  <div className="relative">
                    <Activity className="h-24 w-24 text-blue-500 opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black text-white">99%</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-black">
                    Engine Confidence
                  </p>
                  <p className="text-center text-[10px] text-gray-600">
                    Global System operating cost: <span className="font-bold text-gray-400">${totalAiCost.toFixed(2)}</span>
                  </p>
                </div>
                
                <div className="space-y-4">
                  {modelStats.map(stat => (
                    <div key={stat.model_id} className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{stat.model_id.replace('gemini-', '')}</span>
                      <span className="text-xs font-medium text-white">${stat.total_cost?.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-[32px] border border-[#222] bg-[#0a0a0a] p-8 shadow-2xl space-y-8 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[#222] pb-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-purple-400" />
                  Administrator Control Console
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                  Manage model access and audit global AI costs
                </p>
              </div>
              <div className="rounded-full bg-purple-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20">
                Authorized Node
              </div>
            </div>

            {/* Model Access Guardrails */}
            <div className="space-y-4 border-b border-[#222] pb-8">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Global Model Access Policies (Toggles affect everyone except you)
              </h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(() => {
                  const ALL_MODELS = [
                    { id: 'gemini-flash-latest', name: 'Gemini 1.5 Flash', desc: 'Fast, stable model for general tasks' },
                    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Sub-second latency default audit engine' },
                    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Next-gen high throughput audit model' },
                    { id: 'gemini-pro-latest', name: 'Gemini 1.5 Pro', desc: 'Complex reasoning and structural audit' },
                    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Elite intelligence & macro photo auditing' },
                    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', desc: 'Cutting-edge reasoning engine' },
                  ];

                  const modelsWithStats = ALL_MODELS.map(m => {
                    const dbStat = modelStats.find(s => s.model_id === m.id);
                    return {
                      ...m,
                      total_calls: dbStat?.total_calls || 0,
                      total_cost: dbStat?.total_cost || 0,
                      is_enabled: dbStat ? dbStat.is_enabled !== false : true,
                    };
                  });

                  return modelsWithStats.map((m) => (
                    <div 
                      key={m.id} 
                      className="relative p-5 rounded-2xl border border-[#222] bg-black/40 hover:border-white/10 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-black text-white uppercase tracking-wider">{m.name}</span>
                          <label className={`relative inline-flex items-center select-none ${isAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                            <input 
                              type="checkbox" 
                              checked={m.is_enabled} 
                              disabled={!isAdmin}
                              onChange={() => isAdmin && toggleModelStatus({ modelId: m.id, isEnabled: !m.is_enabled })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[2px] after:bg-gray-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
                          </label>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 font-medium leading-relaxed">{m.desc}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-600">
                        <span>Calls: <span className="text-gray-400 font-mono">{m.total_calls}</span></span>
                        <span>Accrued: <span className="text-emerald-500 font-mono">${m.total_cost.toFixed(4)}</span></span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                User Credits Breakdown
              </h4>
            </div>

            {isAdminLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                <p className="text-xs font-black uppercase tracking-widest text-purple-400 animate-pulse">Retrieving usage nodes...</p>
              </div>
            ) : adminUsage.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Activity className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-400">No User usage tracked</h3>
                <p className="text-xs text-gray-500 mt-1">No AI billing logs have accrued yet across the system.</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#222] text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <th className="py-4 px-4">User Node</th>
                      <th className="py-4 px-4">Email</th>
                      <th className="py-4 px-4 text-right">Total Accrued</th>
                      {allMonths.map(month => (
                        <th key={month} className="py-4 px-4 text-right">{new Date(month + '-02').toLocaleDateString('default', { month: 'short', year: '2-digit' }).toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {adminUsage.map((user: any) => (
                      <tr key={user.user_id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 px-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-purple-400" />
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-wider">{user.name}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs text-gray-400 font-medium">{user.email}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-xs font-black text-emerald-400 tracking-wider">
                            ${user.total_cost.toFixed(4)}
                          </span>
                        </td>
                        {allMonths.map(month => {
                          const cost = user.months[month] || 0;
                          return (
                            <td key={month} className="py-4 px-4 text-right">
                              <span className={`text-xs font-mono font-bold ${cost > 0 ? 'text-white' : 'text-gray-600'}`}>
                                {cost > 0 ? `$${cost.toFixed(4)}` : '-'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
