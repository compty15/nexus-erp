'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, RefreshCw } from 'lucide-react';

interface StatusBannerProps {
  status: 'Active' | 'Locked' | null;
  reason?: string;
  onRefresh?: () => void;
}

export default function StatusBanner({ status, reason, onRefresh }: StatusBannerProps) {
  if (!status || status === 'Active') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl animate-in fade-in"
      >
        <div className="glass p-4 rounded-2xl border border-red-500/30 bg-red-950/20 backdrop-blur-xl flex items-center justify-between gap-6 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-500" />
             </div>
             <div>
                <h3 className="text-sm font-black uppercase tracking-tighter text-white">Metrology Engine Locked</h3>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{reason || "Quota or Billing Restriction"}</p>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={onRefresh}
               className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group"
             >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-400 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Retry Connection</span>
             </button>
             
             <div className="w-px h-8 bg-white/10 hidden md:block"></div>
             
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Automatic Unlock</span>
                <span className="text-[9px] font-black text-zinc-400 uppercase">Monitoring Active</span>
             </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
