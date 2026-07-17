'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  User as UserIcon, 
  Activity,
  Cpu,
  Sliders,
  DollarSign,
  Zap,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';
import { useModelStats, useToggleModelStatus } from '@/features/analytics/useModelStats';
import { useAdminUsage } from '@/features/inventory/useInventory';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const { data: modelStats = [], isLoading: isStatsLoading } = useModelStats();
  const { data: adminUsage = [], isLoading: isAdminLoading } = useAdminUsage(isAdmin);
  const { mutate: toggleModelStatus } = useToggleModelStatus();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const email = user.email || '';
        const role = user.user_metadata?.role || '';
        if (email.includes('admin') || email === 'compt15@gmail.com' || email === 'compty15@gmail.com' || email === 'compton248@gmail.com' || role === 'admin') {
          setIsAdmin(true);
        }
      }
      setCheckingAuth(false);
    }
    checkAdmin();
  }, []);

  // Extract months dynamically from admin usage data
  const allMonths: string[] = Array.from(new Set(
    adminUsage.flatMap((u: any) => Object.keys(u.months || {}))
  )).sort((a: any, b: any) => b.localeCompare(a)) as string[];

  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] text-center px-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4 animate-pulse" />
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Access Denied</h1>
        <p className="text-gray-500 mt-2 max-w-md">You do not have administrative privileges to access this node console.</p>
        <a 
          href="/" 
          className="mt-6 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#222] pb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-purple-500/10 p-3 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <ShieldAlert className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Administrator Console</h1>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mt-0.5">Global AI Node Policies & Operating Audit</p>
          </div>
        </div>
        <div className="rounded-full bg-purple-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20 select-none align-self-start md:align-self-auto">
          Secure Node Active
        </div>
      </div>

      {/* Model Access Guardrails */}
      <section className="rounded-3xl border border-[#222] bg-[#0a0a0a] p-8 shadow-2xl space-y-6">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="h-5 w-5 text-purple-400" />
            Global Model Guardrails
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
            Toggle model availability across the entire system. Changes apply to all users immediately except you.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                className="relative p-6 rounded-2xl border border-[#222] bg-black/40 hover:border-white/10 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-black text-white uppercase tracking-wider">{m.name}</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={m.is_enabled} 
                        onChange={() => toggleModelStatus({ modelId: m.id, isEnabled: !m.is_enabled })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[2px] after:bg-gray-500 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 font-medium leading-relaxed">{m.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1a1a1a] flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-gray-600">
                  <span>Calls: <span className="text-gray-400 font-mono">{m.total_calls}</span></span>
                  <span>Accrued: <span className="text-emerald-500 font-mono">${m.total_cost.toFixed(4)}</span></span>
                </div>
              </div>
            ));
          })()}
        </div>
      </section>

      {/* User Credits & System Operating Spend */}
      <section className="rounded-3xl border border-[#222] bg-[#0a0a0a] p-8 shadow-2xl space-y-6 overflow-hidden">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-purple-400" />
            AI Operating Spend by User
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
            Month-by-month billing logs aggregating costs accrued from engine queries.
          </p>
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
      </section>
    </div>
  );
}
