'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, TrendingUp, AlertCircle } from 'lucide-react';

interface BudgetTickerProps {
  balance: number;
}

export default function BudgetTicker({ balance }: BudgetTickerProps) {
  const [index, setIndex] = useState(0);

  const flashCost = 0.10; // $0.10 per scan (average for Flash with images)
  const proCost = 1.25;   // $1.25 per scan (average for Pro with images)

  const stats = [
    {
      label: "Flash Capacity",
      value: `${Math.floor(balance / flashCost).toLocaleString()} Identifications`,
      icon: <Zap className="w-4 h-4 text-orange-500" />,
      desc: "Using Gemini 1.5 Flash (90% Efficiency)"
    },
    {
      label: "Pro Capacity",
      value: `${Math.floor(balance / proCost).toLocaleString()} Deep Analyses`,
      icon: <Target className="w-4 h-4 text-blue-500" />,
      desc: "Using Gemini 1.5 Pro (Max Forensic Accuracy)"
    },
    {
      label: "Daily Allowance",
      value: `$${(balance / 30).toFixed(2)} / Day`,
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
      desc: "30-Day Sustained Operation Budget"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % stats.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass metropolis-glow p-4 rounded-2xl flex items-center gap-6 overflow-hidden relative border border-white/5">
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 rounded-xl border border-white/5 z-10 shrink-0">
         <AlertCircle className="w-4 h-4 text-orange-600 animate-pulse" />
         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Forecast</span>
      </div>

      <div className="h-10 relative flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="absolute inset-0 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
               <div className="p-2 bg-white/5 rounded-lg">
                  {stats[index].icon}
               </div>
               <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{stats[index].label}</p>
                  <p className="text-xl font-black italic text-white tracking-tighter uppercase">{stats[index].value}</p>
               </div>
            </div>
            
            <div className="hidden md:block text-right pr-4">
               <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{stats[index].desc}</p>
               <div className="flex justify-end gap-1 mt-1">
                  {stats.map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${i === index ? 'bg-orange-500 w-4' : 'bg-zinc-800'} transition-all duration-300`}></div>
                  ))}
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
