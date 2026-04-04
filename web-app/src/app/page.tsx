'use client';
import { useEffect, useState } from 'react';
import { Anchor, Cpu, Gauge, Search, Tag, FileText, ChevronRight } from "lucide-react";

export default function Home() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/units')
      .then(res => res.json())
      .then(data => {
        setUnits(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative py-16 px-8 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-dot-grid opacity-20"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-100 mb-4 leading-none">
            Precision Archive. <br/><span className="text-orange-500">Inventory Dashboard.</span>
          </h2>
          <p className="text-zinc-400 mb-8 max-w-lg text-sm font-medium">
             Your shop’s central command for antique and vintage metrology equipment. Every tool here is backed by deep AI research from Minnesota-local and global sources.
          </p>
          <div className="flex gap-4">
             <div className="bg-zinc-950 px-6 py-3 border border-zinc-800 rounded-sm flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">AI Agent Listening...</span>
             </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-600 border-b border-zinc-800 pb-4">Latest Research Units</h3>
      
      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 grayscale animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-zinc-900 rounded-lg border border-zinc-800"></div>)}
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
          {units.map((unit) => (
            <div key={unit.unit_id} className="group bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all">
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest bg-zinc-950 p-1 rounded inline-block border border-zinc-800 mb-2"># {unit.unit_id}</p>
                    <h3 className="text-xl font-bold tracking-tight text-white mb-1 group-hover:text-orange-500 transition-colors uppercase italic">{unit.product.brand} {unit.product.model}</h3>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase opacity-70 mb-4">{unit.product.name}</p>
                  </div>
                </div>

                <div className="space-y-2 pb-4 border-b border-zinc-800/50">
                   <div className="flex justify-between text-[10px] uppercase font-mono">
                      <span className="text-zinc-600">Fair Market:</span>
                      <span className="text-zinc-300 font-bold tracking-widest">${unit.market_analysis.pricing_tiers.fair_market.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-[10px] uppercase font-mono">
                      <span className="text-zinc-600">Collector Value:</span>
                      <span className="text-zinc-300 font-bold tracking-widest">${unit.market_analysis.pricing_tiers.collector_boutique.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-[10px] uppercase font-mono">
                      <span className="text-zinc-600">Quick Sell (MN):</span>
                      <span className="text-orange-500/80 font-bold tracking-widest">${unit.market_analysis.pricing_tiers.quick_sell.toFixed(2)}</span>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono uppercase">
                      <FileText size={12} className="text-blue-500" />
                      {unit.market_analysis.sources.length} Sources Found
                   </div>
                   <button className="bg-zinc-800 p-2 rounded-full hover:bg-orange-500 group-hover:bg-orange-500 transition-all text-white">
                      <ChevronRight size={16} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-20 p-10 bg-zinc-950/30 border border-zinc-900 rounded-lg text-center">
         <p className="text-xs font-mono text-zinc-700 uppercase tracking-widest">Awaiting new snapshots from field agent...</p>
      </div>
    </div>
  );
}
