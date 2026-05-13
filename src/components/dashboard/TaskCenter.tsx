'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: string;
  created_at: string;
}

export default function TaskCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const activeJobs = jobs.filter(j => j.status === 'pending' || j.status === 'processing');

  useEffect(() => {
    // Initial fetch
    fetchJobs();

    // Subscribe to changes
    const channel = supabase
      .channel('jobs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchJobs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchJobs() {
    const { data } = await supabase
      .from('jobs')
      .select('id, status, type, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setJobs(data);
  }

  return (
    <div className="relative">
      {/* Activity Orb */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
          activeJobs.length > 0 
            ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse' 
            : 'border-[#333] bg-[#1a1a1a]'
        }`}
      >
        <Activity className={`h-5 w-5 ${activeJobs.length > 0 ? 'text-blue-400' : 'text-gray-400'}`} />
        {activeJobs.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            {activeJobs.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-[#333] bg-[#1a1a1a] shadow-2xl z-[100]"
          >
            <div className="border-b border-[#333] p-4 bg-[#252525]/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Background Tasks</h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {jobs.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="divide-y divide-[#333]">
                  {jobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 hover:bg-[#252525] transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        {job.status === 'processing' || job.status === 'pending' ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                        ) : job.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white capitalize">{job.type.replace('_', ' ')}</p>
                          <p className="text-[10px] text-gray-500">{new Date(job.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#333] p-3 text-center">
              <button className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:underline">
                View All History
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
