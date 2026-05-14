'use client';

import { Cpu, Zap, BrainCircuit, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEngine, Engine } from '@/lib/engine-context';
import { usePathname } from 'next/navigation';
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

  const pathname = usePathname();

  const navLinks = [
    { label: 'Active', href: '/' },
    { label: 'Sold', href: '/inventory/sold' },
    { label: 'Ledger', href: '/ledger' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Trash', href: '/inventory/deleted' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel px-2 py-2 sm:px-4 sm:py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-titanium-400 to-titanium-600 shadow-lg shadow-black/50">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            </div>
            <a href="/" className="text-lg sm:text-xl font-black tracking-tighter text-white hover:text-titanium-300 transition-colors text-glow-uv">NEXUS</a>
          </div>

          <nav className="hidden lg:flex items-center gap-6 mr-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a 
                  key={link.href}
                  href={link.href} 
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-1 ${
                    isActive ? 'text-white' : 'text-titanium-500 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div 
                      layoutId="header-active-line"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    />
                  )}
                </a>
              );
            })}
          </nav>

        <nav className="flex items-center gap-1 rounded-full border border-white/5 bg-black/40 p-1 backdrop-blur-xl overflow-x-auto no-scrollbar max-w-[160px] xs:max-w-none">
          {engines.map((e) => {
            const Icon = e.icon;
            const isActive = engine === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setEngine(e.id as Engine)}
                className={`relative flex items-center gap-1.5 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0 ${
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
                <Icon className={`relative z-10 h-2.5 w-2.5 sm:h-3 sm:w-3 ${isActive ? 'text-white' : e.color}`} />
                <span className="relative z-10">{e.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
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
