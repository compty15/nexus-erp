'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
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

export default function Home() {
  const { engine } = useEngine();
  const { addNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // React Query for bulletproof data fetching
  const { data: items = [], isLoading, error } = useInventory();
  
  // Zustand for Job State
  const pendingJobs = useQueueStore((state) => state.pendingJobs);
  
  // Local UI State for Modals
  const [activeItem, setActiveItem] = React.useState<any>(null);
  const [modalMode, setModalMode] = React.useState<'none' | 'sold' | 'list'>('none');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      addNotification({ 
        type: 'info', 
        title: 'Upload Started', 
        message: 'Compressing and processing images...',
        duration: 3000
      });

      // Hand off to the Orchestrator
      // This will survive component unmounts and handles the heavy lifting
      await JobOrchestrator.startInventoryScan(files, 'BRANCH_A_PROD', engine);

    } catch (err: any) {
      addNotification({ 
        type: 'error', 
        title: 'Scan Failed', 
        message: err.message || 'An unexpected error occurred.' 
      });
    }
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (error) {
    return <div className="text-red-500 p-8">Failed to load inventory: {error.message}</div>;
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
          
          <button 
            onClick={triggerFileSelect}
            className="group relative flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-bold text-black transition-all hover:bg-gray-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
          >
            <Camera className="h-5 w-5" />
            Launch Scanner
            <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-white/20 blur-xl group-hover:bg-white/40" />
          </button>
          
          <input 
            type="file" 
            accept="image/*" 
            multiple
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </div>
      </section>

      {/* Item Grid */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Branch Inventory</h2>
        </div>
      </div>

      {isLoading ? (
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
          {items.filter(i => i.status !== 'sold').map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <div className="group relative">
                <ItemCard 
                  item={{
                    ...item,
                    cost: `$${item.cost_metadata?.last_scan_cost?.toFixed(2) || '0.00'}`,
                    totalCost: `$${item.cost_metadata?.total_scan_cost?.toFixed(2) || '0.00'}`,
                    weight: item.weight_raw ?? undefined,
                    length: item.length_in ?? undefined,
                    width: item.width_in ?? undefined,
                    height: item.height_in ?? undefined,
                    image: item.image_refs?.[0] || null
                  }} 
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setActiveItem(item); setModalMode('list'); }}
                    className="p-2 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-500"
                  >
                    List
                  </button>
                  <button 
                    onClick={() => { setActiveItem(item); setModalMode('sold'); }}
                    className="p-2 rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-500"
                  >
                    Sold
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modals */}
      {modalMode === 'sold' && activeItem && (
        <MarkAsSoldModal
          item={activeItem}
          defaultFeePercent={13.25} // Should fetch from settings
          onConfirm={(data) => {
            // Placeholder: React Query Mutation here
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
            />
          </div>
        </div>
      )}
    </div>
  );
}
