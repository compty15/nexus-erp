'use client';
import React from 'react';
import { DollarSign, Zap, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinanceGaugeProps {
  title: string;
  type: 'funds' | 'cost';
  current: number;
  total?: number;
  subtext?: string;
  status?: 'active' | 'warning' | 'critical';
  project?: string;
}

export default function FinanceGauge({ 
  title, 
  type, 
  current, 
  total, 
  subtext, 
  status = 'active',
  project
}: FinanceGaugeProps) {
  
  const percentage = total ? Math.max(0, Math.min(100, (current / total) * 100)) : 0;
  
  // Color configuration
  const config = {
    funds: {
      color: percentage > 20 ? 'text-emerald-500' : 'text-rose-500',
      bg: percentage > 20 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
      glow: percentage > 20 ? 'bg-emerald-500' : 'bg-rose-500',
      ring: percentage > 50 ? 'stroke-emerald-500' : percentage > 20 ? 'stroke-amber-500' : 'stroke-rose-600',
      label: 'Remaining Balance'
    },
    cost: {
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      glow: 'bg-orange-500',
      ring: 'stroke-orange-500',
      label: 'Accrued Monthly Cost'
    }
  };

  const currentConfig = config[type];
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = type === 'funds' ? circumference - (percentage / 100) * circumference : circumference * 0.25;

  return (
    <div className="glass metropolis-glow rounded-3xl p-6 relative overflow-hidden group transition-all hover:bg-zinc-900/50 min-h-[220px] flex flex-col justify-between">
      {/* Dynamic Background Glow */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 blur-3xl opacity-5 transition-colors duration-1000 ${currentConfig.glow}`}></div>
      
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              {type === 'funds' ? <Zap className="w-3 h-3 text-amber-500" /> : <TrendingUp className="w-3 h-3 text-orange-500" />}
              {title}
            </h3>
            {project && <p className="text-[10px] font-mono text-zinc-700">{project}</p>}
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${currentConfig.bg} border border-white/5`}>
            <div className={`w-1.5 h-1.5 rounded-full ${currentConfig.color} animate-pulse shadow-[0_0_8px_currentColor]`}></div>
            <span className={`text-[8px] font-black uppercase tracking-tighter ${currentConfig.color}`}>
              {status === 'active' ? 'Live Link' : 'Syncing'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20">
             <svg className="w-full h-full -rotate-90 transform">
                <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-900" />
                <motion.circle 
                  cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`${currentConfig.ring} stroke-linecap-round`}
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-black text-white">{type === 'funds' ? `${percentage.toFixed(0)}%` : 'Active'}</span>
             </div>
          </div>

          <div className="flex-1">
            <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">{currentConfig.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white tracking-tighter italic">
                ${current.toFixed(2)}
              </span>
              {total && total > 0 && (
                <span className="text-sm font-bold text-zinc-600">/ ${total}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
        <p className="text-[9px] font-black italic text-zinc-500 uppercase tracking-widest leading-none">
          {subtext}
        </p>
        <div className="flex items-center gap-2">
           <CheckCircle2 className="w-3 h-3 text-zinc-800" />
           <span className="text-[9px] font-bold text-zinc-700 uppercase">Audit Verified</span>
        </div>
      </div>
    </div>
  );
}
