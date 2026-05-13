'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQueueStore } from '@/shared/lib/store';

export default function TaskCenter() {
  const pendingJobs = useQueueStore((state) => state.pendingJobs);
  const activeJobs = pendingJobs.filter(j => j.status === 'processing' || j.status === 'pending');
  const hasErrors = pendingJobs.some(j => j.status === 'failed');
  const recentlyCompleted = pendingJobs.filter(j => j.status === 'completed').length;

  if (pendingJobs.length === 0) return null;

  return (
    <div className="relative group flex items-center gap-2">
      <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-[#111] border border-[#333]">
        <Activity className={`h-4 w-4 ${activeJobs.length > 0 ? 'text-blue-500 animate-pulse' : 'text-gray-500'}`} />
        
        {activeJobs.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 'auto', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="hidden md:flex flex-col overflow-hidden whitespace-nowrap pr-2"
        >
          {activeJobs.length > 0 ? (
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              {activeJobs.length} Process{activeJobs.length > 1 ? 'es' : ''} Active
            </span>
          ) : hasErrors ? (
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Error in Queue
            </span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {recentlyCompleted} Completed
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
