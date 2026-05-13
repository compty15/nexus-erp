'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Plus, 
  BarChart3, 
  History, 
  ArrowUpRight, 
  TrendingUp, 
  Activity,
  Package,
  AlertCircle
} from 'lucide-react';
import ItemCard from '@/components/ui/ItemCard';
import { useEngine } from '@/lib/engine-context';
import { useNotifications } from '@/lib/notifications';
import BatchConfirmation from '@/components/inventory/BatchConfirmation';
import MarkAsSoldModal from '@/components/inventory/MarkAsSoldModal';
import ListingAssistant from '@/components/inventory/ListingAssistant';
import { supabase } from '@/lib/supabase';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const { engine } = useEngine();
  const { addNotification } = useNotifications();
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [items, setItems] = useState<any[]>([]);
  const [batchData, setBatchData] = useState<{ images: string[], groups: any[] } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'none' | 'sold' | 'list'>('none');

  useEffect(() => {
    fetchItems();
    fetchSettings();

    const channel = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchSettings() {
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();
    if (data) setSettings(data);
  }

  async function fetchItems() {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems(data);
  }

  const stats = [
    { label: 'Total Value', value: '$124,500', trend: '+12%', icon: TrendingUp },
    { label: 'AI Burn Rate', value: '$2.45', trend: 'Daily', icon: Activity },
    { label: 'Active Items', value: '1,284', trend: 'Global', icon: Package },
  ];

  const handleQuickScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);
    setScanStatus('scanning');

    try {
      if (files.length > 1) {
        // Handle Batch Grouping
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        
        const res = await fetch('/api/inventory/group', { method: 'POST', body: formData });
        const data = await res.json();
        
        // Convert files to base64 for preview
        const previews = await Promise.all(files.map(f => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(f);
        })));

        setBatchData({ images: previews, groups: data.groups });
      } else {
        // Single Scan - Direct to Job
        await startScanJob(files);
      }
    } catch (err) {
      addNotification({ type: 'error', title: 'Processing Failed', message: 'Could not categorize batch.' });
      setScanStatus('error');
    }
  };

  const startScanJob = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('file', f));
    formData.append('model', engine);
    formData.append('branch_id', 'BRANCH_A_PROD'); // Default for demo

    const res = await fetch('/api/inventory/scan', { method: 'POST', body: formData });
    const { jobId } = await res.json();

    addNotification({ 
      type: 'info', 
      title: 'Scan Started', 
      message: `Analyzing ${files.length} photo(s) in background.`,
      duration: 3000
    });

    setScanStatus('idle');
    setBatchData(null);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-8">
      {/* Quota Warning Banner */}
      {healthWarning && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="rounded-xl bg-red-500/10 border border-red-500/50 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Daily AI Quota approaching limit. Defaulting to Flash-Lite.</p>
          </div>
          <button className="text-xs font-bold text-red-400 underline uppercase tracking-widest">Upgrade</button>
        </motion.div>
      )}

      {/* Hero / Quick Scan Section */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-full lg:col-span-2">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-900/20">
            <div className="relative z-10 flex h-full flex-col justify-between space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Inventory Nexus</h1>
                <p className="mt-2 text-blue-100 opacity-80">Identify, catalog, and monetize your assets with precision AI.</p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleQuickScan}
                />
                <button 
                  onClick={triggerFileSelect}
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-600 shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <Camera className="h-5 w-5" />
                  Quick Scan (Mobile)
                </button>
                <button className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                  <Plus className="h-5 w-5" />
                  Manual Entry
                </button>
              </div>
            </div>
            
            {/* Background Decorative Element */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Live Metrics</h2>
            <button className="text-xs font-medium text-blue-400 hover:underline">Full Dashboard</button>
          </div>
          <div className="grid gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between rounded-2xl border border-[#333] bg-[#1a1a1a] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#333] p-2">
                    <stat.icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">{stat.label}</p>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-400">{stat.trend}</span>
                  <ArrowUpRight className="ml-1 inline h-3 w-3 text-emerald-400" />
                </div>
              </motion.div>
            ))}
          </div>
        {/* Mark as Sold Modal */}
      {modalMode === 'sold' && activeItem && (
        <MarkAsSoldModal
          item={activeItem}
          defaultFeePercent={settings?.default_fee_percent || 13.25}
          onConfirm={async (data) => {
            const { error } = await supabase
              .from('inventory')
              .update(data)
              .eq('id', activeItem.id);
            
            if (error) {
              addNotification({ type: 'error', title: 'Update Failed', message: error.message });
            } else {
              addNotification({ type: 'success', title: 'Item Sold!', message: `Recorded sale for $${data.sold_price}` });
              setModalMode('none');
              setActiveItem(null);
            }
          }}
          onCancel={() => {
            setModalMode('none');
            setActiveItem(null);
          }}
        />
      )}

      {/* Listing Assistant Modal */}
      {modalMode === 'list' && activeItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl">
            <div className="mb-4 flex justify-end">
              <button 
                onClick={() => { setModalMode('none'); setActiveItem(null); }}
                className="rounded-full bg-[#222] p-2 text-white hover:bg-[#333]"
              >
                Close Assistant
              </button>
            </div>
            <ListingAssistant 
              item={activeItem} 
              drafts={activeItem.metadata?.drafts || {
                ebay: { title: activeItem.name, description: 'Optimizing description...', price: activeItem.price_range?.max || 0, specs: '' },
                fb: { title: activeItem.name, description: 'Optimizing description...', price: activeItem.price_range?.max || 0, specs: '' },
                etsy: { title: activeItem.name, description: 'Optimizing description...', price: activeItem.price_range?.max || 0, specs: '' },
                shopify: { title: activeItem.name, description: 'Optimizing description...', price: activeItem.price_range?.max || 0, specs: '' }
              }} 
            />
          </div>
        </div>
      )}

      {/* Item Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Branch Inventory</h2>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            View All <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {items.filter(i => i.status !== 'sold').map((item, i) => (
            <motion.div key={item.id} variants={itemVariants}>
              <div className="group relative">
                <ItemCard 
                  unitSystem={settings?.unit_system || 'imperial'}
                  item={{
                    ...item,
                    cost: `$${item.cost_metadata?.last_scan_cost?.toFixed(2) || '0.00'}`,
                    totalCost: `$${item.cost_metadata?.total_scan_cost?.toFixed(2) || '0.00'}`,
                    weight: item.weight_raw,
                    length: item.length_in,
                    width: item.width_in,
                    height: item.height_in,
                    image: item.image_refs?.[0] ? `/api/drive/view/${item.image_refs[0]}` : null
                  }} 
                />
                {/* Overlay buttons to trigger parent modals */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setActiveItem(item); setModalMode('list'); }}
                    className="p-2 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-500"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => { setActiveItem(item); setModalMode('sold'); }}
                    className="p-2 rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-500"
                  >
                    <DollarSign className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Business Branch Overview */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <h2 className="text-xl font-bold text-white">Branches</h2>
          </div>
          
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#333] bg-[#1a1a1a] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Production Wing</h4>
                  <p className="text-xs text-gray-500">Garage / Workshop</p>
                </div>
                <div className="h-8 w-8 rounded-full border border-emerald-500/20 bg-emerald-500/10 p-1.5">
                  <div className="h-full w-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Tooling Wear</span>
                  <span className="text-white font-mono">12%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#333]">
                  <div className="h-full w-[12%] bg-blue-400" />
                </div>
                <div className="flex justify-between text-xs pt-2">
                  <span className="text-gray-400">Electricity (Mo)</span>
                  <span className="text-white font-mono">$42.15</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#333] bg-[#1a1a1a] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Sales & Liquidation</h4>
                  <p className="text-xs text-gray-500">eBay / FB Marketplace</p>
                </div>
                <div className="h-8 w-8 rounded-full border border-blue-500/20 bg-blue-500/10 p-1.5">
                  <div className="h-full w-full rounded-full bg-blue-500" />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#252525] p-3">
                  <p className="text-[10px] text-gray-500">Monthly Rev</p>
                  <p className="text-sm font-bold text-white">$4,820</p>
                </div>
                <div className="rounded-xl bg-[#252525] p-3">
                  <p className="text-[10px] text-gray-500">Shipping Vol</p>
                  <p className="text-sm font-bold text-white">24 Units</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
