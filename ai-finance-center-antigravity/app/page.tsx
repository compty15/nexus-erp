'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import FinanceGauge from '../components/FinanceGauge';
import { LayoutDashboard, ShieldCheck, Zap, Globe, Coins, ReceiptText } from 'lucide-react';
import BudgetTicker from '../components/BudgetTicker';
import StatusBanner from '../components/StatusBanner';

interface BillingStatus {
  total_budget: number;
  remaining_balance: number;
  total_spent: number;
  last_usage: string;
}

interface SystemStatus {
  state: 'Active' | 'Locked';
  reason?: string;
  last_updated: string;
}

export default function FinanceHub() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [projectId] = useState('shanalcavityspace');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      // Fetch Billing
      const { data: bData } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('id', 'billing_status')
        .single();
      if (bData) setBilling(bData.config_value);

      // Fetch System Status
      const { data: sData } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('id', 'system_status')
        .single();
      if (sData) setSystemStatus(sData.config_value);
    }

    fetchData();

    const sub = supabase
      .channel('config_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_config' }, (payload) => {
        if (payload.new.id === 'billing_status') setBilling(payload.new.config_value);
        if (payload.new.id === 'system_status') setSystemStatus(payload.new.config_value);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  const getGeminiEstimate = () => {
    if (!billing) return 'Calculating...';
    let avg = 0.10; 
    if (selectedModel.includes('pro')) avg = 1.25;
    const count = Math.floor(billing.remaining_balance / avg);
    return `≈ ${count.toLocaleString()} ${selectedModel.includes('pro') ? 'Pro' : 'Flash'} Scans`;
  };

  const handleManualHeartbeat = async () => {
    // This would trigger a test call in a real implementation
    console.log('Manual heartbeat triggered...');
  };

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto space-y-12 pb-24">
      <StatusBanner 
        status={systemStatus?.state || 'Active'} 
        reason={systemStatus?.reason} 
        onRefresh={handleManualHeartbeat}
      />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 relative">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.4)]">
                <LayoutDashboard className="w-5 h-5 text-white" />
             </div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Metropolis Intelligence</h4>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
            Finance <span className="text-orange-500 underline decoration-zinc-800 underline-offset-8">Hub</span>
          </h1>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-3 bg-zinc-950 px-4 py-2 rounded-xl border border-white/5">
             <Globe className="w-4 h-4 text-zinc-700" />
             <span className="text-xs font-mono text-zinc-400">{projectId}</span>
             <div className={`w-2 h-2 rounded-full ${systemStatus?.state === 'Locked' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 animate-pulse'}`}></div>
          </div>
          <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck className="w-3 h-3" /> {systemStatus?.state === 'Locked' ? 'System Restricted' : 'Secure Accounting Tunnel Active'}
          </p>
        </div>
      </header>

      {/* Primary Gauges */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceGauge 
          title="Gemini API Studio"
          type="funds"
          current={billing?.remaining_balance || 0}
          total={billing?.total_budget}
          subtext={getGeminiEstimate()}
          project="Default Project"
          status={systemStatus?.state === 'Locked' ? 'critical' : 'active'}
        />
        
        <FinanceGauge 
          title="Google Cloud Platform"
          type="cost"
          current={1.15} 
          subtext="April 2026 Accrual"
          project="shanalcavityspace"
        />

        <FinanceGauge 
          title="Intelligence Pool"
          type="funds"
          current={0}
          total={0}
          status="warning"
          subtext="Connect Anthropic/OpenAI"
          project="External APIs"
        />
      </section>

      {/* Sustained Run Projection */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass metropolis-glow p-8 rounded-[2rem] border border-white/5 space-y-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="w-24 h-24 text-orange-500" />
           </div>
           
           <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Sustainability Forecast</h4>
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">24-Hour <span className="text-orange-500">Burn</span></h2>
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Efficiency Mode (Flash)</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-black text-white italic">$0.72</span>
                       <span className="text-[10px] font-bold text-zinc-700 uppercase">/ 24 hrs</span>
                    </div>
                 </div>
                 <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-500/30"></div>
                 </div>
                 <p className="text-[10px] font-bold text-emerald-500 uppercase">{(billing?.remaining_balance || 0) > 0.72 ? "Sustained" : "Insufficient funds"}</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Precision Mode (Pro)</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-black text-white italic">$9.00</span>
                       <span className="text-[10px] font-bold text-zinc-700 uppercase">/ 24 hrs</span>
                    </div>
                 </div>
                 <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-rose-500/30"></div>
                 </div>
                 <p className="text-[10px] font-bold text-rose-500 uppercase">
                    {Math.floor(((billing?.remaining_balance || 0) / 0.375)).toLocaleString()} Min Runway
                 </p>
              </div>
           </div>
        </div>

        <div className="glass metropolis-glow p-8 rounded-[2rem] border border-white/5 flex flex-col justify-between">
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Infrastructure Capacity</h4>
                 <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Data Flow Estimates</span>
                 </div>
              </div>
              
              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Max Identification Rate</p>
                       <p className="text-2xl font-black text-white tracking-tighter">1,440 <span className="text-zinc-600 italic font-bold text-sm">Tools / Day</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Projected Traffic</p>
                       <p className="text-2xl font-black text-white tracking-tighter">~8.6 <span className="text-zinc-600 italic font-bold text-sm">GB / Day</span></p>
                    </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-orange-500 blur-[2px] animate-pulse"></div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-relaxed">
                          Your current balance of <span className="text-white">${billing?.remaining_balance?.toFixed(2)}</span> provides approximately 
                          <span className="text-white ml-1">{Math.floor((billing?.remaining_balance || 0) / (0.375 / 60)).toLocaleString()} hours</span> of continuous high-precision processing.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Budget Forecast Ticker */}
      <BudgetTicker balance={billing?.remaining_balance || 0} />

      {/* Detailed Cost Breakdown */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <ReceiptText className="w-5 h-5 text-zinc-500" />
           <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Cost Breakdown</h2>
        </div>

        <div className="glass metropolis-glow rounded-3xl overflow-hidden border border-white/5">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">Service SKU</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">Unit Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">Pricing (In/Out)</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5 text-right">Est. Yield</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5 font-bold text-white">Gemini 1.5 Pro</td>
                  <td className="px-6 py-5 text-zinc-400">1M Tokens</td>
                  <td className="px-6 py-5 text-zinc-400 font-mono italic text-xs">$1.25 / $5.00</td>
                  <td className="px-6 py-5 text-right font-black text-white italic">≈ 700 Snaps</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5 font-bold text-white">Gemini 1.5 Flash</td>
                  <td className="px-6 py-5 text-zinc-400">1M Tokens</td>
                  <td className="px-6 py-5 text-zinc-400 font-mono italic text-xs">$0.075 / $0.30</td>
                  <td className="px-6 py-5 text-right font-black text-white italic">≈ 11,000 Snaps</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5 font-bold text-white">Cloud Storage</td>
                  <td className="px-6 py-5 text-zinc-400">Standard (GB-month)</td>
                  <td className="px-6 py-5 text-zinc-400 font-mono italic text-xs">$0.02 per GB</td>
                  <td className="px-6 py-5 text-right font-black text-zinc-500 italic">Unlimited</td>
                </tr>
              </tbody>
           </table>
        </div>
        
        <div className="flex items-center justify-between px-6">
           <div className="flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-zinc-700" />
              <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Pricing data sourced from live billing link provided</p>
           </div>
           {mounted && (
             <p className="text-[10px] text-zinc-500 italic">Last Refreshed: {new Date().toLocaleTimeString()}</p>
           )}
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 py-4 px-8 flex justify-center items-center gap-8 z-50">
         <button className="text-[10px] font-black uppercase text-white border-b-2 border-orange-600 pb-1">Accounting Dash</button>
         <button className="text-[10px] font-bold uppercase text-zinc-600 hover:text-white transition-colors">Forensic Ledger</button>
         <button className="text-[10px] font-bold uppercase text-zinc-600 hover:text-white transition-colors">Budget Adjust</button>
      </footer>
    </main>
  );
}
