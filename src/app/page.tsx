'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  Camera, 
  History,
  Sparkles,
  Square
} from 'lucide-react';
import ItemCard from '@/components/ui/ItemCard';
import { useEngine } from '@/lib/engine-context';
import { useNotifications } from '@/lib/notifications';
import { JobOrchestrator } from '@/features/jobs/orchestrator';
import { useInventory } from '@/features/inventory/useInventory';
import { useQueueStore } from '@/shared/lib/store';
import MarkAsSoldModal from '@/components/inventory/MarkAsSoldModal';
import ListingAssistant from '@/components/inventory/ListingAssistant';
import ItemDetailsModal from '@/components/inventory/ItemDetailsModal';
import AddByDescriptionModal from '@/components/inventory/AddByDescriptionModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

import { useModelStats } from '@/features/analytics/useModelStats';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function Home() {
  const { engine } = useEngine();
  const { addNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = React.useState<'inventory' | 'analytics'>('inventory');
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // React Query for bulletproof data fetching
  const { data: items = [], isLoading: isInvLoading, error: invError } = useInventory();
  const { data: modelStats = [], isLoading: isStatsLoading } = useModelStats();
  
  // Zustand for Job State
  const pendingJobs = useQueueStore((state) => state.pendingJobs);
  
  // Local UI State for Modals
  const [activeItem, setActiveItem] = React.useState<any>(null);
  const [modalMode, setModalMode] = React.useState<'none' | 'sold' | 'list' | 'details' | 'quick-add'>('none');
  const [expandedErrorJobId, setExpandedErrorJobId] = React.useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (rest of handleFileSelect remains same)
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      addNotification({ 
        type: 'info', 
        title: 'Upload Started', 
        message: 'Compressing and processing images...',
        duration: 3000
      });

      await JobOrchestrator.startInventoryScan(files, 'BRANCH_A_PROD', engine);

    } catch (err: any) {
      addNotification({ 
        type: 'error', 
        title: 'Scan Failed', 
        message: err.message || 'An unexpected error occurred.' 
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isMounted) return null;

  if (invError) {
    return <div className="text-red-500 p-8">Failed to load inventory: {invError.message}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 pb-24 md:px-8">
      {/* Dashboard Shortcuts */}
      <section className="mb-12 mt-4">
        <h2 className="mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-titanium-600 px-2">Navigation Nodes</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Sales Dashboard', href: '/inventory/sold', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/20' },
            { label: 'Financial Ledger', href: '/ledger', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/20' },
            { label: 'Fulfillment', href: '/shipping', icon: Package, icon2: ArrowUpRight, color: 'text-purple-400', bg: 'bg-purple-400/5', border: 'border-purple-400/20' },
            { label: 'System Configuration', href: '/settings', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/20' },
          ].map((node) => (
            <motion.a
              key={node.href}
              href={node.href}
              whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.03)' }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col gap-4 rounded-3xl border ${node.border} ${node.bg} p-6 transition-all duration-300 backdrop-blur-sm group`}
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl bg-black/40 p-2 border border-white/5`}>
                  <node.icon className={`h-5 w-5 ${node.color}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-titanium-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white">{node.label}</p>
                <p className="mt-1 text-[8px] font-bold text-titanium-500 uppercase tracking-tighter">Access Module</p>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Scanner Section */}
      <section className="mb-12 relative overflow-hidden rounded-[40px] titanium-panel p-8 md:p-12 shadow-2xl">
        {/* Animated Flow Overlay for the panel */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="mb-6 rounded-full bg-titanium-400/10 p-4 border border-white/10 backdrop-blur-md">
            <Camera className="h-8 w-8 text-titanium-300" />
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tighter text-white md:text-5xl lg:text-7xl uppercase italic">
            Nexus Intelligence
          </h1>
          <p className="mb-10 max-w-xl text-xs font-black uppercase tracking-[0.4em] text-titanium-500">
            Secure / Offline / Metrology / Gemini 3
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <button 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
              className="group relative flex items-center gap-3 rounded-full bg-white px-10 py-5 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-titanium-200 hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] active:scale-95"
            >
              <Camera className="h-4 w-4" />
              Direct Scan
              <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-white/10 blur-2xl group-hover:bg-white/20" />
            </button>

            <button 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
              className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-10 py-5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 active:scale-95 backdrop-blur-md"
            >
              <History className="h-4 w-4" />
              Load Archive
            </button>

            <button 
              onClick={() => setModalMode('quick-add')}
              className="group flex items-center gap-3 rounded-full border border-blue-500/30 bg-blue-500/10 px-10 py-5 text-xs font-black uppercase tracking-widest text-blue-400 transition-all hover:bg-blue-500/20 hover:border-blue-500/50 active:scale-95 backdrop-blur-md shadow-[0_0_40px_rgba(59,130,246,0.1)]"
            >
              <Sparkles className="h-4 w-4" />
              Quick Add
            </button>
          </div>
          
          <input 
            type="file" 
            accept="image/*,video/*,audio/*,application/pdf,.heic,.heif,.dng" 
            multiple
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </div>
      </section>

      {/* View Switcher Tabs */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 w-fit">
          <button 
            onClick={() => setView('inventory')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              view === 'inventory' ? 'bg-gradient-to-br from-titanium-700 to-titanium-900 text-white shadow-xl border border-white/10' : 'text-titanium-500 hover:text-titanium-300'
            }`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setView('analytics')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              view === 'analytics' ? 'bg-gradient-to-br from-titanium-700 to-titanium-900 text-white shadow-xl border border-white/10' : 'text-titanium-500 hover:text-titanium-300'
            }`}
          >
            Financials
          </button>
        </div>

        <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full">
          <Activity className="h-3 w-3 text-white animate-pulse" />
          <span className="text-[8px] font-black text-titanium-400 uppercase tracking-[0.3em]">
            Branch: Alpha-7 (Production)
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'inventory' ? (
          <motion.div 
            key="inventory"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {isInvLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-64 rounded-3xl bg-[#111] animate-pulse border border-[#222]" />
                ))}
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {/* Pending & Failed Jobs Display */}
                {pendingJobs.filter(j => j.status !== 'completed').map(job => (
                  <motion.div key={job.id} variants={itemVariants}>
                    <div className={`flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 transition-all ${
                      job.status === 'failed' ? 'border-red-500/50 bg-red-500/5' : 'border-blue-500/30 bg-blue-500/5 animate-pulse'
                    }`}>
                      {job.status === 'failed' ? (
                        <>
                          <div className="mb-4 rounded-full bg-red-500/10 p-3">
                            <Activity className="h-8 w-8 text-red-500" />
                          </div>
                          <p className="text-sm font-bold text-red-400 text-center">Operation Failed</p>
                          <div className="relative w-full">
                            <p className={`text-[10px] text-red-300/60 mt-1 text-center px-2 leading-relaxed select-text cursor-text ${expandedErrorJobId === job.id ? '' : 'line-clamp-3'}`}>
                              {job.error || 'The intelligence stream was interrupted.'}
                            </p>
                            {job.error && job.error.length > 50 && (
                              <button 
                                onClick={() => setExpandedErrorJobId(expandedErrorJobId === job.id ? null : job.id)}
                                className="mt-2 w-full text-[8px] font-black uppercase tracking-[0.2em] text-red-400/40 hover:text-red-400 transition-all border-t border-red-500/10 pt-2"
                              >
                                {expandedErrorJobId === job.id ? 'Hide Details' : 'View Full Error'}
                              </button>
                            )}
                          </div>
                          
                          <div className="mt-6 w-full border-t border-white/5 pt-4">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-titanium-500 mb-3 text-center italic">Select Recovery Engine:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'flash-1.5', label: 'FLS-1.5', speed: 'CHEAPEST' },
                                { id: 'flash', label: 'FLS-2.5', speed: 'FAST' },
                                { id: 'flash-3.5', label: 'FLS-3.5', speed: 'NEWEST' },
                                { id: 'pro-1.5', label: 'PRO-1.5', speed: 'BALANCED' },
                                { id: 'pro-2.5', label: 'PRO-2.5', speed: 'SMART' },
                                { id: 'pro-3.1', label: 'PRO-3.1', speed: 'ELITE' },
                              ].map((m) => (
                                <button
                                  key={m.id}
                                  onClick={() => JobOrchestrator.retryInventoryScan(job.id, m.id, 'BRANCH_A_PROD')}
                                  className="flex flex-col items-center rounded-xl bg-white/5 border border-white/5 py-2 px-1 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                                >
                                  <span className="text-[10px] font-black text-white">{m.label}</span>
                                  <span className="text-[7px] font-bold text-titanium-600 uppercase">{m.speed}</span>
                                </button>
                              ))}
                            </div>
                            
                            <button 
                              onClick={() => useQueueStore.getState().removeJob(job.id)}
                              className="mt-4 w-full rounded-xl bg-red-500/10 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-red-400/60 hover:text-red-400 transition-all"
                            >
                              Abandon Task
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Activity className="h-10 w-10 text-blue-500 mb-4" />
                          <p className="text-sm font-medium text-blue-400 text-center">
                            {job.type === 'text_extrapolation' 
                              ? 'Extrapolating item data...' 
                              : `Processing ${job.payload?.fileCount} item(s)...`}
                          </p>
                          <p className="text-[10px] text-blue-400/50 mt-1 uppercase tracking-widest font-black">
                            {job.status}
                          </p>
                          
                          <button 
                            onClick={() => JobOrchestrator.cancelJob(job.id)}
                            className="mt-6 flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/5 px-6 py-2 text-[8px] font-black uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/50 active:scale-95"
                          >
                            <Square className="h-3 w-3 fill-current" />
                            Stop Task
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Actual Items */}
                {items.filter(i => i.status !== 'sold' && i.status !== 'deleted').map((item) => (
                  <motion.div key={item.id} variants={itemVariants}>
                    <div className="group relative">
                      <ItemCard 
                        onList={() => { setActiveItem(item); setModalMode('list'); }}
                        onSold={() => { setActiveItem(item); setModalMode('sold'); }}
                        onDetails={() => { setActiveItem(item); setModalMode('details'); }}
                        item={{
                          ...item,
                          name: item.name ?? 'Unknown Item',
                          brand: item.brand ?? 'Unknown Brand',
                          category: item.category ?? 'Uncategorized',
                          price: item.price_range ? `$${item.price_range.min} - $${item.price_range.max}` : 'Unknown',
                          cost: `$${item.cost_metadata?.last_scan_cost?.toFixed(2) || '0.00'}`,
                          totalCost: `$${item.cost_metadata?.total_scan_cost?.toFixed(2) || '0.00'}`,
                          weight_raw: item.weight_raw ?? undefined,
                          length_in: item.length_in ?? undefined,
                          width_in: item.width_in ?? undefined,
                          height_in: item.height_in ?? undefined,
                          image: item.image_refs?.[0] || null,
                          image_refs: item.image_refs || [],
                          ebay_description: item.metadata?.drafts?.ebay?.description
                        }} 
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AnalyticsDashboard 
              inventory={items} 
              modelStats={modelStats} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {modalMode === 'sold' && activeItem && (
        <MarkAsSoldModal
          item={activeItem}
          defaultFeePercent={13.25} 
          onConfirm={(data) => {
            setModalMode('none');
          }}
          onCancel={() => setModalMode('none')}
        />
      )}

      {modalMode === 'list' && activeItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl">
            <div className="mb-4 flex justify-end">
              <button 
                onClick={() => setModalMode('none')}
                className="rounded-full bg-[#222] p-2 text-white hover:bg-[#333]"
              >
                Close
              </button>
            </div>
            <ListingAssistant 
              item={activeItem} 
              drafts={activeItem.metadata?.drafts || {}} 
              onStatusUpdate={() => setModalMode('none')}
            />
          </div>
        </div>
      )}
      {modalMode === 'details' && activeItem && (
        <ItemDetailsModal 
          item={activeItem} 
          onClose={() => setModalMode('none')} 
        />
      )}
      {modalMode === 'quick-add' && (
        <AddByDescriptionModal 
          onClose={() => setModalMode('none')} 
        />
      )}
    </div>
  );
}
