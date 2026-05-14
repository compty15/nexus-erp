'use client';

import { Cpu, Zap, BrainCircuit, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEngine, Engine } from '@/lib/engine-context';
import TaskCenter from '../dashboard/TaskCenter';

export default function Header() {
  const { engine, setEngine } = useEngine();

  const engines = [
    { id: 'flash', label: 'FLS-2.5', icon: Zap, color: 'text-blue-400' },
    { id: 'pro-2.5', label: 'PRO-2.5', icon: Cpu, color: 'text-purple-400' },
    { id: 'flash-3.0', label: 'FLS-3.0', icon: Zap, color: 'text-emerald-400' },
    { id: 'pro-3.0', label: 'PRO-3.0', icon: Cpu, color: 'text-orange-400' },
    { id: 'pro-3.1', label: 'PRO-3.1', icon: BrainCircuit, color: 'text-white' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 mr-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-titanium-400 to-titanium-600 shadow-lg shadow-black/50">
              <Activity className="h-5 w-5 text-black" />
            </div>
            <a href="/" className="text-xl font-black tracking-tighter text-white hover:text-titanium-300 transition-colors text-glow-uv">NEXUS</a>
          </div>

          <nav className="hidden md:flex items-center gap-6 mr-auto">
            <a href="/" className="text-xs font-bold uppercase tracking-widest text-titanium-400 hover:text-white transition-colors">Active</a>
            <a href="/inventory/sold" className="text-xs font-bold uppercase tracking-widest text-titanium-400 hover:text-white transition-colors">Sold</a>
            <a href="/shipping" className="text-xs font-bold uppercase tracking-widest text-titanium-400 hover:text-white transition-colors">Shipping</a>
            <a href="/inventory/deleted" className="text-xs font-bold uppercase tracking-widest text-titanium-400 hover:text-white transition-colors">Trash</a>
            <a href="/settings" className="text-xs font-bold uppercase tracking-widest text-titanium-400 hover:text-white transition-colors">Settings</a>
          </nav>

        <nav className="flex items-center gap-1 rounded-full border border-white/5 bg-black/40 p-1 backdrop-blur-xl">
          {engines.map((e) => {
            const Icon = e.icon;
            const isActive = engine === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setEngine(e.id as Engine)}
                className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                  isActive ? 'text-white' : 'text-titanium-500 hover:text-titanium-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="engine-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-titanium-700 to-titanium-800 border border-white/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`relative z-10 h-3 w-3 ${isActive ? 'text-white' : e.color}`} />
                <span className="relative z-10">{e.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 ml-4">
          <TaskCenter />
          <div className="hidden items-center gap-4 md:flex border-l border-white/10 pl-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-tighter text-titanium-500">System Vitality</span>
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 overflow-hidden rounded-full bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    className="h-full bg-gradient-to-r from-titanium-400 to-white" 
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-white">92%</span>
              </div>
            </div>
            <button
              onClick={async () => {
                const { supabase } = await import('@/shared/lib/supabase');
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-titanium-400 hover:text-white hover:bg-white/10 transition-all"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
