'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/lib/notifications';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`pointer-events-auto relative flex w-full gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all ${
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
            </div>

            <button 
              onClick={() => removeNotification(n.id)}
              className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
