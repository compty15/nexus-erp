'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  Camera, 
  History
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
  const [modalMode, setModalMode] = React.useState<'none' | 'sold' | 'list' | 'details'>('none');

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
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Scanner Section */}
      <section className="mb-12 relative overflow-hidden rounded-[40px] border border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a] p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="mb-6 rounded-full bg-blue-500/10 p-4">
            <Camera className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
            Nexus Intelligence
          </h1>
          <p className="mb-8 max-w-xl text-lg text-gray-400">
            Secure, offline-ready metrology scanning. Powered by Gemini.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <button 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
              className="group relative flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-bold text-black transition-all hover:bg-gray-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
            >
              <Camera className="h-5 w-5" />
              Direct Camera
              <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-white/20 blur-xl group-hover:bg-white/40" />
            </button>

            <button 
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
              className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10 active:scale-95"
            >
              <History className="h-5 w-5" />
              Photo Gallery
            </button>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            multiple
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </div>
      </section>

      {/* View Switcher Tabs */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex p-1 bg-[#111] rounded-2xl border border-[#222] w-fit">
          <button 
            onClick={() => setView('inventory')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              view === 'inventory' ? 'bg-[#222] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setView('analytics')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              view === 'analytics' ? 'bg-[#222] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Financials
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            Branch: Branch A (Production)
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
                {/* Pending Jobs Display */}
                {pendingJobs.filter(j => j.status !== 'completed' && j.status !== 'failed').map(job => (
                  <motion.div key={job.id} variants={itemVariants}>
                     <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-500/30 bg-blue-500/5 animate-pulse p-6">
                      <Activity className="h-10 w-10 text-blue-500 mb-4" />
                      <p className="text-sm font-medium text-blue-400">Processing {job.payload?.fileCount} item(s)...</p>
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
                          weight: item.weight_raw ?? undefined,
                          length: item.length_in ?? undefined,
                          width: item.width_in ?? undefined,
                          height: item.height_in ?? undefined,
                          image: item.image_refs?.[0] || null
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
    </div>
  );
}
