'use client';

import { Cpu, Zap, BrainCircuit, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEngine, Engine } from '@/lib/engine-context';
import TaskCenter from '../dashboard/TaskCenter';

export default function Header() {
  const { engine, setEngine } = useEngine();

  const engines = [
    { id: 'flash', label: 'Flash', icon: Zap, color: 'text-blue-400' },
    { id: 'pro', label: 'Pro', icon: Cpu, color: 'text-purple-400' },
    { id: 'thinking', label: 'Thinking', icon: BrainCircuit, color: 'text-emerald-400' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#333] bg-[#0a0a0a]/80 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">NEXUS</span>
        </div>

        <nav className="flex items-center gap-1 rounded-full border border-[#333] bg-[#1a1a1a] p-1">
          {engines.map((e) => {
            const Icon = e.icon;
            const isActive = engine === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setEngine(e.id as Engine)}
                className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="engine-pill"
                    className="absolute inset-0 rounded-full bg-[#333]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`relative z-10 h-3.5 w-3.5 ${e.color}`} />
                <span className="relative z-10">{e.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <TaskCenter />
          <div className="hidden items-center gap-4 md:flex">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-gray-500">System Health</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#333]">
                  <div className="h-full w-3/4 bg-emerald-500" />
                </div>
                <span className="text-xs font-mono text-emerald-500">92%</span>
              </div>
            </div>
            <button
              onClick={async () => {
                const { supabase } = await import('@/shared/lib/supabase');
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="rounded-lg border border-[#333] px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#333] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
