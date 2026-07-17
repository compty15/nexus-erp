'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/lib/notifications';
import { CheckCircle2, AlertCircle, Info, X, Activity } from 'lucide-react';

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotifications();
  const [selectedDetail, setSelectedDetail] = React.useState<string | null>(null);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              onClick={() => n.details && setSelectedDetail(n.details)}
              className={`pointer-events-auto relative flex w-full gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all ${
                n.details ? 'cursor-pointer hover:ring-2 hover:ring-white/20' : ''
              } ${
                n.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10' :
                n.type === 'error' ? 'border-red-500/20 bg-red-500/10' :
                'border-blue-500/20 bg-blue-500/10'
              }`}
            >
              <div className="flex-shrink-0">
                {n.type === 'success' && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                {n.type === 'error' && <AlertCircle className="h-6 w-6 text-red-500" />}
                {n.type === 'info' && <Info className="h-6 w-6 text-blue-500" />}
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">{n.title}</h4>
                <p className="mt-1 text-xs text-gray-400 leading-relaxed">{n.message}</p>
                {n.details && (
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-titanium-500 flex items-center gap-1.5 animate-pulse">
                    <Activity className="h-2.5 w-2.5" />
                    Click to view logs
                  </p>
                )}
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(n.id);
                }}
                className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Error Details Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetail(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter text-white">System Fault Detected</h3>
                    <p className="text-xs text-titanium-500 font-bold uppercase tracking-widest">Intelligence Stream Logs</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDetail(null)} className="text-titanium-600 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="rounded-2xl bg-black/60 border border-white/5 p-4 font-mono text-[11px] text-titanium-300 leading-relaxed overflow-y-auto max-h-[60vh] custom-scrollbar">
                <div className="flex items-center gap-2 mb-2 text-red-400 font-bold uppercase tracking-[0.2em] text-[9px]">
                  <Activity className="h-3 w-3" />
                  Stack Trace
                </div>
                {selectedDetail}
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedDetail);
                    alert('Log trace copied to clipboard.');
                  }}
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                >
                  Copy Trace
                </button>
                <button 
                  onClick={() => setSelectedDetail(null)}
                  className="flex-1 rounded-xl bg-white text-black py-3 text-[10px] font-black uppercase tracking-widest hover:bg-titanium-200 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
